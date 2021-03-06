/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../enum'),
	Chunkers = require('./chunkers/index'),
	ChunkController = require('./chunk-controller');

module.exports = ChunkReceiver;

function ChunkReceiver(config, packetHelper, listeners, webAPI, callback) {
	this.config = config;
	this.packetHelper = packetHelper;
	this.listeners = listeners;
	this.webAPI = webAPI;
	this.log = this.listeners.log;
	this.callback = callback;
	this.paused = false;
	this.autoPaused = false;
	this.retryCount = 0;
}

ChunkReceiver.prototype.start = function(param, dataPacketBuffer) {
	this.param = param;
	if (dataPacketBuffer) {
		this.dataPacketBuffer = dataPacketBuffer;
	}

	if (this.param.Context) {
		this.transferParam = {
			id: this.param.id,
			blobId: this.param.blobId,
			chunkNo: this.param.chunkNo,
			sequenceNo: 0
		};

		this.chunkWriter = Chunkers.newWriter(this.config, this.param, this.transferParam, this.listeners, this.webAPI);
		this.send(Enum.Pipe.Command.START_TRANSFER, true, this.transferParam);
		if (this.callback) this.callback(null, this.result());
	}
};

ChunkReceiver.prototype.autoPause = function() {
	this.log.trace('autoPause:', this.paused);
	if (!this.paused) {
		this.autoPaused = true;
		this.pause();
	}
};

ChunkReceiver.prototype.autoResume = function() {
	this.log.trace('autoResume:', this.autoPaused);
	if (this.autoPaused) {
		this.autoPaused = false;
		this.resume();
	}
};

ChunkReceiver.prototype.pause = function() {
	if (this.paused) return;
	this.log.trace('pause');
	this.paused = true;
	this.send(Enum.Pipe.Command.PAUSE_TRANSFER, false, this.transferParam);
};

ChunkReceiver.prototype.resume = function() {
	if (!this.paused) return;
	this.log.trace('resume');
	this.paused = false;
	this.param.blobId = this.transferParam.blobId;
	this.param.chunkNo = this.transferParam.chunkNo + 1;
	this.send(Enum.Pipe.Command.RESUME_TRANSFER, true, this.param);
};

ChunkReceiver.prototype.cancel = function() {
	this.paused = true;
	this.send(Enum.Pipe.Command.CANCEL_TRANSFER, false, this.transferParam);
};

ChunkReceiver.prototype.executeCancel = function() {
	var self = this;
	this.chunkWriter.cancel(function(error) {
		if (!error) {
			self.send(Enum.Pipe.Command.CANCEL_TRANSFER, true, self.transferParam);
			if (self.callback) self.callback(null, self.result(true));

		} else {
			self.error('ChunkWriter:' + error.message);
		}
	});
};

ChunkReceiver.prototype.acknowledgeCancel = function(clientResponse) {
	this.chunkWriter.acknowledgeCancel(clientResponse);
};

ChunkReceiver.prototype.endCancel = function() {
	this.listeners.close(this.transferParam.id);
	if (this.callback) this.callback({
		code: 'OPERATION_CANCELLED'
	});
};

ChunkReceiver.prototype.end = function(callback) {
	this.send(Enum.Pipe.Command.END_TRANSFER, true, this.transferParam);
	if (callback) callback(this.result());
	this.listeners.close(this.transferParam.id);
};

ChunkReceiver.prototype.nextChunk = function(transferParam, chunk) {
	if (this.paused) return;
	var self = this;

	if (transferParam.id !== this.transferParam.id) {
		this.error('ID mismatch:' + transferParam.id + ':' + this.transferParam.id);
		return;
	}

	// if (transferParam.sequenceNo !== this.transferParam.sequenceNo + 1) {
	// 	this.error('Out of sequence:' + transferParam.sequenceNo + ':' + (this.transferParam.sequenceNo + 1));
	// 	return;
	// }

	this.transferParam.chunkNo = transferParam.chunkNo;
	this.chunkWriter.write(chunk, function(error, result) {
		if (!error) {
			if (result && result.blobId) {
				self.transferParam.blobId = result.blobId;
			}

			self.send(Enum.Pipe.Command.TRANSFER, true, self.transferParam);
			if (self.callback) self.callback(null, self.result());

		} else {
			self.error('ChunkWriter:' + error.message);
		}
	});
};

ChunkReceiver.prototype.acknowledgeChunk = function(id, clientResponse) {
	if (id !== this.transferParam.id) {
		this.error('ID mismatch:' + id + ':' + this.transferParam.id);
		return;
	}

	this.chunkWriter.acknowledgeChunk(clientResponse);
};

ChunkReceiver.prototype.error = function(error, sendError) {
	if (!sendError) {
		this.send(Enum.Pipe.Command.TRANSFER_ERROR, false, this.transferParam);
	}
	if (this.callback) this.callback(error, this.result(true));
	this.log.error(this.transferParam.id, error);
	if (!this.webAPI) {
		this.listeners.close(this.transferParam.id);
	}
};

ChunkReceiver.prototype.abort = function() {
	this.log.trace('abort');
	this.stopTimeout();
	if (this.callback) this.callback('Operation aborted', this.result(true));
};

ChunkReceiver.prototype.content = function() {
	switch (this.param.type) {
		case Enum.ChunkHandler.Type.FILE:
			return {
				dataPacketBuffer: this.dataPacketBuffer,
				blob: this.chunkWriter.content().blob
			}
			break;

		case Enum.ChunkHandler.Type.DATAPACKET:
		default:
			return {
				dataPacketBuffer: this.chunkWriter.content().blob
			};
			break;
	}
};

ChunkReceiver.prototype.result = function(failed) {
	var result = null;

	if (failed) {
		this.param.chunkNo = this.transferParam.chunkNo;

		result = {
			param: this.param,
		}

	} else if (this.chunkWriter.bof()) {
		result = {
			id: this.transferParam.id,
			direction: Enum.ChunkHandler.Direction.SEND,
			percent: this.chunkWriter.percentComplete(),
			controller: new ChunkController(this)
		};

	} else if (this.chunkWriter.eof()) {
		this.param.chunkNo = this.transferParam.chunkNo;

		result = {
			id: this.transferParam.id,
			direction: Enum.ChunkHandler.Direction.RECEIVE,
			blobId: this.chunkWriter.transferParam.blobId,
			param: this.param,
			content: this.content(),
			percent: this.chunkWriter.percentComplete()
		}

	} else {
		result = {
			id: this.transferParam.id,
			direction: Enum.ChunkHandler.Direction.RECEIVE,
			percent: this.chunkWriter.percentComplete()
		};
	}

	return result;
};

ChunkReceiver.prototype.send = function(command, acknowledge, param, payload) {
	if (this.listeners.pipe.ready()) {
		var flag = (acknowledge) ? Enum.Packet.IO.Flag.ACKNOWLEDGE : Enum.Packet.IO.Flag.NONE;

		this.listeners.pipe.send(this.packetHelper.writePipe(Enum.Pipe.EVP_VER, command, flag, ++this.transferParam.sequenceNo, param, payload));

		if (!this.webAPI) {
			switch (command) {
				case Enum.Pipe.Command.START_TRANSFER:
				case Enum.Pipe.Command.TRANSFER:
				case Enum.Pipe.Command.RESUME_TRANSFER:
					this.stopTimeout();
					this.startTimeout();
					break;

				case Enum.Pipe.Command.PAUSE_TRANSFER:
				case Enum.Pipe.Command.CANCEL_TRANSFER:
				case Enum.Pipe.Command.TRANSFER_ERROR:
				case Enum.Pipe.Command.END_TRANSFER:
					this.stopTimeout();
					break;
			}
		}

		this.retryCount = 0;

	} else {
		this.retry(command, acknowledge, param, payload);
	}
};

ChunkReceiver.prototype.retry = function(command, acknowledge, param, payload) {
	if (this.retryCount++ < this.config.maxRetries) {
		var self = this;
		this.retryTimer = setTimeout(function() {
			self.retryTimer = null;
			self.send(command, acknowledge, param, payload);
		}, this.config.retrySecs * 1000);

	} else {
		this.error('Error.Opus.MAX_RETRIES', true);
	}
};

ChunkReceiver.prototype.stopTimeout = function() {
	if (this.timeoutTimer) {
		clearTimeout(this.timeoutTimer);
		this.timeoutTimer = null;
	}
};

ChunkReceiver.prototype.startTimeout = function() {
	if (!this.timeoutTimer) {
		var self = this;

		this.timeoutTimer = setTimeout(function() {
			self.timeoutTimer = null;
			self.error('Error.Opus.TIMEOUT');

		}, this.config.timeoutSecs * 1000);
	}
};