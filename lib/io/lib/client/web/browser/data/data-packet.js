/*
 * @copyright sanjiv.bhalla@gmail.com
 *
 * Released under the MIT license
 */

'option strict';

var Enum = require('../enum'),
	Blob = require('./blob'),
	Hops = require('./hops'),
	DataObject = require('./data-object');

module.exports = DataPacket;

DataPacket.DataObject = DataObject;
DataPacket.Blob = Blob;

function DataPacket(command, flag, sequenceNo, payload1, payload2, hops, extra) {
	this._commandObject = DataObject.fromValue(command || Enum.Internal.Command.Client.INVALID_COMMAND, Enum.Blob.ObjectType.STRING);
	this._flagObject = DataObject.fromValue(flag, Enum.Blob.ObjectType.BYTE);
	this._sequenceNoObject = DataObject.fromValue(sequenceNo, Enum.Blob.ObjectType.INTEGER);
	this._payload1Object = DataObject.fromValue(payload1);
	this._payload2Object = DataObject.fromValue(payload2);
	this._hopsObject = DataObject.fromValue(hops || Hops.new(), Enum.Blob.ObjectType.JSON);
	this._extraObject = DataObject.fromValue(extra);
	this.payloadIsBlob = false;
}

DataPacket.prototype.command = function() {
	return this._commandObject.value();
}

DataPacket.prototype.flag = function() {
	return this._flagObject.value();
}

DataPacket.prototype.sequenceNo = function() {
	return this._sequenceNoObject.value();
}

DataPacket.prototype.payload1 = function() {
	return this._payload1Object.value();
}

DataPacket.prototype.payload2 = function() {
	return this._payload2Object.value();
}

DataPacket.prototype.setPayload2 = function(value, isBlob) {
	this._payload2Object = DataObject.fromValue(value);
	this.payloadIsBlob = isBlob || false;
}

DataPacket.prototype.hops = function() {
	return this._hopsObject.value();
}

DataPacket.prototype.extra = function() {
	return this._extraObject.value();
}

DataPacket.prototype.putExtra = function(key, value) {
	var extraValue = this._extraObject.value() || {};
	extraValue[key] = value;
	this._extraObject = DataObject.fromValue(extraValue);
}

DataPacket.prototype.getExtra = function(key) {
	var extraValue = this._extraObject.value() || {},
		value = extraValue[key];

	if (value) {
		delete extraValue[key];
		this._extraObject = DataObject.fromValue(extraValue);
	}

	return value;
}

// hops
DataPacket.prototype.addHop = function(key) {
	this._hopsObject._value = Hops.addItem(this.hops(), key);
}

DataPacket.prototype.hopDuration = function(key) {
	this.hops();
	return Hops.duration(this._hopsObject._value, key);
}

DataPacket.prototype.updateHopDuration = function(key) {
	this._hopsObject._value = Hops.updateDuration(this.hops(), key);
}

DataPacket.prototype._getBufferSize = function() {
	var length = Blob.metadataLength(6);
	length += this._commandObject.length();
	length += this._flagObject.length();
	length += this._sequenceNoObject.length();
	length += this._payload1Object.length();
	length += this._payload2Object.length();
	length += this._hopsObject.length();
	length += this._extraObject.length();
	return length;
}

// buffer
DataPacket.fromWebSocketBuffer = function(buffer) {
	var blob = new Blob();

	blob.startRead(buffer);
	var commandObject = blob.readNext(true),
		flagObject = blob.readNext(true),
		sequenceNoObject = blob.readNext(true),
		payload1Object = blob.readNext(true),
		payload2Object = blob.readNext(true),
		hopsObject = blob.readNext(true),
		extraObject = blob.readNext(true);

	blob.endRead();

	return new DataPacket(
		commandObject,
		flagObject,
		sequenceNoObject,
		payload1Object,
		payload2Object,
		hopsObject,
		extraObject
	);
}

DataPacket.prototype.toWebSocketBuffer = function() {
	var blob = new Blob();
	blob.startWrite(this._getBufferSize());
	blob.writeNext(this._commandObject);
	blob.writeNext(this._flagObject);
	blob.writeNext(this._sequenceNoObject);
	blob.writeNext(this._payload1Object);
	blob.writeNext(this._payload2Object);
	blob.writeNext(this._hopsObject);
	blob.writeNext(this._extraObject);
	return blob.endWrite();
}