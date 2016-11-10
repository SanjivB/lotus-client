/*
 * @copyright sanjiv.bhalla@gmail.com
 *
 * Released under the MIT license
 */

'option strict';

var DataPacket = require('./data-packet'),
	Hops = require('./hops');

module.exports = ClientRequest;

ClientRequest.DataObject = DataPacket.DataObject;
ClientRequest.Blob = DataPacket.Blob;

function ClientRequest(command, flag, sequenceNo, param, payload, hops, extra) {
	this.command = command;
	this.flag = flag;
	this.sequenceNo = sequenceNo;
	this.param = param;
	this.payload = payload;
	this.hops = hops || Hops.new();
	this.extra = extra;
}

ClientRequest.prototype.addHop = function(key) {
	Hops.addItem(this.hops, key);
}

ClientRequest.prototype.hopDuration = function(key, subKey) {
	return Hops.duration(this.hops, key, subKey);
}

ClientRequest.prototype.toWebSocketBuffer = function() {
	return this.toDataPacket().toWebSocketBuffer();
}

ClientRequest.prototype.toDataPacket = function() {
	return new DataPacket(
		this.command,
		this.flag,
		this.sequenceNo,
		this.param,
		this.payload,
		this.hops,
		this.extra
	);
}

ClientRequest.fromWebSocketBuffer = function(buffer) {
	return ClientRequest.fromDataPacket(DataPacket.fromWebSocketBuffer(buffer));
}

ClientRequest.fromDataPacket = function(dataPacket) {
	return new ClientRequest(
		dataPacket.command(),
		dataPacket.flag(),
		dataPacket.sequenceNo(),
		dataPacket.payload1(),
		dataPacket.payload2(),
		dataPacket.hops(),
		dataPacket.extra()
	);
}