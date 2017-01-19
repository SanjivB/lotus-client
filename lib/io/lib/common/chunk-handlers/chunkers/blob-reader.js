/* @copyright unseen, ehf */

'option strict';

module.exports = BlobReader;

function BlobReader(config, param, transferParam, webAPI, content) {
	this.param = param;
	this.transferParam = transferParam;
	this.webAPI = webAPI;
	this.content = content;

	if (this.content) this.param.Context.size = this.content.blob.length;
	this.goto(this.transferParam.chunkNo);
}

BlobReader.prototype.bof = function() {
	return (this.offset == 0);
};

BlobReader.prototype.eof = function() {
	return (this.balance == 0);
};

BlobReader.prototype.percentComplete = function() {
	if (this.param.Context.size) {
		return parseFloat(((this.offset / this.param.Context.size) * 100).toFixed(2));
	}
};

BlobReader.prototype.goto = function(chunkNo) {
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

BlobReader.prototype.read = function(callback) {
	if (this.balance > 0) {
		var chunkSize = Math.min(this.param.chunkSize, this.balance),
			chunk = null;

		if (this.webAPI) {
			chunk = this.content.blob.subarray(this.offset, this.offset + chunkSize);

		} else {
			chunk = this.content.blob.slice(this.offset, this.offset + chunkSize);
		}

		this.offset += chunkSize;
		this.balance -= chunkSize;

		callback(null, null, chunk);

	} else {
		callback();
	}
};

BlobReader.prototype.cancel = function(callback) {
	this.goto();
	callback();
};