/*
 * @copyright unseen, ehf
 */

'option strict';

var ClientIO = require('./index'),
	Enum = require('../../../common/enum');

var Enum = {
	Mode: Enum.Mode,
	ServerProtocol: Enum.ServerProtocol,
	DataProtocol: Enum.DataProtocol,
	Device: {
		// ENGINE_IO: 'ENGINE_IO',
		WS: 'WS',
		WEB_SOCKET: 'WEB_SOCKET',
		HTTP_LONG_POLL: 'HTTP_LONG_POLL'
	},
	Status: Enum.Pipe.Status,
	ResponseCode: Enum.Pipe.ResponseCode,
	Event: Enum.Pipe.Event
};

function API(config) {
	var components = {
		PacketHelper: require('./data/packet-helper'),
		Socket: require('./socket'),
		ProtocolAdaptor: require('./protocol-adaptor'),
		ClientRequest: require('./data/client-request'),
		ClientResponse: require('./data/client-response'),
		DataPacket: require('./data/data-packet')
	};

	return new ClientIO(config, Enum, components, true);
};

module.exports = API;
module.exports.Enum = Enum;