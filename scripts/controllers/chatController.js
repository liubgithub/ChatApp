define(['controllers', 'dataStorage'], function (controllers,dataStorage) {
    var searchFriend;
    var scrollPosition = 0;
    var time = new Date();
    var chatFriend;
    controllers.controller('ChatCtrl', ['$scope', '$stateParams', '$ionicPopup', '$timeout', 'Socket', 'Chat', '$rootScope', '$ionicScrollDelegate', function ($scope, $stateParams, $ionicPopup, $timeout, Socket, Chat, $rootScope, $ionicScrollDelegate) {
        var messageread = true;
        var userInfo = dataStorage.getData("userInfo");
        var to = $stateParams.username;
        //历史消息记录器
        var MeTo = userInfo.username + "_" + to;
        var msgRecord = dataStorage.getData(userInfo.username);
        var typing = false;
        var lastTypingTime;
        var TYPING_TIMER_LENGTH = 250;
        //将未读消息设置为已读消息
        var setMessageRead = function (m) {
            for (var index = 0; index < m.messages.length; index++) {
                var msg = m.messages[index];
                if (msg.read == false)
                    msg.read = true;
            }
        };
        //发送消息的方法
        var sendMsgTo = function (socket, from, to, msg){
            socket.emit('send.to', {
                from: from,
                to: to,
                msg: msg
            });
            //任何时候，都从localstorage中拿取消息
            var _msgRecord = dataStorage.getData(userInfo.username);
            _msgRecord[MeTo].messages.push({
                me: from,
                msg: msg,
                friend: to,
                from:from,
                time: time.getDate(),
                read:false
            });
            setMessageRead(_msgRecord[MeTo]);
            $scope.messages = _msgRecord[MeTo].messages;
            Chat.scrollBottom();
            dataStorage.storeData(userInfo.username, _msgRecord);
        }
        //每位好友应该对应有相应的消息存储器
        //首先如果localStorage里面不存在对应的消息存储数据，就自己创建一个对象用来记录消息历史,而且做好实时记录工作
        if (!msgRecord) {
            msgRecord = {};
            dataStorage.storeData(userInfo.username, msgRecord);
        }
        if (!msgRecord[MeTo]) {
            msgRecord[MeTo] = { messages: [], friend: to, chatFriend: chatFriend.nickName };
            dataStorage.storeData(userInfo.username, msgRecord);
        }
        //存储滚动条的位置，因为每次返回后，滚动条会重置到顶部，体验效果不好
        $scope.scrollPosition = scrollPosition;
        //将消息设置成已读
        setMessageRead(msgRecord[MeTo]);
        $scope.messages = msgRecord[MeTo].messages;
        dataStorage.storeData(userInfo.username, msgRecord);
        $scope.$on("$ionicView.enter", function (e) {
            var m = dataStorage.getData(userInfo.username);
            //将消息设置成已读
            setMessageRead(m[MeTo]);
            $scope.messages = m[MeTo].messages;
            Chat.scrollBottom();
        });

        //测试
        if ($stateParams.username) {
            //$scope.data.message = "@" + $stateParams.username;
            //document.getElementById("msg-input").focus();
        }
       
        $scope.messageIsMine = function (username) {
            return userInfo.username === username;
        };

        $scope.getBubbleClass = function (username) {
            var classname = 'from-them';
            if ($scope.messageIsMine(username)) {
                classname = 'from-me';
            }
            return classname;
        };

        $scope.sendMessage = function (msg) {
            if (userInfo.loginStatus == "ok") {
                if (!!$rootScope.Socket) {
                    sendMsgTo($rootScope.Socket, userInfo.username, to, msg);
                    var input = document.getElementById("msg-input");
                    input.value = "";
                }
            }
        };

        Chat.update = function () {
            //更新
            $scope.$apply(function () {
                scrollPosition = $ionicScrollDelegate.getScrollPosition().top;
                var _msgRecord = dataStorage.getData(userInfo.username);
                //将消息设置成已读
                setMessageRead(_msgRecord[MeTo]);
                $scope.messages = _msgRecord[MeTo].messages;
            });
        };
    }]);

    controllers.controller('PeopleCtrl', ['$scope','Users','$location',function ($scope, Users,$location) {
        var rootUrl = dataStorage.serverUrl;
        $scope.$on('$ionicView.enter', function (e) {
            var userInfo = dataStorage.getData("userInfo");
            var url = rootUrl + "user/friends/" + userInfo.token;
            Users.getFriendList(url, {
                success: function (data) {
                    $scope.friendList = data;
                },
                failure: function (data, status) {
                    console.log("获取朋友列表失败!");
                }
            });
        });
        $scope.searchUser = function (username) {
            var url = rootUrl + "user/search/" + username;
            Users.searchUser(url, {
                success: function (result) {
                    if (result) {
                        searchFriend=result;
                        $location.path('/tab/users/addfriend');
                    }
                    else {
                        alert("用户名或密码错误");
                    }
                },
                failure: function (result, status) {
                    alert('网络出现问题');
                }
            });
        };
        //传入点击的friend对象
        $scope.setFriend = function (friend) {
            chatFriend = friend;
        }
    }]);

    controllers.controller('addfriendController', ['$scope', 'Users', function ($scope, Users, Chats) {
        var rootUrl = dataStorage.serverUrl;
        $scope.$on('$ionicView.enter', function (e) {
            $scope.searchFriend = searchFriend;
        });

        $scope.addFriend = function () {
            var userInfo = dataStorage.getData("userInfo");
            if (!!$scope.searchFriend && userInfo.loginStatus == "ok") {
                var url = rootUrl + "user/addOne/" + userInfo.username + "/" + $scope.searchFriend.name;
                Users.addOne(url, {
                    success: function (data) {

                    },
                    failure: function (data, status) {

                    }
                });
            }
            else
                console.log("添加失败!");
        }
    }]);

    controllers.controller('ChatDetailCtrl', ['$scope', '$stateParams', 'Chats', function ($scope, $stateParams, Chats) {
        $scope.chat = Chats.get($stateParams.chatId);
    }]);

    controllers.controller('AccountCtrl', ['$scope', 'Chat', function ($scope, Chat) {
        $scope.username = Chat.getUsername();
    }]);

    //历史聊天记录Controller
    controllers.controller('msgRecordController', ['$scope', '$stateParams', 'Chat', function ($scope, $stateParams, Chat) {
        //获取未读消息的数量
        var getNotReadMSG = function (msgs) {
            var count = 0;
            for (var i = 0; i < msgs.messages.length; i++) {
                if (msgs.messages[i].read == false)
                    count++;
            }
            return count;
        }
        $scope.$on('$ionicView.enter', function (e) {
            //从聊天记录中遍历，然后在好友列表中查找与存的聊天记录对应的好友用户名，本来想直接存在聊天记录中的，
            //不用这样还根据用户名找好友的昵称，但是直接存感觉还是很别扭，不符合自己的逻辑思维方式
            Chat.updateOfflineMessage = function () {
                var userInfo = dataStorage.getData("userInfo");
                if (userInfo) {//避免userInfo为空
                    var msgRecords = dataStorage.getData(userInfo.username);
                    var _messages = [];
                    for (var MeTo in msgRecords) {
                        var len = msgRecords[MeTo].messages.length;
                        var _lastMessage = msgRecords[MeTo].messages[len - 1];
                        _messages.push({
                            friend:msgRecords[MeTo].friend,
                            friendNickName: msgRecords[MeTo].chatFriend,
                            lastMessage: _lastMessage,
                            newMessageNum: getNotReadMSG(msgRecords[MeTo]),
                        });
                    }
                    $scope.$apply(function () {
                        var _msgRecord = dataStorage.getData(userInfo.username);
                        $scope.MessageRecords = _messages;
                    });
                }
            }
            $scope.hasNoReadMessage = function (msg) {
                return msg.newMessageNum > 0;
            }
            Chat.updateOfflineMessage();
        });
    }]);
});