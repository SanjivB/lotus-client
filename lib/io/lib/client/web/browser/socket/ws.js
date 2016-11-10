/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../enum').Socket,
	WS = require('ws');

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

	this.innerSocket = new WS(url);
	this.innerSocket.binaryType = 'arraybuffer';

	this.innerSocket.onopen = function() {
		self.listeners.open(Enum.KEEP_ALIVE);

		self.innerSocket.onmessage = function(event) {
			if (event.data instanceof ArrayBuffer) {
				self.listeners.receive(new Uint8Array(event.data));
				
			} else {
				self.listeners.log.error('Socket', 'Invalid data type:', event.data);
			}
		};
	};

	this.innerSocket.onclose = function() {
		self.listeners.log.error('Socket', 'Connection closed');
		self.listeners.onClose();
	};

	this.innerSocket.onerror = function(error) {
		self.listeners.log.error('Socket', error.message, error.code);
		self.listeners.onClose();
	};
}

Socket.prototype.ping = function(uint8Array) {
	// this.listeners.log.trace('Socket', 'ping:');
	this.send(uint8Array);
}

Socket.prototype.send = function(uint8Array) {
	try {
		this.innerSocket.send(uint8Array);

	} catch (error) {
		this.listeners.log.error('Socket', error.message);
	}
}

Socket.prototype.close = function() {
	if (this.innerSocket) {
		this.innerSocket.close();
	}
}