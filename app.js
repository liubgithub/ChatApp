//过程
// app调用scripts
// scripts 作为 package加载，调用script/main
// main载入module vendor等
// 在$ domready 执行 bootstrap(document) 即可
require.config({
    urlArgs: 'bust=' + (new Date()).getTime(),//调试用，防止缓存
    packages: [
        'scripts'
    ],
    paths: {
        //vendor 外载库、
        //ionic 库是webapp基础框架，内置angular.js，并提供多种基于ng的元素
        ionic: 'lib/ionic/js/ionic.bundle',
        socket: 'lib/socket.io/socket.io',
        angularSocket: 'lib/angular-socket-io/socket.min'
    },
    shim: {
        angularSocket: {
            deps: ['ionic']
        }
    }
});

require(['ionic', 'angularSocket', 'socket', 'scripts'], function (ionic,angularSocket, socket, scripts) {
    scripts.app.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
        //设置视图缓存数目
        $ionicConfigProvider.views.maxCache(10);
        //tab选项卡在底部
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        //设定默认回退字样
        $ionicConfigProvider.backButton.text('返回').icon('ion-chevron-left');
        //设定安卓设备头部显示区域
        $ionicConfigProvider.tabs.style('standard');

        $stateProvider
            .state('tour', {
                url: "/tour",
                templateUrl: "views/tour.html",
                controller: 'tourController'
            })
        // Each tab has its own nav history stack:
     .state('tab', {
           url: "/tab",
           abstract: true,
           templateUrl: 'views/tabs.html',
           controller:'webAppController'
      })
      .state('tab.messages', {
          url: "/messages",
          views: {
              'tab-messages': {
                  templateUrl: 'views/tab-messages.html',
                  controller: 'msgRecordController'
              }
          }
      })
     .state('tab.users-chats', {
           url: "/chats/:username",
           views: {
                 'tab-users': {
                 templateUrl: 'views/chats.html',
                 controller: 'ChatCtrl'
                  }
              }
        })
     .state('tab.users', {
         url: "/users",
         views: {
             'tab-users': {
                 templateUrl: 'views/tab-users.html',
                 controller: "PeopleCtrl"
             }
         }
     })
  .state('tab.user-chat', {
      url: "/messages/:username",
      views: {
          'tab-messages': {
              templateUrl: 'views/chats.html',
              controller: 'ChatCtrl'
          }
      }
  })
  .state('tab.account', {
      url: "/account",
      views: {
          'tab-account': {
              templateUrl: 'views/tab-account.html',
              controller: 'userInfoController'
          }
      }
  })
  .state('tab.meDetails', {
      url: "/account/meDetails",
      views: {
          'tab-account': {
              templateUrl: 'views/meDetails.html',
              controller: 'meDetailController'
          }
      }
  })
  .state('index', {
      url: "/index",
      templateUrl: "views/index.html",
      controller: 'indexController'
  })
   .state('register', {
       url: "/register",
       templateUrl: "views/register.html",
       controller: "regController"
   })
   .state('login', {
            url: "/login",
            templateUrl: "views/me.html",
            controller: "loginController"
   })
 .state('tab.users-search', {
          url: "/users/addfriend",
          views: {
              'tab-users': {
                  templateUrl: 'views/searchFriend.html',
                  controller: "addfriendController"
              }
          }
      })
   //
   $urlRouterProvider.otherwise('/login');
})
.run(function ($ionicPlatform, $location) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleLightContent();
            }
        });
        var firstVisit = localStorage.getItem('firstVisit');
        if (!firstVisit) {
            $location.url('/tour');
        }
    });
    
    //传统页面驱动
    angular.bootstrap(document, ['webApp']);

    //region载入完成后的回调
    angular.$allloaded = function () {
        
    }
});