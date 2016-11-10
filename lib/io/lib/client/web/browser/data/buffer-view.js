/**
 * Helper class for a array buffer backing usually by an Uint8Array
 */
var nacl = require('tweetnacl'),
	utf8 = nacl.util;

function BufferView(buffer) {
	if (!(buffer instanceof Uint8Array)) {
		throw 'Backing buffer needs to be Uint8Array';
	}

	this.buffer = buffer;
	this.dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
	this.rewind();
}

BufferView.prototype.data = function() {
	return this.buffer.slice(0, this.offset + 1);
}

BufferView.prototype.reset = function() {
	this.offset = this.mark;
}

BufferView.prototype.rewind = function() {
	this.offset = this.mark = 0;
}

BufferView.prototype.set = function(offset) {
	this.offset = offset;
}

BufferView.prototype.skip = function(s) {
	this.offset += s;
}

BufferView.prototype.mark = function() {
	this.mark = offset;
}

BufferView.prototype.length = function() {
	return this.buffer.byteLength;
}

BufferView.prototype.slice = function(start, end) {
	if (!end) {
		end = this.buffer.byteLength;
	}
	return this.buffer.subarray(start, end);
}

BufferView.prototype.readUInt8 = function(offset) {
	if (!offset) {
		var res = this.dataView.getUint8(this.offset, false);
		this.offset += 1;
		return res;
	} else {
		return this.dataView.getUint8(offset, false);
	}
}

BufferView.prototype.readInt8 = function(offset) {
	if (!offset) {
		var res = this.dataView.getInt8(this.offset, false);
		this.offset += 1;
		return res;
	} else {
		return this.dataView.getInt8(offset, false);
	}
}

BufferView.prototype.readUInt16 = function(offset) {
	if (!offset) {
		var res = this.dataView.getUint16(this.offset, false);
		this.offset += 2;
		return res;
	} else {
		return this.dataView.getUint16(offset, false);
	}
}

BufferView.prototype.readUInt32 = function(offset) {
	if (!offset) {
		var res = this.dataView.getUint32(this.offset, false);
		this.offset += 4;
		return res;
	} else {
		return this.dataView.getUint32(offset, false);
	}
}

BufferView.prototype.readInt32 = function(offset) {
	if (!offset) {
		var res = this.dataView.getInt32(this.offset, false);
		this.offset += 4;
		return res;
	} else {
		return this.dataView.getInt32(offset, false);
	}
}

BufferView.prototype.readSlice = function(length, offset) {
	if (!offset) {
		offset = this.offset
	}

	var value = this.buffer.subarray(offset, offset + length);
	this.offset += length;
	return value;
}

BufferView.prototype.writeUInt8 = function(value, offset) {
	if (!offset) {
		this.dataView.setUint8(this.offset, value);
		this.offset += 1;
	} else {
		this.dataView.setUint8(offset, value);
	}
}

BufferView.prototype.writeInt8 = function(value, offset) {
	if (!offset) {
		this.dataView.setInt8(this.offset, value);
		this.offset += 1;
	} else {
		this.dataView.setInt8(offset, value);
	}
}

BufferView.prototype.writeUInt16 = function(value, offset) {
	if (!offset) {
		this.dataView.setUint16(this.offset, value, false);
		this.offset += 2;
	} else {
		this.dataView.setUint16(offset, value, false);
	}
}

BufferView.prototype.writeUInt32 = function(value, offset) {
	if (!offset) {
		this.dataView.setUint32(this.offset, value, false);
		this.offset += 4;
	} else {
		this.dataView.setUint32(offset, value, false);
	}
}

BufferView.prototype.writeInt32 = function(value, offset) {
	if (!offset) {
		this.dataView.setInt32(this.offset, value, false);
		this.offset += 4;
	} else {
		this.dataView.setInt32(offset, value, false);
	}
}

/**
 * estimate the UTF8 array
 * @param string value
 * @returns the encoded UTF8 array
 */
BufferView.decodeUTF8 = function(value) {
	return utf8.decodeUTF8(value);
}

BufferView.prototype.writeUTF8 = function(value, offset) {
	var a = utf8.decodeUTF8(value);
	var pos = (offset ? offset : this.offset);
	if (pos + a.byteLength > this.buffer.byteLength) {
		throw 'range error';
	}

	for (var i = 0; i < a.byteLength; i++) {
		this.buffer[pos + i] = a[i];
	}
	if (!offset) {
		this.offset += a.byteLength;
	}

	return a.byteLength;
}

BufferView.prototype.append = function(buf, offset) {
	if (!buf instanceof Uint8Array) {
		throw 'buffer needs to be Uint8Array';
	}

	var pos = (offset ? offset : this.offset)

	if (pos + buf.byteLength > this.buffer.byteLength) {
		throw 'range error';
	}

	this.buffer.set(buf, pos);
	if (!offset) {
		this.offset += buf.byteLength;
	}
}

BufferView.prototype.readUTF8 = function(length, offset) {
	var pos = (offset ? offset : this.offset);
	if (pos + length > this.buffer.byteLength) {
		throw 'range error';
	}

	var sub = this.buffer.subarray(pos, pos + length);
	var res = utf8.encodeUTF8(sub);
	if (!offset) {
		this.offset += length;
	}
	return res;
}

BufferView.prototype.fill = function(value, start, end) {
	var use_offset = false;
	if (!start) {
		start = 0;
		end = this.buffer.byteLength;
		use_offset = true;
	}

	for (var i = start; i < end; i++) {
		this.buffer[i] = value;
	}

	if (use_offset) {
		this.offset += (end - start);
	}
}

module.exports = BufferView;