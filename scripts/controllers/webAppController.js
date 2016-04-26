define(['controllers', 'ionic'], function (controllers, ionic) {
    controllers.controller('webAppController', ['$scope', '$location', '$ionicNavBarDelegate',
    function ($scope, $location, $ionicNavBarDelegate) {
        $ionicNavBarDelegate.align('center');
        //显示ion-nav-bar
        var navbar = document.getElementById("navbar");
        navbar.style.visibility = "visible";
    }]);
});