/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = {
	Socket: require('../enum').Socket.HTTPLongPoll,
	KEEP_ALIVE: require('../enum').Socket.KEEP_ALIVE,
	Packet: require('../enum').Packet
};

module.exports = Socket;

function Socket(packetHelper) {
	this.packetHelper = packetHelper;
	this.socketId = undefined;
	this.queue = [];
	this.connected = false;
	this.opened = false;
	this.pingCount = 0;
}

Socket.prototype.start = function(listeners) {
	this.listeners = listeners;
	this.newRequest();
}

Socket.prototype.ip = function() {
	if (this.request) {
		return this.request.ip;
	}
}

Socket.prototype.newRequest = function() {
	// console.log('newRequest:');
	var self = this;

	this.request = new XMLHttpRequest();
	this.request.responseType = "arraybuffer";

	this.request.addEventListener('error', function(error) {
		// self.error(error);
		self.close();
	});

	this.request.onreadystatechange = function() {
		// console.log('State:', self.request.readyState)
		self.opened = false;
		self.awaitingResponse = false
		switch (self.request.readyState) {
			case Enum.Socket.State.OPENED:
				self.opened = true;
				setTimeout(self.sendPacket.bind(self), 1);

			case Enum.Socket.State.DONE:
				switch (self.request.status) {
					case Enum.Socket.Status.SUCCESSFULL:
						self.connected = true;
						switch (self.request.responseType) {
							case 'arraybuffer':
								self.receive(self.request.response.slice(0));
								setTimeout(self.openRequest.bind(self), 1);
								break;

							default:
								self.error('Invalid response type:' + self.request.responseType)
						}
						break;

					default:
						if (self.request.status) {
							self.error('Device status:' + self.request.status);
						}
						break;
				}

			case Enum.Socket.State.UNSENT:
			case Enum.Socket.State.LOADING:
			case Enum.Socket.State.HEADERS_RECEIVED:
				break;
		}
	}
}

Socket.prototype.error = function(error) {
	console.log('Error:', error)
		// this.listeners.log.error('Socket', error);
}

Socket.prototype.open = function(url) {
	console.log('open:', url);
	this.url = url;
	this.queue = [];
	this.openRequest(true);
	this.queuePacket(Enum.Socket.Command.CONNECT, 0);
}

Socket.prototype.openRequest = function(force) {
	if (force || !this.opened) {
		// console.log('openRequest:', this.request.readyState);
		this.awaitingResponse = false;

		this.request.open('POST', this.url);
		this.request.setRequestHeader('Content-Type', 'application/octet-stream');
	}
}

Socket.prototype.ping = function(data) {
	// console.log('ping:', data);
	this.send(data);
}

Socket.prototype.send = function(data) {
	// console.log('send:', data);
	if (this.awaitingResponse) {
		this.openRequest(true);
	}
	this.queuePacket(Enum.Socket.Command.MESSAGE, data);
}

Socket.prototype.queuePacket = function(command, data) {
	// console.log('queuePacket:', command, ':', data);
	this.queue.push(this.packetHelper.writeHttpLongPoll(command, 0, this.socketId, data));
	this.sendPacket();
}

Socket.prototype.sendPacket = function() {
	// console.log('sendPacket:', this.queue.length, ' opened:', this.opened, ' awaitingResponse:', this.awaitingResponse);
	if (this.opened) {
		var packet = this.queue.shift();
		if (!packet) {
			packet = this.packetHelper.writeHttpLongPoll(Enum.Socket.Command.OPEN, 0, this.socketId);
			this.awaitingResponse = true;
		}
		this.request.send(packet);

	} else {
		this.startResponseTimeout();
	}
}

Socket.prototype.receive = function(response) {
	this.stopResponseTimeout();

	var uint8Array = new Uint8Array(response);
	var packet = this.packetHelper.readHttpLongPoll(uint8Array);
	// console.log('receive:', packet.command, ':', packet.id)

	switch (packet.command) {
		case Enum.Socket.Command.CONNECT:
			this.socketId = packet.id;
			// this.listeners.log.trace('Socket', 'Opened: ' + this.url + ':' + this.socketId);
			this.listeners.open(Enum.KEEP_ALIVE);
			break;

		case Enum.Socket.Command.MESSAGE:
			this.listeners.receive(packet.message);
			break;

		case Enum.Socket.Command.CLOSE:
			this.close();
			break;

		default:
			this.error('Invalid command:' + packet.command);
	}
}

Socket.prototype.close = function() {
	if (this.connected) {
		this.connected = false;

		if (this.request) {
			this.request.abort();
		}
		this.listeners.onClose();
		this.listeners.log.trace('Socket', 'Closed');
	}
}

// Socket.prototype.toBuffer = function(arrayBuffer) {
// 	return new Uint8Array(arrayBuffer);
// }

Socket.prototype.stopResponseTimeout = function() {
	if (this.responseTimeout) {
		// console.log('>>> stopResponseTimeout')
		clearTimeout(this.responseTimeout);
		this.responseTimeout = null;
	}
}

Socket.prototype.startResponseTimeout = function() {
	if (!this.responseTimeout) {
		// console.log('>>> startResponseTimeout')
		var self = this;

		this.responseTimeout = setTimeout(function() {
			// console.log('>>> on ResponseTimeout')
			self.responseTimeout = null;
			self.openRequest(true);
		}, Enum.Socket.responseTimeoutMillisecs);
	}
}