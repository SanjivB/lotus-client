/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../enum').Socket;

Enum.inner = {
	State: {
		CONNECTING: 0,
		OPEN: 1,
		CLOSING: 2,
		CLOSED: 3
	}
}

module.exports = Socket;

function Socket() {}

Socket.prototype.start = function(listeners) {
	this.listeners = listeners;
}

// Socket.prototype.connected = function() {
// 	return (this.innerSocket.readyState === Enum.Inner.State.OPEN);
// }

Socket.prototype.open = function(url) {
	var self = this;

	this.innerSocket = new WebSocket(url);
	this.innerSocket.binaryType = 'arraybuffer';

	this.innerSocket.addEventListener('open', function(event) {
		self.listeners.open(Enum.KEEP_ALIVE);
		self.listeners.log.trace('Socket', 'Opened: ' + url);

		self.innerSocket.addEventListener('close', function(event) {
			self.listeners.onClose();
			self.listeners.log.trace('Socket', 'Closed: (code ' + event.code + ') ' + event);
		});

		self.innerSocket.addEventListener('message', function(event) {
			var uint8Array = new Uint8Array(event.data);
			self.listeners.receive(uint8Array);
		});

		self.innerSocket.addEventListener('error', function(event) {
			self.listeners.log.error('Socket', event.data);
		});
	});
}

Socket.prototype.ping = function(uint8Array) {
	// console.log('ping:', data);
	this.send(uint8Array);
}

Socket.prototype.send = function(uint8Array) {
	try {
		this.innerSocket.send(uint8Array, {
			binary: true
		});

	} catch (error) {
		this.listeners.log.error('Socket.send', error);
	}
}

Socket.prototype.close = function() {
	switch (this.innerSocket.readyState) {
		case Enum.Inner.State.CONNECTING:
		case Enum.Inner.State.OPEN:
			this.innerSocket.close();
			break;
	}
}

Socket.prototype.reason = function(code) {
	var reason;

	// See http://tools.ietf.org/html/rfc6455#section-7.4.1
	if (code == 1000)
		reason = "Normal closure, meaning that the purpose for which the connection was established has been fulfilled.";
	else if (code == 1001)
		reason = "An endpoint is \"going away\", such as a server going down or a browser having navigated away from a page.";
	else if (code == 1002)
		reason = "An endpoint is terminating the connection due to a protocol error";
	else if (code == 1003)
		reason = "An endpoint is terminating the connection because it has received a type of data it cannot accept (e.g., an endpoint that understands only text data MAY send this if it receives a binary message).";
	else if (code == 1004)
		reason = "Reserved. The specific meaning might be defined in the future.";
	else if (code == 1005)
		reason = "No status code was actually present.";
	else if (code == 1006)
		reason = "The connection was closed abnormally, e.g., without sending or receiving a Close control frame";
	else if (code == 1007)
		reason = "An endpoint is terminating the connection because it has received data within a message that was not consistent with the type of the message (e.g., non-UTF-8 [http://tools.ietf.org/html/rfc3629] data within a text message).";
	else if (code == 1008)
		reason = "An endpoint is terminating the connection because it has received a message that \"violates its policy\". This reason is given either if there is no other sutible reason, or if there is a need to hide specific details about the policy.";
	else if (code == 1009)
		reason = "An endpoint is terminating the connection because it has received a message that is too big for it to process.";
	else if (code == 1010) // Note that this status code is not used by the server, because it can fail the WebSocket handshake instead.
		reason = "An endpoint (client) is terminating the connection because it has expected the server to negotiate one or more extension, but the server didn't return them in the response message of the WebSocket handshake. <br /> Specifically, the extensions that are needed are: " + event.reason;
	else if (code == 1011)
		reason = "A server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request.";
	else if (code == 1015)
		reason = "The connection was closed due to a failure to perform a TLS handshake (e.g., the server certificate can't be verified).";
	else
		reason = "Unknown reason";

	return reason;
}