/*
 * @copyright unseen, ehf
 */
var Client = require('./lib/api/client'),
	ClientIO = require('./lib/io/index').BrowserClient(),
	ClientAPI = require('./lib/api/index');

'option strict';

module.exports = ApplicationFactory;

function ApplicationFactory() {}

ApplicationFactory.Factory = Factory;

function Factory() {}

Factory.Enum = ClientIO.Enum;

Factory.app = function(config) {
	var client = new Client(config, ClientIO, ClientAPI),
		application = client.API;

	application.Enum = ClientIO.Enum;
	application.config = client.config;

	application.start = function(callback) {
		client.start(callback);
	};

	application.ready = function() {
		return application.pipe.ready();
	};

	application.paused = function() {
		return application.pipe.paused();
	};

	application.pause = function() {
		return application.pipe.pause();
	};

	application.resume = function() {
		return application.pipe.resume();
	};

	application.hasSession = function() {
		return application.pipe.hasSession();
	};

	application.log = function(key, error, result, payload, roundTripTime, serverLatency) {
		if (application.config.mode == application.Enum.Mode.DEV) {
			console.log(key, error, result, payload, roundTripTime, serverLatency);
		}
	};

	application.info = function() {
		if (application.config.mode === 'DEV') {
			console.log('/********************************************************************/');
			console.log('Version: ', application.version);
			console.log('SessionId: ', application.pipe.sessionId);
			console.log('Config:', application.config);
			console.log('Enum:', application.Enum);
			console.log('/********************************************************************/');
		}
	};

	return application;
};