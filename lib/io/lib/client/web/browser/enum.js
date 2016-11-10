/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../../../common/enum');

module.exports = {
	Mode: Enum.Mode,
	Status: Enum.Status,
	ServerProtocol: Enum.ServerProtocol,
	DataProtocol: Enum.DataProtocol,
	Socket: {
		Device: {
			// ENGINE_IO: 'ENGINE_IO',
			WS: 'WS',
			WEB_SOCKET: 'WEB_SOCKET',
			HTTP_LONG_POLL: 'HTTP_LONG_POLL'
		},

		KEEP_ALIVE: true,
		HTTPLongPoll: Enum.Socket.HTTPLongPoll
	},
	CurveZMQ: Enum.CurveZMQ,
	Pipe: Enum.Pipe,
	Packet: Enum.Packet,
	Blob: Enum.Blob,
	ResponseCode: Enum.Pipe.ResponseCode,
	Event: Enum.Pipe.Event,
	ChunkHandler: Enum.ChunkHandler
};