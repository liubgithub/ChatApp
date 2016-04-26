define(['controllers', 'dataStorage'], function (controllers, dataStorage) {
    var time =new Date();
    var tipsAction = function (id) {
        var tip = document.getElementById(id);
        tip.style.display = "block";
        setTimeout(function () {
            tip.style.display = "none";
        }, 2000);
    };
    controllers.controller('regController', ['$scope', '$http', '$location', 'regService', function ($scope, $http,$location, regService) {
        var _url = dataStorage.serverUrl + "user/register";
        $scope.registryControl = function (name, psd, email) {
            var postData = {
                name: name,
                psd: psd,
                email: email
            };
            var callback = {
                success: function (data) {
                    if (data.status == "ok") {
                        $scope.registrytips = "注册成功";
                        //$location.url('/tab/messages');
                    }
                    else if (data.status == "failure") {
                        $scope.registrytips = "用户名已经存在";
                        tipsAction("registrytips");
                    }
                },
                failure: function (data, status) {
                    $scope.registrytips = "注册失败";
                    tipsAction("registrytips");
                }
            }
            regService.register(_url,postData,callback);
        }
    }]);

    controllers.controller('loginController', ['$scope', '$http', '$location', 'loginService', 'Socket', '$rootScope', 'Chat', '$ionicHistory', function ($scope, $http, $location, loginService, Socket, $rootScope, Chat, $ionicHistory) {
        var _url = dataStorage.serverUrl+"user/login";

        $scope.loginIn = function (loginname, loginpsd) {
            var requestUrl = _url + '/' + loginname + '/' + loginpsd;

            var setMessageData = function (data) {
                var len = data.length;
                var MessageObject = [];
                for (var i = 0; i < len; i++) {
                    MessageObject.push({
                        msg: data[i].msg,
                        me: data.username,
                        time: time.getDate(),
                        from: data[i].from,
                        friend: data[i].from,
                        chatFriend: data[i].chatFriend,
                        read: false
                    });
                }
                return MessageObject;
            }
            var callback = {
                success: function (data) {
                    if (data.loginStatus == 'ok') {
                        $scope.logintips = "用户登录成功";
                        var views = $ionicHistory.viewHistory();
                        dataStorage.userInfo = data;
                        dataStorage.userInfo.username = data.name;
                        delete dataStorage.userInfo.name;
                        dataStorage.storeData("userInfo", dataStorage.userInfo);
                        var user = dataStorage.userInfo.username;
                        var onName = user + "messages";
                        //先注册一个接收离线消息的事件，一旦服务器端发送事件，事件被监听
                        Socket.on(onName, function (data) {
                            var offlineMessage = data;
                            offlineMessage.username = dataStorage.userInfo.username;
                            var MessageObject = setMessageData(offlineMessage);
                            Chat.updateMessages(MessageObject);
                        });

                        Socket.emit("join", { from: user });
                        //监听来自其他用户发来的信息
                        Socket.on(user, function (data) {
                            data.username = dataStorage.userInfo.username;
                            var MessageObject = setMessageData(data);
                            Chat.updateMessages(MessageObject);
                            Chat.scrollBottom();
                        });
                        //用户登录,
                        $rootScope.Socket = Socket;
                        $location.url('/tab/messages');
                    }
                    else if (data.loginStatus == 'failure') {
                        $scope.logintips = "用户不存在";
                        tipsAction("logintips");
                    }
                },
                failure: function (data, status) {
                    $scope.logintips = "网络出现问题";
                    tipsAction("logintips");
                }
            }
            loginService.login(requestUrl, callback);
        };
        $scope.$on("$ionicView.enter", function (e) {
            //清除浏览历史痕迹
            $ionicHistory.clearHistory();
        });
    }]);

    controllers.controller('userInfoController', ['$scope', '$http', '$location', 'userInfoService', function ($scope, $http, $location, userInfoService) {
        $scope.$on("$ionicView.enter", function (e) {
            $scope.userIcon = userInfoService.getUserIcon();
            var userInfo = dataStorage.getData("userInfo");
            if (userInfo)
                $scope.userName = userInfo.username;
        });
    }]);

    controllers.controller('meDetailController', ['$scope', '$http', '$location', '$ionicModal', 'userInfoService', '$ionicHistory',
        function ($scope, $http, $location, $ionicModal, userInfoService, $ionicHistory) {

        $scope.$on('$ionicView.enter', function (e) {
            $scope.settings1 = userInfoService.getDetailSetting1();
            $scope.Gender = userInfoService.getGender();
            $scope.settings2 = userInfoService.getDetailSetting2();
            $scope.birthsetting = userInfoService.getBirth();
        });

        $ionicModal.fromTemplateUrl('views/uinfoEdit.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.meModal = modal;
        });

        $scope.openModal = function (item) {
            $scope.currentItem = item;
            $scope.meModal.show();
        }

        $scope.closeModal = function (option) {
            if (option && option == "ok") {
                var _propertyName = $scope.currentItem.propertyname;
                var _value = document.getElementById("input").value;
                userInfoService.editUserInfo(_propertyName, _value, {
                    success: function (data) {
                        if (data.status == "ok") {
                            $scope.currentItem.value = _value;
                           // $$toast('信息修改成功');
                        }
                        else if (data.status == "fail")
                            $$toast(data.content);
                    },
                    failure: function (data, status) {
                        //$$toast('信息修改失败' + JSON.stringify(status));
                    }
                });
            }
            $scope.meModal.remove();
        }

        $scope.$on('modal.hidden', function (root, s1, s2, s4) {
            $scope.meModal = $ionicModal.fromTemplateUrl('views/uinfoEdit.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function (modal) {
                $scope.meModal = modal;
            });
        });

        $scope.$on('destory', function () {
            $scope.meModal.remove();
        });

        $scope.loginOut = function () {
            dataStorage.storeData("loginStatus", "fail");
            dataStorage.clearData("userInfo");
            $ionicHistory.clearHistory();
            $location.url('/login');
        }

        $scope.genderSelect = function (value) {
            userInfoService.editUserInfo("Gender", value, {
                success: function (data) {
                    $scope.selected = value;
                    $scope.option = (value == '男') ? '女' : '男';
                    //$$toast('信息修改成功');
                },
                failure: function (data, status) {
                    //$$toast('信息修改失败' + JSON.stringify(status));
                }
            });
        };
    }]);
});