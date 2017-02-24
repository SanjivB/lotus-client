/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('./enum'),
	defaultConfig = require('../../../../config/client'),
	Error = require('./error'),
	md5 = require('./data/md5'),
	Pipe = require('./pipe/index');


module.exports = IOClient;

function IOClient(config, IOEnum, Components, webAPI) {
	this.config = JSON.parse(JSON.stringify(defaultConfig));
	this.Enum = IOEnum;
	this.Components = Components;
	this.webAPI = webAPI;

	try {
		if (window.location.hostname) this.config.Socket.host = window.location.hostname;
		if (window.location.port) this.config.Socket.port = window.location.port;
	} catch (error) {}

	if (config) {
		if (config.mode) this.config.mode = config.mode;
		if (config.serverProtocol) this.config.Socket.protocol = config.serverProtocol;
		if (config.dataProtocol) this.config.DataProtocol.protocol = config.dataProtocol;
		if (config.device) this.config.Socket.device = config.device;
		if (config.host) this.config.Socket.host = config.host;
		if (config.port) this.config.Socket.port = config.port;
		if (config.maxConnectAttempts) this.config.Socket.maxConnectAttempts = config.maxConnectAttempts;
		if (config.requestTimeoutSecs) this.config.Socket.requestTimeoutSecs = config.requestTimeoutSecs;
		if (config.blobTimeoutSecs) this.config.Socket.blobTimeoutSecs = config.blobTimeoutSecs;
		if (config.serverPublicKey) this.config.DataProtocol.CurveZMQ.serverPublicKey = config.serverPublicKey;
		if (config.clientPublicKey) this.config.DataProtocol.CurveZMQ.publicKey = config.clientPublicKey;
		if (config.clientSecretKey) this.config.DataProtocol.CurveZMQ.secretKey = config.clientSecretKey;
		if (config.sessionTimeoutSecs) this.config.Pipe.Session.timeoutSecs = config.sessionTimeoutSecs;
		if (config.idToken) this.config.MetaData.idToken = config.idToken;
	}

	this.sequenceNo = 0;
	this.callbackMap = {};
}

IOClient.prototype.start = function(callback) {
	var self = this;

	this.statusCallback = callback;
	this.socket = new this.Components.Socket(this.config.Socket, this.webAPI);
	this.protocolAdaptor = this.Components.ProtocolAdaptor.newAdaptor(this.config.DataProtocol, this.config.MetaData);

	this.config.Pipe.mode = this.config.mode;
	this.pipe = new Pipe(
		this.config.Pipe, {
			PacketHelper: this.Components.PacketHelper,
			DataPacket: this.Components.DataPacket,
			ClientRequest: this.Components.ClientRequest,
			ClientResponse: this.Components.ClientResponse
		},
		this.webAPI
	);

	if (this.Components.log) {
		this.log = this.Components.log;

	} else {
		var Log = require('./log');
		this.log = new Log(this.config);
		this.log.start(this.pipe);
	}

	var listeners = {
		Socket: {
			open: this.protocolAdaptor.open.bind(this.protocolAdaptor),
			onClose: this.protocolAdaptor.onClose.bind(this.protocolAdaptor),
			receive: this.protocolAdaptor.receive.bind(this.protocolAdaptor),
			log: this.log,
			status: this.status.bind(this)
		},

		ProtocolAdaptor: {
			open: this.pipe.open.bind(this.pipe),
			onClose: this.pipe.onClose.bind(this.pipe),
			close: this.socket.close.bind(this.socket),
			send: this.socket.send.bind(this.socket),
			forward: this.pipe.receive.bind(this.pipe),
			log: this.log
		},

		Pipe: {
			ready: this.ready.bind(this),
			close: this.socket.close.bind(this.socket),
			send: this.protocolAdaptor.send.bind(this.protocolAdaptor),
			receiveResponse: this.receiveResponse.bind(this),
			log: this.log
		}
	};

	this.packetHelper = new this.Components.PacketHelper(this.config.Packet.bufferSize);
	this.pipe.start(this.packetHelper, listeners.Pipe);
	this.protocolAdaptor.start(listeners.ProtocolAdaptor, this.packetHelper);
	this.socket.start(this.packetHelper, listeners.Socket);

	this.pipe.on('open', function() {
		self.statusCallback(Enum.Pipe.Status.CONNECTION_OPENED, {
			pipeId: self.pipe.id
		});
	});

	this.pipe.on('close', function() {
		self.statusCallback(Enum.Pipe.Status.CONNECTION_CLOSED, {
			pipeId: self.pipe.id
		});

		// self._closeAllCallbacks({
		// 	code: 'Error.Opus.Client.NOT_READY',
		// 	message: 'Client is not ready to receive responses.'
		// })
	});

	return this;
};

IOClient.prototype.status = function(statusEnum, message) {
	this.statusCallback(statusEnum, {
		pipeId: this.pipe.id,
		message: message
	});
};

IOClient.prototype.md5 = function(value) {
	try {
		return md5(value);

	} catch (err) {
		return '';
	}
}

IOClient.prototype.ready = function() {
	if (this.pipe) {
		return this.pipe.ready();

	} else {
		return false;
	}
}

IOClient.prototype.pause = function() {
	if (this.ready()) {
		this.socket.pause();
	}
}

IOClient.prototype.resume = function() {
	if (!this.ready()) {
		this.socket.resume();
	}
}

IOClient.prototype.hasSession = function() {
	return (this.config.MetaData.Session.token !== null);
}

IOClient.prototype.sendRequest = function(command, param, payload, callback, percentCallback, server) {
	this._sendRequest(Enum.Packet.Client.Flag.REQUEST, command, param, payload, callback, percentCallback, server);
}

IOClient.prototype.blobSendRequest = function(command, param, payload, callback, percentCallback) {
	this._sendRequest(Enum.Packet.Client.Flag.BLOB_SEND_REQUEST, command, param, payload, callback, percentCallback);
}

IOClient.prototype.blobReceiveRequest = function(command, param, payload, callback, percentCallback) {
	this._sendRequest(Enum.Packet.Client.Flag.BLOB_RECEIVE_REQUEST, command, param, payload, callback, percentCallback);
}

IOClient.prototype._sendRequest = function(flag, command, param, payload, callback, percentCallback, server) {
	if (callback) {
		if (this.pipe.ready()) {
			++this.sequenceNo;

			var self = this,
				event = command + ':' + this.sequenceNo;

			this.callbackMap[event] = callback;

			this._once(
				event,
				this._timeoutSecs(flag),
				function(error, result, payload, roundTripTime, serverLatency) {
					self.log.trace('[IOClient]', 'receiveResponse:' + result);

					commandCallback = self.callbackMap[event];
					delete self.callbackMap[event];
					self.pipe.delegate.removeAllListeners(event);

					commandCallback(error, result, payload, roundTripTime, serverLatency);
				}
			);

			var clientRequest = new this.Components.ClientRequest(command, flag, this.sequenceNo, param, payload);
			clientRequest.addHop(Enum.Packet.Hop.CLIENT);
			if (server) {
				clientRequest.extra = {
					'server': server
				};
			}
			this.pipe.sendRequest(clientRequest, percentCallback);

			this.sessionTimeout.start();

		} else {
			callback({
				code: 'Error.Opus.Client.NOT_READY',
				message: 'Client is not ready to send requests.'
			});
		}

	} else {
		this.log.error('[IOClient]', 'Callback for api is invalid.');
	}
}

IOClient.prototype._closeAllCallbacks = function(error) {
	var self = this;
	for (var event in this.callbackMap) {
		var commandCallback = self.callbackMap[event];
		self.pipe.delegate.removeAllListeners(event);
		commandCallback(error, null, null, 0, 0);
	}
	this.callbackMap = {};
}

IOClient.prototype._timeoutSecs = function(flag) {
	switch (flag) {
		case Enum.Packet.Client.Flag.BLOB_SEND_REQUEST:
		case Enum.Packet.Client.Flag.BLOB_RECEIVE_REQUEST:
			return this.config.Socket.blobTimeoutSecs;

		default:
			return this.config.Socket.requestTimeoutSecs;
			break;
	}
}

IOClient.prototype.receiveResponse = function(clientResponse) {
	var error = (clientResponse.error) ? Error.new(clientResponse.error) : null,
		event = clientResponse.event();

	this.pipe.delegate.emit(
		event,
		error,
		clientResponse.result,
		clientResponse.payload,
		clientResponse.hopDuration(Enum.Packet.Hop.CLIENT),
		clientResponse.hopDuration(Enum.Packet.Hop.SERVER)
	);
}

IOClient.prototype._once = function(event, timeoutSecs, callback) {
	var listener = function() {
		if (timerId) clearTimeout(timerId);

		if (arguments.length > 0) {
			callback.apply(this, arguments);

		} else {
			callback();
		}
	};
	this.pipe.delegate.once(event, listener);

	var self = this,
		timerId = setTimeout(function() {
			self.pipe.delegate.removeListener(event, listener);
			timerId = null;

			callback({
				code: 'Error.Opus.Client.REQUEST_TIMEOUT',
				message: 'Timeout waiting for response from server.'
			});
		}, timeoutSecs * 1000);
}

IOClient.prototype.on = function(event, callback) {
	if (callback) {
		var listener = function() {
			if (arguments.length > 0) {
				callback.apply(this, arguments);

			} else {
				callback();
			}
		};

		this.pipe.delegate.removeAllListeners(event);
		this.pipe.delegate.on(event, listener);

	} else {
		this.log.error('[IOClient]', 'Callback for listener is invalid.');
	}
}

IOClient.prototype.off = function(event, callback) {
	if (callback) {
		this.pipe.delegate.removeListener(event, callback);

	} else {
		this.pipe.delegate.removeAllListeners(event);
	}
}