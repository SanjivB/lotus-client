/*
 * @copyright sanjiv.bhalla@gmail.com
 *
 * Released under the MIT license
 */

'option strict';

module.exports = SessionTimeout;

function SessionTimeout(Commands, pipe, callback) {
	this.Command = Commands;
	this.pipe = pipe;
	this.config = this.pipe.config;
	this.Enum = this.pipe.Enum;
	this.callback = callback;
}

SessionTimeout.prototype.start = function() {
	this.stop();

	if (!this.sessionTimeout && (this.config.Pipe.Session.timeoutSecs > 0)) {
		var self = this;

		this.sessionTimeout = setTimeout(function() {
			self.pipe.sendRequest(self.Command.Session.SESSION_TIMEOUT, null, null, function(error, result, payload, roundTripTime, networkLatency) {
				if (self.callback) {
					if (!error) {
						self.stop();
						self.config.MetaData.Session.token = null;
						self.callback(self.Enum.Status.SESSION_TIMEOUT, null);

					} else {
						self.callback(self.Enum.Status.SESSION_TIMEOUT_FAILED, error.message);
					}
				}
			});

		}, this.config.Pipe.Session.timeoutSecs * 1000);
	}
}

SessionTimeout.prototype.stop = function() {
	if (this.sessionTimeout) {
		clearTimeout(this.sessionTimeout);
		this.sessionTimeout = null;
	}
}