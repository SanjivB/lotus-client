/*
 * @copyright unseen, ehf
 */

'option strict';

module.exports = Error;

function Error(code, message) {
	this.code = code || '*unknown*';
	this.message = message || '*unknown*';
}

Error.new = function(data) {
	try {
		var message = data.message.replace(/{(\d+)}/g, function(match, number) {
			return (typeof data.param[number] != 'undefined') ? data.param[number] : match;
		});
		return new Error(data.code, message);

	} catch (error) {
		return new Error();
	}
}