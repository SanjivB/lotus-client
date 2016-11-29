/* @copyright unseen, ehf */

'option strict';

var Enum = require('../enum'),
	Chunkers = require('./chunkers/index'),
	ChunkController = require('./chunk-controller');

module.exports = ChunkSender;

function ChunkSender(config, packetHelper, listeners, webAPI, callback) {
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

ChunkSender.prototype.start = function(param, content, dataPacketBuffer) {
	this.log.trace('start');
	this.param = param;
	this.param.blobId = this.param.blobId || null;
	this.param.chunkNo = this.param.chunkNo || 1;
	this.param.chunkCount = Math.ceil(this.param.Context.size / this.param.chunkSize);

	this.transferParam = {
		id: this.param.id,
		// maxSize: this.config.maxSize,
		blobId: this.param.blobId,
		chunkNo: this.param.chunkNo,
		sequenceNo: 0
	};

	// if (this.param.Context.size > this.config.maxSize) {
	// 	this.error('Data is larger than the maximum allowed size.');
	// 	return;
	// }

	this.dataPacketBuffer = dataPacketBuffer;
	this.chunkReader = Chunkers.newReader(this.config, this.param, this.transferParam, this.listeners, this.webAPI, content);

	if (this.transferParam.chunkNo == 1) {
		this.send(Enum.Pipe.Command.START_TRANSFER, false, this.param, this.dataPacketBuffer);
		if (this.callback) this.callback('Operation started', this.result());

	} else {
		this.nextChunk(this.transferParam);
	}
};

ChunkSender.prototype.autoPause = function() {
	this.log.trace('autoPause:', this.paused);
	if (!this.paused) {
		this.autoPaused = true;
		this.pause();
	}
}

ChunkSender.prototype.autoResume = function() {
	this.log.trace('autoResume:', this.autoPaused);
	if (this.autoPaused) {
		this.autoPaused = false;
		this.resume();
	}
}

ChunkSender.prototype.pause = function() {
	if (this.paused) return;
	this.log.trace('pause');
	this.paused = true;
	this.send(Enum.Pipe.Command.PAUSE_TRANSFER, false, this.transferParam);
};

ChunkSender.prototype.resume = function() {
	if (!this.paused) return;
	this.log.trace('resume');
	this.paused = false;
	this.param.blobId = this.transferParam.blobId;
	this.param.chunkNo = this.transferParam.chunkNo;
	this.send(Enum.Pipe.Command.RESUME_TRANSFER, false, this.param, this.dataPacketBuffer);
};

ChunkSender.prototype.nextChunk = function(transferParam) {
	if (this.paused) return;
	var self = this;

	if (transferParam.id !== this.transferParam.id) {
		this.error('ID mismatch:' + transferParam.id + ':' + this.transferParam.id);
		return;
	}

	// if (transferParam.sequenceNo !== this.transferParam.sequenceNo) {
	// 	this.error('Out of sequence:' + transferParam.sequenceNo + ':' + this.transferParam.sequenceNo);
	// 	return;
	// }

	if (transferParam.blobId) {
		this.transferParam.blobId = transferParam.blobId;
	}

	if (!this.chunkReader.eof()) {
		this.chunkReader.read(function(error, result, chunk) {
			self.send(Enum.Pipe.Command.TRANSFER, false, self.transferParam, chunk);
			if (self.callback) self.callback(null, self.result());
			self.transferParam.chunkNo++;
		});

	} else {
		this.send(Enum.Pipe.Command.END_TRANSFER, false, this.transferParam);
	}
};

ChunkSender.prototype.acknowledgeChunk = function(id, dataPacket) {
	if (id !== this.transferParam.id) {
		this.error('ID mismatch:' + id + ':' + this.transferParam.id);
		return;
	}

	this.chunkReader.acknowledgeChunk(dataPacket);
};

ChunkSender.prototype.error = function(error, sendError) {
	if (!sendError) {
		this.send(Enum.Pipe.Command.TRANSFER_ERROR, false, this.transferParam);
	}
	if (this.callback) this.callback(error, this.result(true));
	this.log.error(this.transferParam.id, error);
	if (!this.webAPI) {
		this.listeners.close(this.transferParam.id);
	}
};

ChunkSender.prototype.end = function() {
	this.log.trace('end:' + this.transferParam.id);
	this.send(Enum.Pipe.Command.END_TRANSFER, true, this.transferParam);
	this.listeners.close(this.transferParam.id);
};


ChunkSender.prototype.abort = function() {
	this.log.trace('abort');
	this.stopTimeout();
	if (this.callback) this.callback('Operation aborted', this.result(true));
};

ChunkSender.prototype.result = function(failed) {
	var result = null;

	if (failed) {
		this.param.chunkNo = this.transferParam.chunkNo;

		result = {
			param: this.param
		}

	} else if (this.chunkReader.bof()) {
		result = {
			id: this.transferParam.id,
			direction: Enum.ChunkHandler.Direction.SEND,
			percent: this.chunkReader.percentComplete(),
			controller: new ChunkController(this)
		};

	} else if (this.chunkReader.eof()) {
		this.param.chunkNo = this.transferParam.chunkNo;

		result = {
			id: this.transferParam.id,
			direction: Enum.ChunkHandler.Direction.SEND,
			param: this.param,
			percent: this.chunkReader.percentComplete()
		}

	} else {
		result = {
			id: this.transferParam.id,
			direction: Enum.ChunkHandler.Direction.SEND,
			percent: this.chunkReader.percentComplete()
		};
	}

	return result;
};

ChunkSender.prototype.send = function(command, acknowledge, param, payload) {
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

ChunkSender.prototype.retry = function(command, acknowledge, param, payload) {
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

ChunkSender.prototype.stopTimeout = function() {
	if (this.timeoutTimer) {
		clearTimeout(this.timeoutTimer);
		this.timeoutTimer = null;
	}
};

ChunkSender.prototype.startTimeout = function() {
	if (!this.timeoutTimer) {
		var self = this;

		this.timeoutTimer = setTimeout(function() {
			self.timeoutTimer = null;

			if (self.retryTimer) {
				clearTimeout(self.retryTimer);
				self.retryTimer = null;
			}

			self.error('Error.Opus.TIMEOUT');

		}, this.config.timeoutSecs * 1000);
	}
};