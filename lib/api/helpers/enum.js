/*
 * @copyright Unseen, Inc.
 */

'option strict';

module.exports = {
    AccountService: {
        State: {
            OFFLINE: 0,
            INVISIBLE: 1,
            ONLINE: 2,
            BUSY: 3,
            AWAY: 4
        },

        DeviceId: {
            BROWSER: 'BROWSER'
        },

        PrivacyLevel: {
            PUBLIC: 0,
            FRIENDS: 1
        }
    },

    ChatService: {
        Conversation: {
            ConversationType: {
                ONE: 0,
                GROUP: 1
            },

            MemberType: {
                OWNER: 'OWNER',
                MEMBER: 'MEMBER'
            }
        }
    }
}