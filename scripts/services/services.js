/**
*   定义空的services，其他的service可通过
*   services.factory('name',function(){})添加进来，作为索引使用
*/
define(['ionic'], function (ionic) {
    return angular.module('services',[]);
});