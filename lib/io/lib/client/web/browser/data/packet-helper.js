/*
 * @copyright unseen, ehf
 */

'option strict';

var Blob = require('./blob'),
	DataObject = require('./data-object'),
	Enum = require('../enum').Blob;

module.exports = PacketHelper;

function PacketHelper(bufferSize) {
	this.bufferSize = bufferSize;
	this.blob = new Blob();
}

PacketHelper.prototype.readPipe = function(data) {
	this.blob.startRead(data);

	var result = {
		version: this.blob.readNext(true).value(),
		command: this.blob.readNext(true).value(),
		flag: this.blob.readNext(true).value(),
		seqNo: this.blob.readNext(true).value(),
		extension: this.blob.readNext(true).value(),
		payload: this.blob.readNext(true).value()
	};
	this.blob.endRead();

	return result;
}

PacketHelper.prototype.writePipe = function(version, command, flag, seqNo, extension, payload) {
	this.blob.startWrite(this.bufferSize);

	this.blob.writeNext(DataObject.fromValue(version, Enum.ObjectType.BYTE));
	this.blob.writeNext(DataObject.fromValue(command, Enum.ObjectType.SHORT_INTEGER));
	this.blob.writeNext(DataObject.fromValue(flag, Enum.ObjectType.BYTE));
	this.blob.writeNext(DataObject.fromValue(seqNo, Enum.ObjectType.INTEGER));
	this.blob.writeNext(DataObject.fromValue(extension));
	this.blob.writeNext(DataObject.fromValue(payload));

	var buffer = this.blob.endWrite();
	return buffer;
}

PacketHelper.prototype.readHttpLongPoll = function(data) {
	this.blob.startRead(data);

	var result = {
		command: this.blob.readNext(true).value(),
		flag: this.blob.readNext(true).value(),
		id: this.blob.readNext(true).value(),
		message: this.blob.readNext(true).value()
	};
	this.blob.endRead();

	return result;
}

PacketHelper.prototype.writeHttpLongPoll = function(command, flag, id, message) {
	this.blob.startWrite(this.bufferSize);

	this.blob.writeNext(DataObject.fromValue(command, Enum.ObjectType.SHORT_INTEGER));
	this.blob.writeNext(DataObject.fromValue(flag, Enum.ObjectType.BYTE));
	this.blob.writeNext(DataObject.fromValue(id, Enum.ObjectType.STRING));
	this.blob.writeNext(DataObject.fromValue(message));

	return this.blob.endWrite();
}

PacketHelper.prototype.readMetaData = function(data) {
	this.blob.startRead(data);

	var result = {
		idToken: this.blob.readNext(true).value(),
		sessionToken: this.blob.readNext(true).value(),
	};
	this.blob.endRead();

	return result;
}

PacketHelper.prototype.writeMetaData = function(idToken, sessionToken) {
	this.blob.startWrite(this.bufferSize);

	this.blob.writeNext(DataObject.fromValue(idToken, Enum.ObjectType.STRING));
	this.blob.writeNext(DataObject.fromValue(sessionToken, Enum.ObjectType.STRING));

	return this.blob.endWrite();
}