/* @copyright unseen, ehf */

'option strict';

module.exports = ChunkController;

function ChunkController(chunkHandler) {
	this.chunkHandler = chunkHandler;
}

ChunkController.prototype.resume = function() {
	this.chunkHandler.resume();
};

ChunkController.prototype.pause = function() {
	this.chunkHandler.pause();
};