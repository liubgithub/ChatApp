define(['controllers'], function (controllers) {
    controllers.controller('tourController', ['$scope', '$location', function ($scope, $location) {
        var ion_nav_bar = document.getElementById("navbar");
        ion_nav_bar.style.visibility = "hidden";
        $scope.enter = function () {
            localStorage.setItem('firstVisit', '1');
            $location.url('/messages');
        }
    }]);
});