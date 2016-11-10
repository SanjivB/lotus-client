/*
 * @copyright unseen, ehf
 */

'option strict';

var Client = require('./lib/api/client'),
	ClientIO = require('./lib/io').BrowserClient(),
	ClientAPI = require('./lib/api');

module.exports = {

	Enum: ClientIO.Enum,

	init: function(config) {
		var client = new Client(config, ClientIO, ClientAPI),
			application = client.API;

		application.Enum = ClientIO.Enum;
		application.config = client.config;
		application.AccountService.Session.sessionId = client.sessionId;

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
				console.log('SessionId: ', application.AccountService.Session.sessionId);
				console.log('Config:', application.config);
				console.log('Enum:', application.Enum);
				console.log('/********************************************************************/');
			}
		};

		return application;
	}

};