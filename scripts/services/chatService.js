define(['services', 'socket', 'dataStorage'], function (services, socket, dataStorage) {
    services.factory('Socket', function () {
        var _serverUrl = dataStorage.serverUrl;
        var mySocket = socket.connect(_serverUrl);
        return mySocket;
    });

    services.factory('Users', function($http) {
        var usernames = [];
        usernames.numUsers = 0;
        var requestUser = function (url,callback) {
            $http.get(url).success(function (result) {
                callback.success(result);
            })
           .error(function (result, status) {
               callback.failure(result, status);
           });
        }

        var searchUser = function (url, callback) {
            requestUser(url, callback);
        };

        var addOne = function (url, callback) {
            requestUser(url, callback);
        };

        var getFriendList = function (url, callback) {
            requestUser(url, callback);
        }
        var getUserInfomation = function (url, callback) {
            $http.get(url).success(function (result) {
                callback.success(result);
            })
            .error(function (result, status) {
                callback.failure(result, status);
            });
        };
        return {
            getUsers: function () {
                return usernames;
            },
            addUsername: function (username) {
                usernames.push(username);
            },
            deleteUsername: function (username) {
                var index = usernames.indexOf(username);
                if (index != -1) {
                    usernames.splice(index, 1);
                }
            },
            setNumUsers: function (data) {
                usernames.numUsers = data.numUsers;
            },
            searchUser: searchUser,
            addOne:addOne,
            getFriendList:getFriendList
        };
    });

    services.factory('Chat', function ($ionicScrollDelegate, Socket, Users) {
        var username;
        var users = {};
        users.numUsers = 0;

        var messages = [];
        var TYPING_MSG = '. . .';

        var Notification = function (username, message) {
            var notification = {};
            notification.username = username;
            notification.message = message;
            notification.notification = true;
            return notification;
        };

        Socket.on('login', function (data) {
            Users.setNumUsers(data);
        });

        Socket.on('new message', function (msg) {
            addMessage(msg);
        });

        Socket.on('typing', function (data) {
            var typingMsg = {
                username: data.username,
                message: TYPING_MSG
            };
            addMessage(typingMsg);
        });

        Socket.on('stop typing', function (data) {
            removeTypingMessage(data.username);
        });

        Socket.on('user joined', function (data) {
            var msg = data.username + ' joined';
            var notification = new Notification(data.username, msg);
            addMessage(notification);
            Users.setNumUsers(data);
            Users.addUsername(data.username);
        });

        Socket.on('user left', function (data) {
            var msg = data.username + ' left';
            var notification = new Notification(data.username, msg);
            addMessage(notification);
            Users.setNumUsers(data);
            Users.deleteUsername(data.username);
        });

        var scrollBottom = function () {
            $ionicScrollDelegate.resize();
            $ionicScrollDelegate.scrollBottom(true);
        };

        var addMessage = function (msg) {
            msg.notification = msg.notification || false;
            messages.push(msg);
            scrollBottom();
        };

        var removeTypingMessage = function (usr) {
            for (var i = messages.length - 1; i >= 0; i--) {
                if (messages[i].username === usr && messages[i].message.indexOf(TYPING_MSG) > -1) {
                    messages.splice(i, 1);
                    scrollBottom();
                    break;
                }
            }
        };
        //将消息对象数组存到localstorage里面
        var StoreMessages = function (msgRecord,msgsObect) {
            for (var i = 0; i < msgsObect.length; i++) {
                if (msgRecord.messages && msgsObect) {
                    msgRecord.messages.push(msgsObect[i]);
                }
            }
            return msgRecord;
        }

        //更新接收进来的消息
        var updateMessages = function (msgData) {
            if (msgData.length && msgData.length >= 1) {//确保消息存在，且不为空
                var _me = msgData[0].me;
                var _friend = msgData[0].friend;
                var msgRecord = dataStorage.getData(_me);
                var MeTo = _me + "_" + _friend;
                if (!msgRecord) {
                    msgRecord = {};
                    dataStorage.storeData(_me, msgRecord);
                }
                if (!msgRecord[MeTo]) {
                    msgRecord[MeTo] = {
                        messages: [],
                        friend: _friend,
                        chatFriend: msgData[0].chatFriend
                    };
                    dataStorage.storeData(_me, msgRecord);
                }
                //msgRecord[MeTo].messages.push(msgData);
                StoreMessages(msgRecord[MeTo], msgData);
                //每更新一次消息后，都在localstorage中存储一次
                dataStorage.storeData(_me, msgRecord);
            }
            //更新一下消息记录
            if (this.update)
                this.update();
            if (this.updateOfflineMessage)
                this.updateOfflineMessage();
        }

        return {
            getUsername: function () {
                return username;
            },
            setUsername: function (usr) {
                username = usr;
            },
            getMessages: function (friendName) {
                if (!!this[friendName])
                    return this[friendName].messages;
            },
            sendMessage: function (msg) {
                messages.push({
                    username: username,
                    message: msg
                });
                scrollBottom();
                Socket.emit('new message', msg);
            },
            scrollBottom: function () {
                scrollBottom();
            },
            updateMessages:updateMessages
        };
    });

    services.factory('Chats', function () {
        // Might use a resource here that returns a JSON array

        // Some fake testing data
        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
        }, {
            id: 2,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
        }, {
            id: 3,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
        }, {
            id: 4,
            name: 'Mike Harrington',
            lastText: 'This is wicked good ice cream.',
            face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
        }];

        return {
            all: function () {
                return chats;
            },
            remove: function (chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function (chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    });
});