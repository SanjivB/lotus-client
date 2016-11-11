/*
 * @copyright Unseen, Inc.
 */

/*  
    System generated file. 
    
    On update:
    - File will be backed as 1-index.js, 2-index.js, ...  
    - Invalid functions will be removed. 
    - All other modifications will be preserved.    
*/

'option strict';

var Commands = require('./commands'),
    AppEnum = require('./helpers/enum'),
    MessageHelper = require('./helpers/messageHelper');

module.exports = API;

function API(pipe) {
    this.version = '2.0';
    this.pipe = pipe;
    this.pipe.Enum.Command = Commands;
    this.pipe.Enum.App = AppEnum;
    this.GlobalSessionService = new GlobalSessionService(this.pipe);
    this.CentralAuthenticationService = new CentralAuthenticationService(this.pipe);
    this.AccountService = new AccountService(this.pipe);
    this.BlobService = new BlobService(this.pipe);
    this.ChatService = new ChatService(this.pipe);
    this.CommunityService = new CommunityService(this.pipe);
};

function GlobalSessionService(pipe) {};

function CentralAuthenticationService(pipe) {};

function AccountService(pipe) {
    this.Account = new Account(pipe);
    this.Session = new Session(pipe);
    this.Roster = new Roster(pipe);
};

function Account(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function Session(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function Roster(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function ChatService(pipe) {
    this.Message = new Message(pipe);
    this.Conversation = new Conversation(pipe);
};

function Message(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
    this.messageHelper = new MessageHelper();
};

function Conversation(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
    this.messageHelper = new MessageHelper();
};

function CommunityService(pipe) {
    this.Community = new Community(pipe);
    this.User = new User(pipe);
    this.Administrator = new Administrator(pipe);
    this.Member = new Member(pipe);
    this.Post = new Post(pipe);
    this.Topic = new Topic(pipe);
};

function Community(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function User(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function Administrator(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function Member(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function Post(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
    this.messageHelper = new MessageHelper();
};

function Topic(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

function BlobService(pipe) {
    this.Blob = new Blob(pipe);
};

function Blob(pipe) {
    this.pipe = pipe;
    this.Enum = this.pipe.Enum;
};

Account.prototype.signUp = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Account.SIGN_UP, param, null, callback);
};

Account.prototype.updateProfile = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Account.UPDATE_PROFILE, param, null, callback);
};

Account.prototype.getById = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Account.GET_BY_ID, param, null, callback);
};

Account.prototype.getByEmail = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Account.GET_BY_EMAIL, param, null, callback);
};

Account.prototype.onProfileUpdated = function(callback) {
    this.pipe.on(this.Enum.Command.AccountService.Account.On.PROFILE_UPDATED, callback);
};

Session.prototype.signIn = function(param, callback) {
    param.sessionId = this.sessionId;
    this.pipe.sendRequest(this.Enum.Command.AccountService.Session.SIGN_IN, param, null, callback);
};

Session.prototype.tokenSignIn = function(param, callback) {
    param.sessionId = this.sessionId;
    this.pipe.sendRequest(this.Enum.Command.AccountService.Session.TOKEN_SIGN_IN, param, null, callback);
};

Session.prototype.setState = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Session.SET_STATE, param, null, callback);
};

Session.prototype.signOut = function(callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Session.SIGN_OUT, null, null, callback);
};

Roster.prototype.addPartner = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Roster.ADD_PARTNER, param, null, callback);
};

Roster.prototype.removePartner = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Roster.REMOVE_PARTNER, param, null, callback);
};

Roster.prototype.getOfflineNextPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Roster.GET_OFFLINE_NEXT_PAGE, param, null, callback);
};

Roster.prototype.getOnlineNextPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Roster.GET_ONLINE_NEXT_PAGE, param, null, callback);
};

Roster.prototype.getRecentPartners = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Roster.GET_RECENT_PARTNERS, param, null, callback);
};

Roster.prototype.searchPartners = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.AccountService.Roster.SEARCH_PARTNERS, param, null, callback);
};

Roster.prototype.onStateChanged = function(callback) {
    this.pipe.on(this.Enum.Command.AccountService.Roster.On.STATE_CHANGED, callback);
};

Roster.prototype.onPartnerAdded = function(callback) {
    this.pipe.on(this.Enum.Command.AccountService.Roster.On.PARTNER_ADDED, callback);
};

Roster.prototype.onPartnerRemoved = function(callback) {
    this.pipe.on(this.Enum.Command.AccountService.Roster.On.PARTNER_REMOVED, callback);
};

Message.prototype.send = function(param, fileBuffer, callback, percentCallback) {
    if (!fileBuffer) {
        param.body = this.messageHelper.toJson(param.body);
        this.pipe.sendRequest(this.Enum.Command.ChatService.Message.SEND, param, null, callback, percentCallback);

    } else {
        param.save = true;
        param.body.file = param.body.file || {};
        param.body.file.name = param.body.file.name || '*unknown*';
        param.body.file.type = param.body.file.type || '*unknown*';

        try {
            param.body.file.size = fileBuffer.length;
        } catch (err) {}

        param.Context = param.body.file;
        param.body = this.messageHelper.toJson(param.body);
        this.pipe.blobSendRequest(this.Enum.Command.ChatService.Message.SEND, param, fileBuffer, callback, percentCallback);
    }
};

Message.prototype.getById = function(param, callback) {
    var self = this;
    this.pipe.sendRequest(this.Enum.Command.ChatService.Message.GET_BY_ID, param, null, function(error, result, payload, roundTripTime, serverLatency) {
        if (!error && result.message) {
            result.message.body = self.messageHelper.fromJson(result.message.body);
        }
        callback(error, result, payload, roundTripTime, serverLatency);
    });
};

Message.prototype.setReadMessage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Message.SET_READ_MESSAGE, param, null, callback);
};

Message.prototype.getNextPage = function(param, callback) {
    var self = this;
    this.pipe.sendRequest(this.Enum.Command.ChatService.Message.GET_NEXT_PAGE, param, null, function(error, result, payload, roundTripTime, serverLatency) {
        if (!error) {
            self.messageHelper.parseBody(result.messages);
        }
        callback(error, result, payload, roundTripTime, serverLatency);
    });
};

Message.prototype.getPreviousPage = function(param, callback) {
    var self = this;
    this.pipe.sendRequest(this.Enum.Command.ChatService.Message.GET_PREVIOUS_PAGE, param, null, function(error, result, payload, roundTripTime, serverLatency) {
        self.messageHelper.parseBody(result.messages);
        callback(error, result, payload, roundTripTime, serverLatency);
    });
};

Message.prototype.onMessage = function(callback) {
    var self = this;
    this.pipe.on(this.Enum.Command.ChatService.Message.On.MESSAGE, function(error, result, payload, roundTripTime, serverLatency) {
        if (!error) {
            result.message.body = self.messageHelper.fromJson(result.message.body);
        }
        callback(error, result, payload, roundTripTime, serverLatency);
    });
};

Message.prototype.onMessageStats = function(callback) {
    this.pipe.on(this.Enum.Command.ChatService.Message.On.MESSAGE_STATS, callback);
};

Conversation.prototype.createOne = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.CREATE_ONE, param, null, callback);
};

Conversation.prototype.createGroup = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.CREATE_GROUP, param, null, callback);
};

Conversation.prototype.updateTitle = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.UPDATE_TITLE, param, null, callback);
};

Conversation.prototype.addMembers = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.ADD_MEMBERS, param, null, callback);
};

Conversation.prototype.removeMembers = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.REMOVE_MEMBERS, param, null, callback);
};

Conversation.prototype.leaveGroup = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.LEAVE_GROUP, param, null, callback);
};

Conversation.prototype.delete = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.DELETE, param, null, callback);
};

Conversation.prototype.getMembers = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.GET_MEMBERS, param, null, callback);
};

Conversation.prototype.getById = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.GET_BY_ID, param, null, callback);
};

Conversation.prototype.getNextPage = function(param, callback) {
    var self = this;
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.GET_NEXT_PAGE, param, null,
        function(error, result, payload, roundTripTime, serverLatency) {
            if (!error) {
                result = self.messageHelper.updateUnreadCounts(result);
            }
            callback(error, result, payload, roundTripTime, serverLatency);
        });
};

Conversation.prototype.getPreviousPage = function(param, callback) {
    var self = this;
    this.pipe.sendRequest(this.Enum.Command.ChatService.Conversation.GET_PREVIOUS_PAGE, param, null,
        function(error, result, payload, roundTripTime, serverLatency) {
            if (!error) {
                result = self.messageHelper.updateUnreadCounts(result);
            }
            callback(error, result, payload, roundTripTime, serverLatency);
        });
};

Conversation.prototype.onCreated = function(callback) {
    this.pipe.on(this.Enum.Command.ChatService.Conversation.On.CREATED, callback);
};

Conversation.prototype.onUpdated = function(callback) {
    this.pipe.on(this.Enum.Command.ChatService.Conversation.On.UPDATED, callback);
};

Conversation.prototype.onMembersAdded = function(callback) {
    this.pipe.on(this.Enum.Command.ChatService.Conversation.On.MEMBERS_ADDED, callback);
};

Conversation.prototype.onMembersRemoved = function(callback) {
    this.pipe.on(this.Enum.Command.ChatService.Conversation.On.MEMBERS_REMOVED, callback);
};

Conversation.prototype.onDeleted = function(callback) {
    this.pipe.on(this.Enum.Command.ChatService.Conversation.On.DELETED, callback);
};

Community.prototype.create = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Community.CREATE, param, null, callback);
};

Community.prototype.update = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Community.UPDATE, param, null, callback);
};

Community.prototype.delete = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Community.DELETE, param, null, callback);
};

Community.prototype.search = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Community.SEARCH, param, null, callback);
};

Community.prototype.nextPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Community.NEXT_PAGE, param, null, callback);
};

User.prototype.addFavorite = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.User.ADD_FAVORITE, param, null, callback);
};

User.prototype.removeFavorite = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.User.REMOVE_FAVORITE, param, null, callback);
};

User.prototype.favourites = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.User.FAVOURITES, param, null, callback);
};

Administrator.prototype.add = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Administrator.ADD, param, null, callback);
};

Administrator.prototype.remove = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Administrator.REMOVE, param, null, callback);
};

Member.prototype.add = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.ADD, param, null, callback);
};

Member.prototype.remove = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.REMOVE, param, null, callback);
};

Member.prototype.setRole = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.SET_ROLE, param, null, callback);
};

Member.prototype.getRole = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.GET_ROLE, param, null, callback);
};

Member.prototype.ban = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.BAN, param, null, callback);
};

Member.prototype.unban = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.UNBAN, param, null, callback);
};

Member.prototype.search = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.SEARCH, param, null, callback);
};

Member.prototype.nextPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.NEXT_PAGE, param, null, callback);
};

Member.prototype.join = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.JOIN, param, null, callback);
};

Member.prototype.leave = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Member.LEAVE, param, null, callback);
};

Post.prototype.chat = function(param, fileBuffer, callback, percentCallback) {
    if (!fileBuffer) {
        param.body = this.messageHelper.toJson(param.body);
        this.pipe.sendRequest(this.Enum.Command.CommunityService.Post.CHAT, param, null, callback, percentCallback);

    } else {
        param.body.file = param.body.file || {};
        param.body.file.name = param.body.file.name || '*unknown*';
        param.body.file.type = param.body.file.type || '*unknown*';
        param.body.file.size = fileBuffer.length;

        param.Context = param.body.file;
        param.body = this.messageHelper.toJson(param.body);
        this.pipe.blobSendRequest(this.Enum.Command.CommunityService.Post.CHAT, param, fileBuffer, callback, percentCallback);
    }
};

Post.prototype.photo = function(param, photoBuffer, callback, percentCallback) {
    param.body.photo = param.body.photo || {};
    param.body.photo.name = param.body.photo.name || '*unknown*';
    param.body.photo.type = param.body.photo.type || '*unknown*';
    param.body.photo.size = photoBuffer.length;

    param.Context = param.body.photo;
    param.body = this.messageHelper.toJson(param.body);
    this.pipe.blobSendRequest(this.Enum.Command.CommunityService.Post.PHOTO, param, photoBuffer, callback, percentCallback);
};

Post.prototype.setReadPost = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Post.SET_READ_POST, param, null, callback);
};

Post.prototype.nextPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Post.NEXT_PAGE, param, null, callback);
};

Post.prototype.previousPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Post.PREVIOUS_PAGE, param, null, callback);
};

Post.prototype.onPost = function(callback) {
    this.pipe.on(this.Enum.Command.CommunityService.Post.On.POST, callback);
};

Post.prototype.onPostStats = function(callback) {
    this.pipe.on(this.Enum.Command.CommunityService.Post.On.POST_STATS, callback);
};

Topic.prototype.create = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.CREATE, param, null, callback);
};

Topic.prototype.update = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.UPDATE, param, null, callback);
};

Topic.prototype.delete = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.DELETE, param, null, callback);
};

Topic.prototype.search = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.SEARCH, param, null, callback);
};

Topic.prototype.nextPage = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.NEXT_PAGE, param, null, callback);
};

Topic.prototype.follow = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.FOLLOW, param, null, callback);
};

Topic.prototype.unfollow = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.UNFOLLOW, param, null, callback);
};

Topic.prototype.following = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.FOLLOWING, param, null, callback);
};

Topic.prototype.followers = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.CommunityService.Topic.FOLLOWERS, param, null, callback);
};

Blob.prototype.writeBlob = function(param, arrayBuffer, callback, percentCallback) {
    param.file = param.file || {};
    param.file.name = param.file.name || '*unknown*';
    param.file.type = param.file.type || '*unknown*';

    try {
        param.file.size = arrayBuffer.length;
    } catch (err) {}

    param.Context = param.file;
    this.pipe.blobSendRequest(
        this.Enum.Command.BlobService.Blob.WRITE_BLOB,
        param,
        arrayBuffer,
        function(error, result, payload, roundTripTime, serverLatency) {
            if (!error) {
                var innerResult = {
                    file: result.file,
                };
                innerResult.file.blobId = result.blobId;

                callback(error, innerResult, payload, roundTripTime, serverLatency);

            } else {
                callback(error, result, payload, roundTripTime, serverLatency);
            }
        },
        percentCallback);
};

Blob.prototype.readBlob = function(param, callback, percentCallback) {
    this.pipe.blobReceiveRequest(
        this.Enum.Command.BlobService.Blob.READ_BLOB,
        param,
        null,
        function(error, result, payload, roundTripTime, serverLatency) {
            if (!error) {
                var innerResult = {
                    file: result.Context
                };
                innerResult.file.blobId = result.blobId;

                callback(error, innerResult, payload, roundTripTime, serverLatency);

            } else {
                callback(error, result, payload, roundTripTime, serverLatency);
            }
        },
        percentCallback);
};

Blob.prototype.writeChunk = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.BlobService.Blob.WRITE_CHUNK, param, null, callback);
};

Blob.prototype.readChunk = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.BlobService.Blob.READ_CHUNK, param, null, callback);
};

Blob.prototype.cancelBlob = function(param, callback) {
    this.pipe.sendRequest(this.Enum.Command.BlobService.Blob.CANCEL_BLOB, param, null, callback);
};