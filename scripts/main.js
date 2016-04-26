/**
*   app package目录打包
*   @author }{lb date 2015/08/24
*   @package scripts
*/
require.config({
    paths: {
        //通用函数
        objutil:'utils/objutil',
        services: 'scripts/services/services',
        controllers: 'scripts/controllers/controllers',
        tourController: 'scripts/controllers/tourController',
        webAppController: 'scripts/controllers/webAppController',
        indexController: 'scripts/controllers/indexController',
        chatController: 'scripts/controllers/chatController',
        userController: 'scripts/controllers/userController',
        //service
        chatService: 'scripts/services/chatService',
        userService: 'scripts/services/userService',
        dataStorage: 'scripts/services/dataStorage'
    }
});

//模块载入,启动app应用框架

define(['objutil', 'controllers', 'tourController', 'webAppController', 'indexController', 'services', 'chatController', 'userController', 'chatService', 'userService', 'dataStorage'],
    function (objutil,controllers, tourController,webAppController, indexController, services, chatController, userController, chatService, userService, dataStorage) {
        
    var app = angular.module('webApp', ['ionic', 'controllers', 'services', 'btford.socket-io']);
        return {
            app: app
        }
});