/*
 * @copyright sanjiv.bhalla@gmail.com
 *
 * Released under the MIT license
 */

'option strict';

var Enum = require('../enum'),
	DataPacket = require('./data-packet'),
	Hops = require('./hops');

module.exports = ClientResponse;

function ClientResponse(command, flag, sequenceNo, error, result, payload, hops, extra) {
	this.command = command;
	this.flag = flag;
	this.sequenceNo = sequenceNo;

	this.error = error || null;
	this.result = result || null;
	this.payload = payload || null;
	this.hops = hops || Hops.new();
	this.extra = extra || null;
}

ClientResponse.prototype.status = function() {
	return (this.error) ? Enum.Status.ERROR : Enum.Status.SUCCESS;
}

ClientResponse.prototype.hopDuration = function(key, subKey1, subKey2) {
	return Hops.duration(this.hops, key, subKey1, subKey2);
}

ClientResponse.prototype.hopTotalDuration = function(key, subKey1, subKey2) {
	return Hops.totalDuration(this.hops, key, subKey1, subKey2);
}

ClientResponse.prototype.event = function() {
	var event = null;

	switch (this.flag) {
		case Enum.Packet.Client.Flag.FORWARD_RESPONSE:
			event = this.command;
			break;

		default:
			event = this.command + ':' + this.sequenceNo;
			break;
	}

	return event;
}

ClientResponse.prototype.toWebSocketBuffer = function() {
	return this.toDataPacket().toWebSocketBuffer();
}

ClientResponse.prototype.toDataPacket = function() {
	var data = {
		error: this.error,
		result: this.result
	}

	return new DataPacket(
		this.command,
		this.flag,
		this.sequenceNo,
		data,
		this.payload,
		this.hops,
		this.extra
	);
}

ClientResponse.fromWebSocketBuffer = function(buffer) {
	return ClientResponse.fromDataPacket(DataPacket.fromWebSocketBuffer(buffer));
}

ClientResponse.fromDataPacket = function(dataPacket) {
	var data = dataPacket.payload1() || {};

	return new ClientResponse(
		dataPacket.command(),
		dataPacket.flag(),
		dataPacket.sequenceNo(),
		data.error,
		data.result,
		dataPacket.payload2(),
		dataPacket.hops(),
		dataPacket.extra()
	);
}