/* @copyright unseen, ehf */

'option strict';

module.exports = ChunkController;

function ChunkController(chunkHandler) {
	this._chunkHandler = chunkHandler;
}

ChunkController.prototype.resume = function() {
	this._chunkHandler.resume();
};

ChunkController.prototype.pause = function() {
	this._chunkHandler.pause();
};

ChunkController.prototype.cancel = function() {
	this._chunkHandler.cancel();
};