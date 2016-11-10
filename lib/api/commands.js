/*
 * @copyright Unseen, Inc.
 */

/* System generated file. Do not modify. */

'option strict';

module.exports = {
    Key: {
        "2i34lm": "AccountService.Account.SIGN_UP",
        "1AU3vj": "AccountService.Account.UPDATE_PROFILE",
        uiyuz: "AccountService.Account.GET_BY_ID",
        "1Up671": "AccountService.Account.GET_BY_EMAIL",
        Z14wWUM: "AccountService.Account.On.PROFILE_UPDATED",
        iY6g5: "AccountService.Session.SIGN_IN",
        Z1MCuQg: "AccountService.Session.TOKEN_SIGN_IN",
        Z2TCLI: "AccountService.Session.SET_STATE",
        ZvQ4OR: "AccountService.Session.SIGN_OUT",
        W0Ktc: "AccountService.Roster.ADD_PARTNER",
        Z1otpxy: "AccountService.Roster.REMOVE_PARTNER",
        Zn81jE: "AccountService.Roster.GET_OFFLINE_NEXT_PAGE",
        Z14pECD: "AccountService.Roster.GET_ONLINE_NEXT_PAGE",
        Z2bQOMI: "AccountService.Roster.GET_RECENT_PARTNERS",
        Z2nHN9B: "AccountService.Roster.SEARCH_PARTNERS",
        b0RKC: "AccountService.Roster.On.STATE_CHANGED",
        "2onRHm": "AccountService.Roster.On.PARTNER_ADDED",
        dAPo3: "AccountService.Roster.On.PARTNER_REMOVED",
        Z1wMefO: "ChatService.Message.SEND",
        g63Hq: "ChatService.Message.GET_BY_ID",
        "1002Ec": "ChatService.Message.SET_READ_MESSAGE",
        "1qO9P1": "ChatService.Message.GET_NEXT_PAGE",
        Z1oBAXV: "ChatService.Message.GET_PREVIOUS_PAGE",
        ZEPJEc: "ChatService.Message.On.MESSAGE",
        Z1kcDr5: "ChatService.Message.On.MESSAGE_STATS",
        ZU8xEi: "ChatService.Conversation.CREATE_ONE",
        nnSq4: "ChatService.Conversation.CREATE_GROUP",
        Z2wzTlH: "ChatService.Conversation.UPDATE_TITLE",
        "3jAEz": "ChatService.Conversation.ADD_MEMBERS",
        aBCdC: "ChatService.Conversation.REMOVE_MEMBERS",
        "2uFNoD": "ChatService.Conversation.LEAVE_GROUP",
        "1fcCFy": "ChatService.Conversation.DELETE",
        Z1pqGbp: "ChatService.Conversation.GET_MEMBERS",
        "1PPlUY": "ChatService.Conversation.GET_BY_ID",
        XW083: "ChatService.Conversation.GET_NEXT_PAGE",
        JJ8ac: "ChatService.Conversation.GET_PREVIOUS_PAGE",
        Z2guxpL: "ChatService.Conversation.On.CREATED",
        Za9edJ: "ChatService.Conversation.On.MEMBERS_ADDED",
        mtFRI: "ChatService.Conversation.On.MEMBERS_REMOVED",
        Z1DNc8f: "ChatService.Conversation.On.DELETED",
        "1vpGOC": "CommunityService.Community.CREATE",
        "27uLm4": "CommunityService.Community.UPDATE",
        "1wCRlF": "CommunityService.Community.DELETE",
        "22CqAT": "CommunityService.Community.SEARCH",
        I1kJS: "CommunityService.Community.NEXT_PAGE",
        Z2ve2YU: "CommunityService.User.ADD_FAVORITE",
        "8A604": "CommunityService.User.REMOVE_FAVORITE",
        xlF2C: "CommunityService.User.FAVOURITES",
        "2wdlAi": "CommunityService.Administrator.ADD",
        ci7Nl: "CommunityService.Administrator.REMOVE",
        Z1EeTJe: "CommunityService.Member.ADD",
        Z1cxpsv: "CommunityService.Member.REMOVE",
        Z20QCVO: "CommunityService.Member.SET_ROLE",
        Z1lkyMT: "CommunityService.Member.GET_ROLE",
        Z1EeTuP: "CommunityService.Member.BAN",
        "1KTUqc": "CommunityService.Member.UNBAN",
        Z1auPY2: "CommunityService.Member.SEARCH",
        Z27IGGK: "CommunityService.Member.NEXT_PAGE",
        ZAyDPg: "CommunityService.Member.JOIN",
        "1Ki7yn": "CommunityService.Member.LEAVE",
        "1E7phu": "CommunityService.Post.CHAT",
        xDlOH: "CommunityService.Post.PHOTO",
        ZwHbQy: "CommunityService.Post.SET_READ_POST",
        Z20bHT2: "CommunityService.Post.NEXT_PAGE",
        "1il7LN": "CommunityService.Post.PREVIOUS_PAGE",
        "1nB1BY": "CommunityService.Post.On.POST",
        "9Ty7q": "CommunityService.Post.On.POST_STATS",
        Z2c6AVC: "CommunityService.Topic.CREATE",
        Z1A1wpb: "CommunityService.Topic.UPDATE",
        Z2aSqpz: "CommunityService.Topic.DELETE",
        Z1ESRal: "CommunityService.Topic.SEARCH",
        Z1W7Dtk: "CommunityService.Topic.NEXT_PAGE",
        Z265rPX: "CommunityService.Topic.FOLLOW",
        "5E1pM": "CommunityService.Topic.UNFOLLOW",
        Z2vPAv1: "CommunityService.Topic.FOLLOWING",
        Z2vPBuN: "CommunityService.Topic.FOLLOWERS",
        BwDSC: "BlobService.Blob.WRITE_BLOB",
        ZzEREl: "BlobService.Blob.READ_BLOB",
        Z1g8IFo: "BlobService.Blob.WRITE_CHUNK",
        "2d4RB6": "BlobService.Blob.READ_CHUNK",
        Z19aTDD: "BlobService.Blob.CANCEL_BLOB"
    },
    GlobalSessionService: {},
    CentralAuthenticationService: {},
    AccountService: {
        Account: {
            SIGN_UP: "2i34lm",
            UPDATE_PROFILE: "1AU3vj",
            GET_BY_ID: "uiyuz",
            GET_BY_EMAIL: "1Up671",
            On: {
                PROFILE_UPDATED: "Z14wWUM"
            }
        },
        Session: {
            SIGN_IN: "iY6g5",
            TOKEN_SIGN_IN: "Z1MCuQg",
            SET_STATE: "Z2TCLI",
            SIGN_OUT: "ZvQ4OR"
        },
        Roster: {
            ADD_PARTNER: "W0Ktc",
            REMOVE_PARTNER: "Z1otpxy",
            GET_OFFLINE_NEXT_PAGE: "Zn81jE",
            GET_ONLINE_NEXT_PAGE: "Z14pECD",
            GET_RECENT_PARTNERS: "Z2bQOMI",
            SEARCH_PARTNERS: "Z2nHN9B",
            On: {
                STATE_CHANGED: "b0RKC",
                PARTNER_ADDED: "2onRHm",
                PARTNER_REMOVED: "dAPo3"
            }
        }
    },
    ChatService: {
        Message: {
            SEND: "Z1wMefO",
            GET_BY_ID: "g63Hq",
            SET_READ_MESSAGE: "1002Ec",
            GET_NEXT_PAGE: "1qO9P1",
            GET_PREVIOUS_PAGE: "Z1oBAXV",
            On: {
                MESSAGE: "ZEPJEc",
                MESSAGE_STATS: "Z1kcDr5"
            }
        },
        Conversation: {
            CREATE_ONE: "ZU8xEi",
            CREATE_GROUP: "nnSq4",
            UPDATE_TITLE: "Z2wzTlH",
            ADD_MEMBERS: "3jAEz",
            REMOVE_MEMBERS: "aBCdC",
            LEAVE_GROUP: "2uFNoD",
            DELETE: "1fcCFy",
            GET_MEMBERS: "Z1pqGbp",
            GET_BY_ID: "1PPlUY",
            GET_NEXT_PAGE: "XW083",
            GET_PREVIOUS_PAGE: "JJ8ac",
            On: {
                CREATED: "Z2guxpL",
                MEMBERS_ADDED: "Za9edJ",
                MEMBERS_REMOVED: "mtFRI",
                DELETED: "Z1DNc8f"
            }
        }
    },
    CommunityService: {
        Community: {
            CREATE: "1vpGOC",
            UPDATE: "27uLm4",
            DELETE: "1wCRlF",
            SEARCH: "22CqAT",
            NEXT_PAGE: "I1kJS"
        },
        User: {
            ADD_FAVORITE: "Z2ve2YU",
            REMOVE_FAVORITE: "8A604",
            FAVOURITES: "xlF2C"
        },
        Administrator: {
            ADD: "2wdlAi",
            REMOVE: "ci7Nl"
        },
        Member: {
            ADD: "Z1EeTJe",
            REMOVE: "Z1cxpsv",
            SET_ROLE: "Z20QCVO",
            GET_ROLE: "Z1lkyMT",
            BAN: "Z1EeTuP",
            UNBAN: "1KTUqc",
            SEARCH: "Z1auPY2",
            NEXT_PAGE: "Z27IGGK",
            JOIN: "ZAyDPg",
            LEAVE: "1Ki7yn"
        },
        Post: {
            CHAT: "1E7phu",
            PHOTO: "xDlOH",
            SET_READ_POST: "ZwHbQy",
            NEXT_PAGE: "Z20bHT2",
            PREVIOUS_PAGE: "1il7LN",
            On: {
                POST: "1nB1BY",
                POST_STATS: "9Ty7q"
            }
        },
        Topic: {
            CREATE: "Z2c6AVC",
            UPDATE: "Z1A1wpb",
            DELETE: "Z2aSqpz",
            SEARCH: "Z1ESRal",
            NEXT_PAGE: "Z1W7Dtk",
            FOLLOW: "Z265rPX",
            UNFOLLOW: "5E1pM",
            FOLLOWING: "Z2vPAv1",
            FOLLOWERS: "Z2vPBuN"
        }
    },
    BlobService: {
        Blob: {
            WRITE_BLOB: "BwDSC",
            READ_BLOB: "ZzEREl",
            WRITE_CHUNK: "Z1g8IFo",
            READ_CHUNK: "2d4RB6",
            CANCEL_BLOB: "Z19aTDD"
        }
    }
};