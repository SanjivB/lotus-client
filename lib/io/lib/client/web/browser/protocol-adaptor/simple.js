/*
 * @copyright unseen, ehf
 */

'option strict';

module.exports = Default;

function Default() {}

Default.prototype.start = function(listeners) {
	this.listeners = listeners;
}

Default.prototype.open = function(keepAlive) {
	this.listeners.open(keepAlive);
}

Default.prototype.close = function() {
	this.listeners.close();
}

Default.prototype.onClose = function() {
	this.listeners.onClose();
}

Default.prototype.receive = function(data) {
	this.listeners.forward(data);
}

Default.prototype.send = function(data) {
	this.listeners.send(data);
}