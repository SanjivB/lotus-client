/*
 * @copyright unseen, ehf
 */

'option strict';

var nacl = require('tweetnacl'),
	utf8 = nacl.util,
	Enum = require('../enum').Blob;

module.exports = DataObject;

function DataObject(type) {
	this.type = type;
	this._value = undefined;
	this._buffer = undefined;
	this._stringValue = undefined;
}

DataObject.type = function(value) {
	var type = Enum.ObjectType.UNKNOWN;

	if (!value) {
		type = Enum.ObjectType.UNKNOWN;

	} else if (value instanceof DataObject) {
		type = value.type();

	} else if ((value instanceof Array)) {
		type = Enum.ObjectType.ARRAY;

	} else if ((value instanceof ArrayBuffer)) {
		type = Enum.ObjectType.ARRAY_BUFFER;

	} else if ((value instanceof Uint8Array)) {
		type = Enum.ObjectType.UINT8ARRAY;

	} else if ((value instanceof Buffer)) {
		type = Enum.ObjectType.BUFFER;

	} else if (typeof(value) === 'number') {
		type = Enum.ObjectType.INTEGER;

	} else if (typeof(value) === 'string') {
		type = Enum.ObjectType.STRING;

	} else {
		type = Enum.ObjectType.JSON;
	}

	return type;
}

DataObject.typeKey = function(data) {
	var type = DataObject.type(data);
	return Enum.ObjectType.Key[type] || type;
}

DataObject.fromValue = function(value, type) {
	if (value instanceof DataObject) {
		return value;
	}

	var dataObject = new DataObject(type || Enum.ObjectType.UNKNOWN);
	if (dataObject.type === Enum.ObjectType.UNKNOWN) {
		dataObject.type = DataObject.type(value);
	}

	switch (dataObject.type) {
		case Enum.ObjectType.ARRAY:
		case Enum.ObjectType.ARRAY_BUFFER:
		case Enum.ObjectType.UINT8ARRAY:
		case Enum.ObjectType.BUFFER:
			dataObject._value = value || new Uint8Array(0);
			break;

		case Enum.ObjectType.BYTE:
			dataObject._value = value || 0;
			break;

		case Enum.ObjectType.SHORT_INTEGER:
			dataObject._value = value || 0;
			break;

		case Enum.ObjectType.INTEGER:
			dataObject._value = value || 0;
			break;

		case Enum.ObjectType.STRING:
			dataObject._value = value || '';
			break;

		case Enum.ObjectType.JSON:
			dataObject._value = value || {};
			break;
	}

	return dataObject;
}

DataObject.prototype.hasValue = function() {
	return (this.type !== Enum.ObjectType.UNKNOWN)
};

DataObject.prototype.value = function() {
	if (this._buffer) {
		var dataView = new DataView(this._buffer.buffer, this._buffer.byteOffset, this._buffer.byteLength);

		switch (this.type) {
			case Enum.ObjectType.ARRAY:
			case Enum.ObjectType.ARRAY_BUFFER:
			case Enum.ObjectType.UINT8ARRAY:
			case Enum.ObjectType.BUFFER:
				this._value = this._buffer;
				break;

			case Enum.ObjectType.BYTE:
				this._value = dataView.getInt8(0);
				break;

			case Enum.ObjectType.SHORT_INTEGER:
				this._value = dataView.getUint16(0);
				break;

			case Enum.ObjectType.INTEGER:
				this._value = dataView.getUint32(0);
				break;

			case Enum.ObjectType.STRING:
				this._value = DataObject.readString(this._buffer);
				break;

			case Enum.ObjectType.JSON:
				this._value = JSON.parse(DataObject.readString(this._buffer));
				break;
		}

		this._buffer = null;
	}

	return this._value;
}

DataObject.prototype.length = function() {
	var length = 0;

	if (this.type !== Enum.ObjectType.UNKNOWN) {
		if (this._buffer) {
			length = this._buffer.length;

		} else {
			var bufferValue = undefined;
			switch (this.type) {
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
					length = this._value.length;
					break;

				case Enum.ObjectType.STRING:
				case Enum.ObjectType.JSON:
					length = this.stringValue().byteLength;
					break;
			}
		}
	}

	return length;
}

DataObject.prototype.stringValue = function() {
	if (!this._stringValue) {
		switch (this.type) {
			case Enum.ObjectType.STRING:
				this._stringValue = utf8.decodeUTF8(this._value);
				break;

			case Enum.ObjectType.JSON:
				this._stringValue = utf8.decodeUTF8(JSON.stringify(this._value));
				break;
		}
	}

	return this._stringValue;
}

DataObject.readString = function(buffer, offset, length) {
	offset = offset || 0;
	length = length || buffer.length;
	return utf8.encodeUTF8(buffer.subarray(offset, offset + length));
}