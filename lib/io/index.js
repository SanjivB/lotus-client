/*
 * @copyright unseen, ehf
 */

'option strict';

module.exports = IO;

function IO() {}

IO.BrowserClient = function() {
	return require('./lib/client/web/browser/api');
}