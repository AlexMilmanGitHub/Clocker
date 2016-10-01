/*
forget.js
Creates the forgotController Controller.
This controller handles password reset. 
*/
'Use Strict';
angular.module('App').controller('forgotController', function ($scope, $localStorage, $location, $ionicHistory, Auth, FURL, Utils) {

  $scope.resetpassword = function(user) {
      if(angular.isDefined(user)){
      Auth.resetpassword(user)
        .then(function() {
              Utils.alertshowWithPromise("Reset Password for " + $localStorage.email, "Password Reset Email Was Sent Successfully!").then(function(){
          $location.path('/login');
          //console.log("Password reset email sent successfully!");
            });
          //console.log("Password reset email sent successfully!");
          $location.path('/login');
        }, function(err) {
           //console.error("Error: ", err);
        });
      }
    };
    
    $scope.back = function(){
        $ionicHistory.goBack();
    };
});
