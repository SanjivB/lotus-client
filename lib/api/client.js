/*
 * @copyright sanjiv.bhalla@gmail.com
 *
 * Released under the MIT license
 */

'option strict';

var SessionTimeout = require('./session-timeout');

var Command = {
	Session: {
		RESTORE_SESSION: '2oaP9p',
		UPDATE_SESSION_TOKEN: '263KTG',
		SESSION_TIMEOUT: 'ZzU9G2',

		On: {
			BEGIN_USER_SESSION: 'PLA8R',
			UPDATE_SESSION_TOKEN: 'flqo7'
		}
	}
};

module.exports = Client;

function Client(config, ClientIO, ClientAPI) {
	this.pipe = new ClientIO(config);
	this.config = this.pipe.config;

	this.Enum = this.pipe.Enum;

	this.API = new ClientAPI(this.pipe);
	this.pipe.sessionId = this.pipe.md5(new Date().getTime() + ':' + Math.random());
};

Client.prototype.start = function(callback) {
	var self = this;
	this.callback = callback;
	this.pipe.sessionTimeout = new SessionTimeout(Command, this.pipe, this.callback);

	this.pipe.start(function(status, response) {
		switch (status) {
			case self.Enum.Status.CONNECTION_OPENED:
				self.pipe.log.trace(status, response.pipeId);

				self.addSessionTokenListener();
				if (self.callback) self.callback(status, response);

				self.restoreSession();
				break;

			case self.Enum.Status.CONNECTION_CLOSED:
				self.pipe.log.trace(status, response.pipeId);
				if (self.callback) self.callback(status, response);
				break;

			case self.Enum.Status.MAX_CONNECT_ATTEMPTS:
				self.pipe.log.trace(status, response);
				if (self.callback) self.callback(status, response);
				break;
		}
	});

	return this;
};

Client.prototype.restoreSession = function() {
	if (this.config.MetaData.Session.token) {
		var self = this,
			param = {
				token: this.config.MetaData.Session.token
			};

		this.pipe.sendRequest(Command.Session.RESTORE_SESSION, param, null, function(error, result, payload, roundTripTime, networkLatency) {
			if (!error) {
				if (self.callback) self.callback(self.Enum.Status.SESSION_RESTORED);

			} else {
				if (self.callback) self.callback(self.Enum.Status.SESSION_FAILED, error.message);
			}
		});

	} else {
		this.callback(this.Enum.Status.SESSION_FAILED, 'No session token');
	}
};

Client.prototype.addSessionTokenListener = function() {
	var self = this;

	this.pipe.on(Command.Session.On.BEGIN_USER_SESSION, function(error, result, payload, roundTripTime, networkLatency) {
		if (!error) {
			self.config.MetaData.Session.token = result.token;
			if (self.callback) self.callback(self.Enum.Status.SESSION_RESTORED, result);
		}
	});

	this.pipe.on(Command.Session.On.UPDATE_SESSION_TOKEN, function(error, result, payload, roundTripTime, networkLatency) {
		if (!error) {
			self.config.MetaData.Session = result;

			if (self.callback) self.callback(self.Enum.Status.SESSION_UPDATED, result);
			self.startSessionTimer();
		}
	});
};

Client.prototype.startSessionTimer = function() {
	this.stopSessionTimer();

	if (!this.sessionTimer && this.config.MetaData.Session) {
		var self = this;

		this.sessionTimer = setInterval(function() {
			
			if (self.config.MetaData.Session) {
				var param = {
					token: self.config.MetaData.Session.token
				};

				self.pipe.sendRequest(Command.Session.UPDATE_SESSION_TOKEN, param, null, function(error, result, payload, roundTripTime, networkLatency) {
					if (!error) {
						self.config.MetaData.Session = result;

						if (self.callback) self.callback(self.Enum.Status.SESSION_UPDATED, result);

					} else {
						if (self.callback) self.callback(self.Enum.Status.SESSION_FAILED, error.message);
					}
				});

			} else {
				self.stopSessionTimer();
			}

		}, this.config.MetaData.Session.renewInSeconds * 1000);
	}
};

Client.prototype.stopSessionTimer = function() {
	if (this.sessionTimer) {
		clearInterval(this.sessionTimer);
		this.sessionTimer = null;
	}
};