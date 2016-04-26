/**
*   提供对象的基本功能 ,包括继承,判断等
*   @author }{hk date 2014/10/14
*   @class objectUtils
*/
define(function () {

    var _objUtil = function () {

    }

    _objUtil.extend = function (child, parent) {
        for (var key in parent.prototype) {
            if (!(key in child.prototype)) {
                child.prototype[key] = parent.prototype[key];
            }
        }
        child.__super__ = parent.prototype;
        return child;
    }

    _objUtil.isArray = Array.isArray;

    /**
    *   判断是否为object对象
    *   参考自underscore
    *   http://www.css88.com/doc/underscore/docs/underscore.html
    */
    _objUtil.isObject = function (obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    /**
    *   判断是否为string
    *   参考自underscore
    *   http://www.css88.com/doc/underscore/docs/underscore.html
    */
    _objUtil.isString = function (obj) {
        return toString.call(obj) === '[object String]';
    }


    return _objUtil;

});