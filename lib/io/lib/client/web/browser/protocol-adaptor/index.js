/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../enum');

module.exports.newAdaptor = function(config, metaData) {
	var adaptor = undefined;

	switch (config.protocol) {
		case Enum.DataProtocol.SIMPLE:
			var Simple = require('./simple');
			adaptor = new Simple();
			break;

		case Enum.DataProtocol.CURVE_ZMQ:
			var CurveZMQ = require('./curve-zmq');
			adaptor = new CurveZMQ(config.CurveZMQ, metaData);
			break;

		default:
			console.log('Invalid protocol:%s', config.protocol);
			break;
	}

	return adaptor;
}