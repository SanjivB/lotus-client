 /*
  * @copyright unseen, ehf
  */

 'option strict';

 var events = require('events'),
 	Enum = require('../enum'),
 	ChunkHandlers = require('../../../../common/chunk-handlers/index');

 module.exports = Pipe;

 function Pipe(config, Components, webAPI) {
 	this.config = config;
 	this.Components = Components;
 	this.webAPI = webAPI;
 	this.heartBeatTimer = null;
 	this.pingTimeout = null;
 }

 Pipe.prototype.start = function(packetHelper, listeners) {
 	this.listeners = listeners;
 	this.keepAlive = false;
 	this.sequenceNo = 0;

 	this.delegate = new events.EventEmitter();
 	this.delegate.setMaxListeners(this.config.maxListeners);

 	this.packetHelper = packetHelper;

 	this.pipeListeners = {
 		log: this.listeners.log,
 		send: this.listeners.send
 	};

 	var components = {
 		packetHelper: this.packetHelper
 	};
 	this.chunkHandlers = new ChunkHandlers(this.config.ChunkHandler, components, this.listeners, this.webAPI);

 	this.setState(Enum.Pipe.State.WAIT_READY);
 }

 Pipe.prototype.setState = function(state) {
 	this.listeners.log.trace('Pipe', 'setState:' + state);

 	switch (state) {
 		case Enum.Pipe.State.WAIT_READY:
 			this.chunkHandlers.autoPause();
 			break;

 		case Enum.Pipe.State.READY:
 			this.chunkHandlers.autoResume();
 			break;
 	}

 	this.state = state;
 }

 Pipe.prototype.open = function(keepAlive) {
 	this.keepAlive = keepAlive;
 	this.listeners.send(this.packetHelper.writePipe(Enum.Pipe.EVP_VER, Enum.Pipe.Command.OPEN, Enum.Packet.IO.Flag.NONE, ++this.sequenceNo));
 }

 Pipe.prototype.openAcknowledge = function(id) {
 	this.listeners.log.trace('Pipe', 'openAcknowledge');

 	this.startHeartBeat();
 	this.id = id;
 	this.setState(Enum.Pipe.State.READY);

 	this.delegate.emit('open', this.id);
 }

 Pipe.prototype.ready = function() {
 	return (this.state === Enum.Pipe.State.READY);
 }

 Pipe.prototype.close = function() {
 	this.listeners.log.trace('Pipe', 'close');

 	this.listeners.close();
 }

 Pipe.prototype.onClose = function() {
 	this.listeners.log.trace('Pipe', 'onClose');

 	if (this.state !== Enum.Pipe.State.WAIT_READY) {
 		this.stopHeartBeat();
 		this.setState(Enum.Pipe.State.WAIT_READY);
 		this.delegate.emit('close', this.id);
 	}
 }

 Pipe.prototype.stopHeartBeat = function() {
 	if (this.keepAlive) {
 		this.listeners.log.trace('Pipe', 'stopHeartBeat');

 		if (this.heartBeatTimer) {
 			clearInterval(this.heartBeatTimer);
 			this.heartBeatTimer = null;
 		}

 		this.stopPingTimeout();
 	}
 }

 Pipe.prototype.startHeartBeat = function() {
 	if (this.keepAlive) {
 		this.listeners.log.trace('Pipe', 'startHeartBeat');

 		if (!this.heartBeatTimer) {
 			var self = this;

 			if (this.heartBeatTimer) {
 				clearInterval(this.heartBeatTimer);
 			}

 			this.heartBeatTimer = setInterval(function() {
 				self.ping();
 			}, this.config.HeartBeat.intervalSecs * 1000);

 			this.startPingTimeout();
 		}
 	}
 }

 Pipe.prototype.ping = function() {
 	this.listeners.log.trace('Pipe', 'ping');
 	this.listeners.send(this.packetHelper.writePipe(Enum.Pipe.EVP_VER, Enum.Pipe.Command.PING, Enum.Packet.IO.Flag.NONE, ++this.sequenceNo));
 };

 Pipe.prototype.stopPingTimeout = function() {
 	if (this.pingTimeout) {
 		clearTimeout(this.pingTimeout);
 		this.pingTimeout = null;
 	}
 }

 Pipe.prototype.startPingTimeout = function() {
 	if (!this.pingTimeout) {
 		var self = this;

 		this.pingTimeout = setTimeout(function() {
 			self.pingTimeout = null;
 			self.close();
 		}, this.config.HeartBeat.timeoutSecs * 1000);
 	}
 }

 Pipe.prototype.error = function(source, message, code) {
 	if (this.config.mode == Enum.Mode.DEV) {
 		console.error('[' + source + ']', message, code);
 	}
 }

 Pipe.prototype.on = function(event, callback) {
 	this.delegate.on(event, callback);
 };

 Pipe.prototype.sendRequest = function(clientRequest, percentCallback) {
 	if (this.ready()) {
 		switch (clientRequest.flag) {
 			case Enum.Packet.Client.Flag.BLOB_RECEIVE_REQUEST:
 				clientRequest.extra = {
 					receiver: {
 						id: this.chunkHandlers.newReceiver(this.pipeListeners, percentCallback),
 					}
 				};
 				// Continue

 			case Enum.Packet.Client.Flag.REQUEST:
 				var clientRequestBuffer = clientRequest.toWebSocketBuffer();

 				if (clientRequestBuffer.length < this.config.ChunkHandler.chunkSize) {
 					this.listeners.send(
 						this.packetHelper.writePipe(
 							Enum.Pipe.EVP_VER,
 							Enum.Pipe.Command.REQUEST,
 							Enum.Packet.IO.Flag.NONE,
 							++this.sequenceNo,
 							clientRequestBuffer
 						)
 					);

 					if (percentCallback) {
 						percentCallback(null, {
 							percent: 100
 						});
 					}

 				} else {
 					var param = {
 							id: null,
 							type: Enum.ChunkHandler.Type.DATAPACKET,
 							chunkSize: this.config.ChunkHandler.chunkSize,
 							Context: {
 								type: 'DATAPACKET',
 								size: clientRequestBuffer.length
 							}
 						},
 						content = {
 							blob: clientRequestBuffer
 						};

 					this.chunkHandlers.startSender(param, content, null, percentCallback);
 				}
 				break;

 			case Enum.Packet.Client.Flag.BLOB_SEND_REQUEST:
 				var param = {
 						id: null,
 						type: Enum.ChunkHandler.Type.FILE,
 						chunkSize: this.config.ChunkHandler.chunkSize,
 						Context: clientRequest.param.Context
 					},
 					content = {
 						blob: clientRequest.payload
 					};

 				delete clientRequest.payload;
 				var clientRequestBuffer = clientRequest.toWebSocketBuffer();

 				this.chunkHandlers.startSender(param, content, clientRequestBuffer, percentCallback);
 				break;

 			default:
 				this.listeners.log.error('Pipe', 'Client request flag is invalid:' + flag);
 				break;
 		}

 	} else {
 		this.listeners.log.error('Pipe', 'Client is not ready.');
 	}
 };

 Pipe.prototype.receive = function(data) {
 	var self = this,
 		param = null,
 		packet = this.packetHelper.readPipe(data);

 	switch (packet.command) {
 		case Enum.Pipe.Command.OPEN:
 			if (packet.flag & Enum.Packet.IO.Flag.ACKNOWLEDGE) {
 				this.openAcknowledge(packet.extension);
 			}
 			break;

 		case Enum.Pipe.Command.PING:
 			if (packet.flag & Enum.Packet.IO.Flag.ACKNOWLEDGE) {
 				this.listeners.log.trace('Pipe', 'pong');
 				this.stopPingTimeout();
 				this.startPingTimeout();
 			}
 			break;

 		case Enum.Pipe.Command.CLOSE:
 			this.listeners.close();
 			break;

 		case Enum.Pipe.Command.RESPONSE:
 			var clientResponse = new this.Components.ClientResponse.fromWebSocketBuffer(packet.extension);
 			this.listeners.receiveResponse(clientResponse);
 			break;

 		case Enum.Pipe.Command.START_TRANSFER:
 			this.listeners.log.trace('Pipe', 'Enum.Pipe.Command.START_TRANSFER');
 			if (packet.flag & Enum.Packet.IO.Flag.ACKNOWLEDGE) {
 				transferParam = packet.extension;
 				transferParam.sequenceNo = packet.seqNo;
 				this.chunkHandlers.sendNextChunk(transferParam);

 			} else {
 				this.chunkHandlers.startReceiver(packet.extension, packet.payload);
 			}
 			break;

 		case Enum.Pipe.Command.CANCEL_TRANSFER:
 			this.listeners.log.trace('Pipe', 'Enum.Pipe.Command.CANCEL_TRANSFER');
 			if (packet.flag & Enum.Packet.IO.Flag.ACKNOWLEDGE) {
 				transferParam = packet.extension;
 				this.chunkHandlers.endCancel(transferParam.id);
 			}
 			break;

 		case Enum.Pipe.Command.TRANSFER:
 			this.listeners.log.trace('Pipe', 'Enum.Pipe.Command.TRANSFER');
 			transferParam = packet.extension;
 			transferParam.sequenceNo = packet.seqNo;

 			if (packet.flag & Enum.Packet.IO.Flag.ACKNOWLEDGE) {
 				this.chunkHandlers.sendNextChunk(transferParam);

 			} else {
 				this.chunkHandlers.receiveNextChunk(transferParam, packet.payload);
 			}
 			break;

 		case Enum.Pipe.Command.TRANSFER_ERROR:
 			this.listeners.log.trace('Pipe', 'Enum.Pipe.Command.TRANSFER_ERROR');
 			this.chunkHandlers.abort(packet.extension.id);
 			break;

 		case Enum.Pipe.Command.END_TRANSFER:
 			this.listeners.log.trace('Pipe', 'Enum.Pipe.Command.END_TRANSFER');
 			if (packet.flag & Enum.Packet.IO.Flag.ACKNOWLEDGE) {
 				this.chunkHandlers.endSender(packet.extension.id);

 			} else {
 				this.chunkHandlers.endReceiver(
 					packet.extension.id,
 					function(result) {
 						var clientResponse = self.Components.ClientResponse.fromWebSocketBuffer(result.content.dataPacketBuffer);
 						if (!clientResponse.payload && result.content.blob) {
 							clientResponse.payload = result.content.blob;
 						}
 						self.listeners.receiveResponse(clientResponse);
 					}
 				);
 			}
 			break;

 		default:
 			this.listeners.log.trace('Pipe', 'Invalid command:', packet.command);
 			break;
 	}
 }