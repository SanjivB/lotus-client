/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../enum').Socket,
	EngineIO = require('engine.io-client');

module.exports = Socket;

function Socket() {}

Socket.prototype.ip = function() {
	if (this.innerSocket) {
		return this.innerSocket.remoteAddress;
	}
}

Socket.prototype.start = function(listeners) {
	this.listeners = listeners;
}

Socket.prototype.open = function(url) {
	var self = this;

	if (this.innerSocket) {
		if (this.innerSocket.connected) {
			this.innerSocket.close();
		}

		this.innerSocket = undefined;
	}

	this.innerSocket = new EngineIO(url, {
		transports: ['websocket'],
		pingInterval: 1 * 24 * 60 * 60 * 1000,
		pingTimeout: 2 * 24 * 60 * 60 * 1000
	});

	// this.innerSocket.binaryType = 'blob';

	this.innerSocket.on('open', function() {
		self.listeners.open(Enum.KEEP_ALIVE);

		self.innerSocket.on('message', function(data) {
			var uint8Array = new Uint8Array(data);
			self.listeners.receive(uint8Array);
		});
	});

	this.innerSocket.on('error', function(error) {
		self.listeners.log.error('EngineIO', error.message, error.code);
		self.listeners.onClose();
	});

	this.innerSocket.on('close', function() {
		self.listeners.log.error('EngineIO', 'Connection closed');
		self.listeners.onClose();
	});
}

Socket.prototype.ping = function(uint8Array) {
	// this.listeners.log.trace('Socket', 'ping:');
	this.send(uint8Array);
}

Socket.prototype.send = function(uint8Array) {
	try {
		this.innerSocket.send(uint8Array);

	} catch (error) {
		this.listeners.log.error('EngineIO', error.message);
	}
}

Socket.prototype.close = function() {
	if (this.innerSocket) {
		this.innerSocket.close();
	}
}

function updateLib() {
	EngineIO.prototype.sendPacket = function(type, data, options, fn) {
		if ('function' == typeof data) {
			fn = data;
			data = undefined;
		}

		if ('function' == typeof options) {
			fn = options;
			options = null;
		}

		if ('closing' == this.readyState || 'closed' == this.readyState) {
			return;
		}

		options = options || {};
		options.compress = false !== options.compress;

		if (data instanceof Uint8Array) {
			data = new Uint8Array(data);
		}

		var packet = {
			type: type,
			data: data,
			options: options
		};
		this.emit('packetCreate', packet);
		this.writeBuffer.push(packet);
		if (fn) this.once('flush', fn);
		this.flush();
	};
}
updateLib();