/* @copyright unseen, ehf */

'option strict';

module.exports = BlobWriter;

function BlobWriter(config, param, transferParam, webAPI) {
	this.param = param;
	this.transferParam = transferParam;
	this.webAPI = webAPI;

	if (this.webAPI) {
		this.blob = new Uint8Array(this.param.Context.size);

	} else {
		this.blob = new Buffer(this.param.Context.size);
	}

	this.goto(this.transferParam.chunkNo);
}

BlobWriter.prototype.bof = function() {
	return (this.offset == 0);
};

BlobWriter.prototype.eof = function(chunkNo) {
	return (this.balance == 0);
};

BlobWriter.prototype.percentComplete = function() {
	if (this.param.Context.size) {
		return parseFloat((this.offset / this.param.Context.size) * 100).toFixed(2);
	}
};

BlobWriter.prototype.goto = function(chunkNo) {
	if (!chunkNo || chunkNo <= 1) {
		this.transferParam.chunkNo = 1;
		this.offset = 0;
		this.balance = this.param.Context.size;

	} else {
		this.transferParam.chunkNo = (chunkNo > this.param.chunkCount) ? this.param.chunkCount : chunkNo;
		this.offset = (chunkNo < this.param.chunkCount) ? (this.transferParam.chunkNo - 1) * this.param.chunkSize : this.param.Context.size;
		this.balance = this.param.Context.size - this.offset;
	}
};

BlobWriter.prototype.write = function(chunk, callback) {
	if (this.balance > 0) {
		var chunkSize = chunk.length;

		if (this.webAPI) {
			this.blob.set(chunk, this.offset);

		} else {
			chunk.copy(this.blob, this.offset, 0, chunkSize);
		}

		this.offset += chunkSize;
		this.balance -= chunkSize;

		callback();

	} else {
		callback('Writing beyond EOF.');
	}
};

BlobWriter.prototype.content = function() {
	return {
		blob: this.blob
	};
};