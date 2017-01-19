/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../enum');

module.exports = Socket;

function Socket(config, webAPI) {
	this.config = config;
	this.webAPI = webAPI;
	this.initUrl();
}

Socket.prototype.start = function(packetHelper, listeners) {
	this.packetHelper = packetHelper;
	this.listeners = listeners;

	var innerListeners = {
		open: this.open.bind(this),
		onClose: this.onClose.bind(this),
		receive: this.listeners.receive,
		log: this.listeners.log
	};

	switch (this.config.device) {
		case Enum.Socket.Device.HTTP_LONG_POLL:
			var HTTPLongPoll = require('./http-long-poll-socket');
			this.innerSocket = new HTTPLongPoll(this.packetHelper);
			break;

		case Enum.Socket.Device.WEB_SOCKET:
		default:
			var WebSocket = require('./web-socket');
			this.innerSocket = new WebSocket();
			break;
	}

	this.innerSocket.start(innerListeners);
	this.startConnectTimer();
}

Socket.prototype.startConnectTimer = function() {
	this.listeners.log.trace('Socket', 'startConnectTimer - ' + (this.connectTimer === undefined));
	var self = this;

	this.stopReconnectTimeout();

	if (!this.connectTimer) {
		this.connectAttempt = 1;
		self.connect();

		this.connectTimer = setInterval(function() {
			self.connect();
		}, this.config.connectTimeoutSecs * 1000);
	}
}

Socket.prototype.stopConnectTimer = function() {
	this.listeners.log.trace('Socket', 'stopConnectTimer - ' + (this.connectTimer !== undefined));
	if (this.connectTimer) {
		clearInterval(this.connectTimer);
		this.connectTimer = undefined;
	}
}

Socket.prototype.stopReconnectTimeout = function() {
	if (this.reconnectTimeout) {
		clearTimeout(this.reconnectTimeout);
		this.reconnectTimeout = undefined;
	}
}

Socket.prototype.connect = function() {
	if (this.config.maxConnectAttempts == 0 || this.connectAttempt <= this.config.maxConnectAttempts) {
		this.listeners.log.trace('Socket', 'Connect attempt ' + this.connectAttempt++);
		this.innerSocket.open(this.url);

	} else {
		var message = 'Exceeded maximum connect attempts: ' + this.config.maxConnectAttempts;
		this.listeners.log.error('Socket', message);
		this.stopConnectTimer();
		this.listeners.status(Enum.Pipe.Status.MAX_CONNECT_ATTEMPTS, message);
	}
}

Socket.prototype.open = function(keepAlive) {
	this.listeners.log.trace('Socket', 'open');

	this.stopConnectTimer();

	keepAlive = keepAlive || false
	this.listeners.open(keepAlive);
}

Socket.prototype.send = function(data) {
	this.innerSocket.send(data);
}

Socket.prototype.close = function() {
	this.innerSocket.close();
}

Socket.prototype.onClose = function() {
	this.listeners.log.trace('Socket', 'onClose');
	this.listeners.onClose();

	if (!this.reconnectTimeout) {
		var self = this;
		this.reconnectTimeout = setTimeout(function() {
			self.reconnectTimeout = undefined;
			self.startConnectTimer();
		}, this.config.reconnectWaitSecs * 1000);
	}
}

Socket.prototype.initUrl = function() {
	var protocol = undefined,
		isWebSocket = true;

	switch (this.config.device) {
		case Enum.Socket.Device.HTTP_LONG_POLL:
			isWebSocket = false;
			break;
	}

	switch (this.config.protocol) {
		case Enum.ServerProtocol.HTTPS:
			protocol = (isWebSocket) ? 'wss' : 'https';
			break;

		case Enum.ServerProtocol.HTTP:
		default:
			protocol = (isWebSocket) ? 'ws' : 'http';
			break;
	}

	this.url = protocol + '://' + this.config.host + ':' + this.config.port + Enum.Pipe.EVP_PATH;
}