define(['services', 'dataStorage'], function (services, dataStorage) {
    services.factory('regService', function ($http) {
        var register = function (url,postData,callback) {
            var _postData = postData;
            var config = [{ languageColumn: 'name_eu' }, { "Content-Type": "application/x-www-form-urlencoded" }];
            $http.post(url, _postData, config).success(function (data) {
                callback.success(data);
            })
            .error(function (data, status) {
                callback.failure(data, status);
            });
        };

        return {
            register:register
        }
    });

    services.factory('loginService', function ($http) {
        var login = function (url,callback) {
            $http.get(url).success(function (result) {
                callback.success(result);
            })
            .error(function (result, status) {
                callback.failure(result, status);
            });
        }
        return {
            login:login
        }
    });

    services.factory('userInfoService', function ($http) {
        var rootUrl = dataStorage.serverUrl;
        var userIcon = {
            user: {
                icon: 'icon-port',
                paths: dataStorage.createIconPath(4)
            },
            memicrorel: {
                icon: 'icon icon-memicroRel',
                paths: dataStorage.createIconPath(8)
            },
            empty: {
                icon: 'icon icon-empty',
                paths: dataStorage.createIconPath(5)
            },
            about: {
                icon: 'icon icon-about',
                paths: dataStorage.createIconPath(5)
            },
            msg: {
                icon: 'icon icon-msg',
                paths: dataStorage.createIconPath(10)
            },
            setting: {
                icon: 'icon icon-set',
                paths: dataStorage.createIconPath(3)
            }
        };

        //用户设置信息配置项
        var userDetailSetting1 = [{
            text: "昵称",
            type: "text",
            propertyname: "nickName",
            value: "暂无"
        },
        {
            text: "姓名",
            type: "text",
            propertyname: "realName",
            value: "未填写"
        }];
        var userDetailSetting2 = [
       {
           text: "电话",
           type: "text",
           propertyname: "phoneNumber",
           value: "未填写"
       },
       {
           text: "QQ",
           type: "text",
           propertyname: "QQ",
           value: "未填写"
       }, {
           text: "微信",
           type: "text",
           propertyname: "WeiXin",
           value: "未填写"
       }];

        var genderSetting = {
            text: "性别",
            propertyname: "Gender",
            value: "男"
        };
        var birthSetting = {
            text: "生日",
            type: "date",
            propertyname: "Birthday",
            value: "未填写"
        };
        //数据更新后，需要对其进行更新
        var setUserInfo1 = function (data) {
            for (var i = 0; i < userDetailSetting1.length; i++) {
                if (data[userDetailSetting1[i].propertyname] != null)
                    userDetailSetting1[i]["value"] = data[userDetailSetting1[i].propertyname];
                else
                    userDetailSetting1[i]["value"] = "未填写";
            }

        }
        var setUserInfo2 = function (data) {
            for (var j = 0; j < userDetailSetting2.length; j++) {
                if (data[userDetailSetting2[j].propertyname] != null)
                    userDetailSetting2[j]["value"] = data[userDetailSetting2[j].propertyname];
                else
                    userDetailSetting2[j]["value"] = "未填写";
            }
        }

        //编辑用户信息
        var editUserInfo = function (propertyName, value, callback) {
            var _user = dataStorage.getData("userInfo");
            var editUserInfoUrl = rootUrl + "user/modify/";

            var _requestUrl = editUserInfoUrl + _user.username + "/" + _user.token + "/" + propertyName + "/" + value;
            $http.get(_requestUrl).success(function (data) {
                if (!!data) {
                    if (data.status == "ok") {
                        //编辑成功，存储本地
                        _user[propertyName] = value;
                        dataStorage.storeData("userInfo", _user);
                        callback.success(data);
                    }
                    else if (data.status == "fail")
                        callback.success(data);
                }
            }).error(function (data, status) {
                callback.failure(data, status);
            });
        };
        return {
            getUserIcon: function () {
                return userIcon;
            },
            //获取用户信息设置
            getDetailSetting1: function () {
                var userInfo = dataStorage.getData('userInfo');
                setUserInfo1(userInfo);
                return userDetailSetting1;
            },
            //获取用户信息设置
            getDetailSetting2: function () {
                var userInfo = dataStorage.getData('userInfo');
                setUserInfo2(userInfo);
                return userDetailSetting2;
            },
            //编辑用户信息
            editUserInfo: editUserInfo,
            getGender: function () {
                var user = dataStorage.getData("userInfo");
                var selected = (user.Gender != undefined) ? user.Gender : "男";
                var option = (selected == '男') ? '女' : '男';
                return { selected: selected, option: option };
            },
            getBirth: function () {
                var user = dataStorage.getData("userInfo");
                var birthday = user.Birthday;
                birthSetting.value = birthday;
                return birthSetting;
            }
        }
    });


});