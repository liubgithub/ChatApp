define(['objutil'], function (objutil) {
    var serverUrl = "http://localhost:1337/";
    //var serverUrl = "http://119.29.138.169:3000/";
    var isString = objutil.isString,
    isObject = objutil.isObject;

    var storeData = function (key, object) {
        var value = '';
        if (isObject(object)) {
            value = JSON.stringify(object);
        } else {
            value = object;
        }
        localStorage.setItem(key, value);
        return value;
    };


    var clearData = function (key) {
        localStorage.removeItem(key);
    }

    var getData = function (key) {
        var value = localStorage.getItem(key);
        try {
            var obj = JSON.parse(value);
            return obj;
        }
        catch (e) {
            return value;
        }
    };
    //创建图标path
    var createIconPath = function (count) {
        var _path = '';
        for (var i = 1; i <= count; i++) {
            _path = _path + '<span class="path' + i.toString() + '"></span>';
        }
        return _path;
    };
    //获取用户名
    var getVisitor = function (userInfo) {
        var visitor = "";
        //如果userInfo存在
        if (userInfo != null && userInfo != undefined && userInfo.userInfo != undefined) {
            visitor = userInfo.userInfo.UserName;
        }
        else {
            //未登录用户生成随机字符串
            visitor = randomString(16);
            storeData("userInfo", {
                content: "未登录用户",
                userInfo: {
                    UserName: visitor
                }
            });
        }
        return visitor;
    };
    //存储好友列表
    var userInfo = {
        loginStatus: '',
        face:'',
        username: '',
        token: '',
        nickName: '',
        realName: '',
        phoneNumber: '',
        QQ: '',
        WeiXin: '',
        Gender: '',
        Birthday: ''
    };
    return {
        serverUrl: serverUrl,
        storeData: storeData,
        getData: getData,
        clearData:clearData,
        getVisitor: getVisitor,
        createIconPath: createIconPath,
        userInfo: userInfo
    }
});