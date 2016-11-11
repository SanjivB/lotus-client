/*
 * @copyright unseen, ehf
 */

/*
	param: {
		id: string
		type: Enum.ChunkHandler.Type
		chunkSize: int
		
		Context: {
			name: string
			type: string
			size: int
		}
	}

	Content: {
		blob: binary
		
		Cassandra: {
			Connection: {
				contactPoints: [
					'localhost'
				]

				queryOptions: {
					fetchSize: 100
					prepare: true
					autoPage: false
					consistency: 0x06 //types.consistencies.localQuorum
				}
			}
		}
	}
 */

'option strict';

var Enum = require('../enum'),
	ChunkSender = require('./chunk-sender'),
	ChunkReceiver = require('./chunk-receiver'),
	Chunkers = require('./chunkers/index');

module.exports = ChunkHandlers;

function ChunkHandlers(config, components, pipeListeners, webAPI) {
	this.config = config;
	this.packetHelper = components.packetHelper;

	this.log = {
		trace: this.trace.bind(this),
		error: this.error.bind(this)
	}

	this.listeners = {
		pipe: pipeListeners,
		log: this.log,
		close: this.close.bind(this)
	};

	this.webAPI = webAPI;
	this.items = {};
	this.count = 0;
}

ChunkHandlers.registerChunkers = function(MoreChunkers) {
	if (MoreChunkers.CassandraReader) Chunkers.CassandraReader = MoreChunkers.CassandraReader;
	if (MoreChunkers.CassandraWriter) Chunkers.CassandraWriter = MoreChunkers.CassandraWriter;
};

ChunkHandlers.prototype.item = function(id, silent) {
	var handler = this.items[id];
	if (handler) {
		return handler;

	} else {
		if (!silent) {
			this.log.error('Sender/receiver does not exist:' + id);
		}
	}
};

ChunkHandlers.prototype.trace = function(id, message) {
	// console.log(id, message);
};

ChunkHandlers.prototype.error = function(id, error) {
	this.close(id);
	console.error(id, error);
};

ChunkHandlers.prototype.close = function(id) {
	var handler = this.item(id, true);
	if (handler) {
		delete this.items[id];
		this.count--;
	}
};

ChunkHandlers.prototype.abort = function(id) {
	var handler = this.item(id);
	if (handler) {
		handler.abort();
		delete this.items[id];
		this.count--;
	}
};

ChunkHandlers.prototype.startSender = function(param, content, dataPacketBuffer, callback) {
	param.id = param.id || ChunkHandlers.timeUuid();
	var sender = this.item(param.id, true);

	if (!sender) {
		sender = new ChunkSender(this.config, this.packetHelper, this.listeners, this.webAPI, callback);
		this.items[param.id] = sender;
		this.count++;
		sender.start(param, content, dataPacketBuffer);

	} else {
		this.log.error('Sender with ID "' + id + '" exists');
	}
}

ChunkHandlers.prototype.sendNextChunk = function(param) {
	var sender = this.item(param.id);
	if (sender) {
		sender.nextChunk(param);
	}
};

ChunkHandlers.prototype.endSender = function(id) {
	var sender = this.items[id];
	if (sender) {
		sender.end();
	}
};

ChunkHandlers.prototype.newReceiver = function(param, callback) {
	param.id = ChunkHandlers.timeUuid();
	var receiver = this.item(param.id, true);
	if (!receiver) {
		receiver = new ChunkReceiver(this.config, this.packetHelper, this.listeners, this.webAPI, callback);
		this.items[param.id] = receiver;
		this.count++;
		receiver.start(param);
		return param.id;

	} else {
		this.log.error('File receiver with ID "' + param.id + '" exists');
	}
};

ChunkHandlers.prototype.startReceiver = function(param, dataPacketBuffer, callback) {
	var receiver = this.item(param.id, true);
	if (!receiver) {
		receiver = new ChunkReceiver(this.config, this.packetHelper, this.listeners, this.webAPI, callback);
		this.items[param.id] = receiver;
		this.count++;
	}

	receiver.start(param, dataPacketBuffer);
};

ChunkHandlers.prototype.receiveNextChunk = function(param, chunk) {
	var receiver = this.item(param.id);
	if (receiver) {
		receiver.nextChunk(param, chunk);
	}
};

ChunkHandlers.prototype.endReceiver = function(id, callback, getBlob) {
	var receiver = this.item(id);
	if (receiver) {
		receiver.end(callback, getBlob);
	}
};

ChunkHandlers.prototype.acknowledgeChunk = function(id, dataPacket) {
	var item = this.item(id);
	if (item) {
		item.acknowledgeChunk(id, dataPacket);
	}
};

ChunkHandlers.timeUuid = function() {
	var now = Date.now(),
		uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(char) {
			var rnd = (now + Math.random() * 16) % 16 | 0;
			return (char == 'x' ? rnd : (rnd & 0x3 | 0x8)).toString(16);
		});
	return uuid;
};