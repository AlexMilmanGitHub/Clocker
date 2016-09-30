'Use Strict';
angular.module('App').controller('registerController', function ($scope, $location, $ionicHistory, Auth, Utils) {

  $scope.register = function(user) {
    if(angular.isDefined(user)){
    Utils.show();
    Auth.register(user)
      .then(function() {
         Utils.hide();
         //console.log("Before Log-In:" + JSON.stringify(user));
         Utils.alertshow("Successfully","The User was Successfully Created.");
         $location.path('/');
      }, function(err) {
         Utils.hide();
         Utils.errMessage(err);
      });
    }
  };

    $scope.back = function(){
        $ionicHistory.goBack();
    };
});
