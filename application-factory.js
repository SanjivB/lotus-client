/*
 * @copyright unseen, ehf
 */

'option strict';

module.exports = ApplicationFactory;

ApplicationFactory() {}

ApplicationFactory.Client = {
	Enum: ClientIO.Enum,

	app: function(config) {
		var Client = require('./lib/api/client'),
			ClientIO = require('./lib/io/index').WebClient(),
			ClientAPI = require('./lib/api/index');
			
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
	}
};