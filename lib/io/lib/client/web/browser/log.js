/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('./enum');

module.exports = Log;

function Log(config) {
	this.config = config;
}

Log.prototype.start = function(pipe) {
	this.pipe = pipe;
}

Log.prototype.error = function(source, message, code) {
	this.pipe.error(source, message, code);

	if (this.config.Mode === Enum.Mode.DEV) {
		if (code) {
			console.error('[Error] %s: (code %d) %s', source, code, message);

		} else {
			console.error('[Error] %s: %s', source, message);
		}
	}
}

Log.prototype.trace = function(source, message) {
	if (this.config.mode === Enum.Mode.DEV) {
		console.log('[Trace] %s: %s', source, message);
	}
}