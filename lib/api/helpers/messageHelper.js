/*
 * @copyright Unseen, ehf
 */

'option strict';

module.exports = MessageHelper;

function MessageHelper() {}

MessageHelper.prototype.parseBody = function(messages) {
	var index = messages.length;
	while (index--) {
		messages[index].body = this.fromJson(messages[index].body);
	}
}

MessageHelper.prototype.toJson = function(value) {
	return JSON.stringify(value);
}

MessageHelper.prototype.fromJson = function(value) {
	try {
		return JSON.parse(value);

	} catch (err) {
		return '';
	}
}

MessageHelper.prototype.updateUnreadCounts = function(result) {
	var totalId = '00000000-0000-1000-0000-000000000000',
		index = result.stats.length,
		map = {},
		totalUnreadCount = 0;

	while (index--) {
		var stats = result.stats[index];
		if (stats.conversationId == totalId) {
			totalUnreadCount = stats.unreadCount;

		} else {
			map[stats.conversationId] = stats.unreadCount;
		}
	}

	index = result.page.conversations.length;
	while (index--) {
		var conversation = result.page.conversations[index];

		conversation.unreadCount = map[conversation.conversationId] || 0;
		conversation.totalUnreadCount = totalUnreadCount;
	}

	return result.page;
}