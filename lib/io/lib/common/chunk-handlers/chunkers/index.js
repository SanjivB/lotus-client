/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../../enum'),
	BlobReader = require('./blob-reader'),
	BlobWriter = require('./blob-writer');

module.exports = Chunkers;

function Chunkers() {}

Chunkers.newReader = function(config, param, transferParam, listeners, webAPI, content) {
	var chunker = null;

	switch (param.type) {
		case Enum.ChunkHandler.Type.FILE:
			if (Chunkers.CassandraReader) {
				chunker = new Chunkers.CassandraReader(config, param, transferParam, listeners);

			} else {
				chunker = new BlobReader(config, param, transferParam, webAPI, content);
			}
			break;

		case Enum.ChunkHandler.Type.DATAPACKET:
		default:
			chunker = new BlobReader(config, param, webAPI, content);
			break;
	}

	return chunker;
};

Chunkers.newWriter = function(config, param, transferParam, listeners, webAPI) {
	var chunker = null;

	switch (param.type) {
		case Enum.ChunkHandler.Type.FILE:
			if (Chunkers.CassandraReader) {
				chunker = new Chunkers.CassandraWriter(config, param, transferParam, listeners);

			} else {
				chunker = new BlobWriter(config, param, transferParam, webAPI);
			}
			break;

		case Enum.ChunkHandler.Type.DATAPACKET:
		default:
			chunker = new BlobWriter(config, param, webAPI);
			break;
	}

	return chunker;
};