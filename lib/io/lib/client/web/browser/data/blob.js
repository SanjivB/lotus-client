/*
 * @copyright unseen, ehf
 */

'option strict';

var nacl = require('tweetnacl'),
	utf8 = nacl.util,
	Enum = require('../enum').Blob,
	DataObject = require('./data-object');

module.exports = Blob;

function Blob() {}

Blob.metadataLength = function(dataObjectCount) {
	return Enum.Offset.PACKET_LENGTH + Enum.Offset.DATA_OBJECT_METADATA * dataObjectCount;
}

Blob.toBlob = function(value) {
	var blobObject = DataObject.fromValue(value),
		blob = new Blob().startWrite(Blob.metadataLength(1) + blobObject.length());

	return blob.writeNext(blobObject).endWrite();
}

Blob.prototype.startRead = function(data) {
	if (!(data instanceof Uint8Array)) {
		throw ('Backing buffer needs to be type Uint8Array got ' + DataObject.typeKey(data));
	}

	this.readBuffer = data;
	this.dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
	this.offset = 0;

	var packetLength = this.dataView.getUint32(this.offset)
	this.offset += Enum.Offset.PACKET_LENGTH;

	if (this.readBuffer.length !== packetLength) {
		throw ('Incomplete buffer:' + this.readBuffer.length + ', packet:' + packetLength)
	}

	return this;
}

Blob.prototype.readNext = function(readValue) {
	var dataObject = new DataObject(this.dataView.getInt8(this.offset++));

	if (dataObject.type !== Enum.ObjectType.UNKNOWN) {
		var length = this.readLength(dataObject);

		if (readValue) {
			switch (dataObject.type) {
				case Enum.ObjectType.ARRAY:
				case Enum.ObjectType.ARRAY_BUFFER:
				case Enum.ObjectType.UINT8ARRAY:
				case Enum.ObjectType.BUFFER:
					dataObject._value = this.readBuffer.subarray(this.offset, this.offset + length);
					break;

				case Enum.ObjectType.BYTE:
					dataObject._value = this.dataView.getInt8(this.offset);
					break;

				case Enum.ObjectType.SHORT_INTEGER:
					dataObject._value = this.dataView.getUint16(this.offset);
					break;

				case Enum.ObjectType.INTEGER:
					dataObject._value = this.dataView.getUint32(this.offset);
					break;

				case Enum.ObjectType.STRING:
					dataObject._value = DataObject.readString(this.readBuffer, this.offset, length);
					break;

				case Enum.ObjectType.JSON:
					dataObject._value = JSON.parse(DataObject.readString(this.readBuffer, this.offset, length));
					break;
			}

		} else {
			dataObject._buffer = this.readBuffer.subarray(this.offset, this.offset + length);
		}

		this.offset += length;
	}

	return dataObject;
}

Blob.prototype.readLength = function(dataObject) {
	var length = 0;

	switch (dataObject.type) {
		case Enum.ObjectType.BYTE:
			length = 1;
			break;

		case Enum.ObjectType.SHORT_INTEGER:
			length = 2;
			break;

		case Enum.ObjectType.INTEGER:
			length = 4;
			break;

		case Enum.ObjectType.ARRAY:
		case Enum.ObjectType.ARRAY_BUFFER:
		case Enum.ObjectType.UINT8ARRAY:
		case Enum.ObjectType.BUFFER:
		case Enum.ObjectType.STRING:
		case Enum.ObjectType.JSON:
			length = this.dataView.getUint32(this.offset);
			this.offset += 4;
			break;
	}

	return length;
}

Blob.prototype.endRead = function() {
	this.readBuffer = null;
}

Blob.prototype.startWrite = function(bufferSize) {
	bufferSize = bufferSize || 72 * 1024;

	if (!this.writeBuffer || this.writeBuffer.length !== bufferSize) {
		var data = new Uint8Array(bufferSize);
		this.writeBuffer = data;
	}

	this.dataView = new DataView(this.writeBuffer.buffer);
	this.offset = Enum.Offset.PACKET_LENGTH;
	return this;
}

Blob.prototype.writeNext = function(dataObject) {
	var length = 0;

	this.dataView.setInt8(this.offset++, dataObject.type);

	if (dataObject.type !== Enum.ObjectType.UNKNOWN) {
		length = dataObject.length()
		this.writeLength(dataObject, length);

		if (dataObject._buffer) {
			this.writeBuffer.set(dataObject._buffer, this.offset);

		} else {
			switch (dataObject.type) {
				case Enum.ObjectType.ARRAY:
				case Enum.ObjectType.ARRAY_BUFFER:
				case Enum.ObjectType.UINT8ARRAY:
				case Enum.ObjectType.BUFFER:
					this.writeBuffer.set(dataObject._value, this.offset);
					break;

				case Enum.ObjectType.BYTE:
					this.dataView.setInt8(this.offset, dataObject._value);
					break;

				case Enum.ObjectType.SHORT_INTEGER:
					this.dataView.setUint16(this.offset, dataObject._value);
					break;

				case Enum.ObjectType.INTEGER:
					this.dataView.setUint32(this.offset, dataObject._value);
					break;

				case Enum.ObjectType.STRING:
				case Enum.ObjectType.JSON:
					this.writeBuffer.set(dataObject.stringValue(), this.offset);
					break;
			}
		}

		this.offset += length;
	}

	return this;
}

Blob.prototype.writeLength = function(dataObject, length) {
	switch (dataObject.type) {
		case Enum.ObjectType.ARRAY:
		case Enum.ObjectType.ARRAY_BUFFER:
		case Enum.ObjectType.UINT8ARRAY:
		case Enum.ObjectType.BUFFER:
		case Enum.ObjectType.STRING:
		case Enum.ObjectType.JSON:
			this.dataView.setUint32(this.offset, length);
			this.offset += 4;
			break;
	}
}

Blob.prototype.endWrite = function() {
	this.dataView.setUint32(0, this.offset);
	var buffer = this.writeBuffer.subarray(0, this.offset);

	if (buffer.length !== this.offset) {
		throw ('Insufficient buffer:' + buffer.length + ', packet:' + this.offset);
	}
	return buffer;
}