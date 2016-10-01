/*
settingsCtrl.js
Creates the settingsCtrl Controller.
This controller handles user settings and incuding logout, changing password and Account deletion.
*/

'Use Strict';
angular.module('App').controller('settingsCtrl', function($scope, $location, $window, $state, $localStorage, $ionicPopup, Auth, FbData, FURL, Utils) {
    
    var dbRef = new Firebase(FURL);
    $scope.data.pass = null;
    $scope.data.email = $localStorage.email;
    
    
    $scope.avatarArr = [  
        "img/avatar1.png",
        "img/avatar2.png",
        "img/avatar3.png",
        "img/avatar4.png",
        "img/avatar5.png",
        "img/avatar6.png",
        "img/avatar7.png",
        "img/avatar8.png",
        "img/avatar9.png",
    ];
    
    $scope.toggle = function (avatar) {
        console.log(avatar);
        $scope.selectedAvatar = avatar;
        
        var confirmPopup = $ionicPopup.confirm({
            title: "Pick This Avatar?",
            template: "Are You Sure You Want This Avatar?"
        });
        confirmPopup.then(function(res) {
            if(res) {
            console.log('Selection Confirmed');
            FbData.setCurrUserAvatar($scope.selectedAvatar);
            Utils.alertshow("Look At You Now!","Your Avatar Has Changed!");
           }else {
            console.log('Selection Canceled');
         }
        });  
    };
    
      $scope.logOut = function () {
          
          Auth.logout();
   
          $state.go('login', {}, {reload: false}).then(function(){
        setTimeout(function() {
          $window.location.reload(true);
        }, 500);
      });
  };
    
    $scope.resetPassword = function(){
        Auth.resetpassword({"email":$localStorage.email}).then(function() {
            
            Utils.alertshowWithPromise("Reset Password for " + $localStorage.email, "Password Reset Email Was Sent Successfully!").then(function(){
                  $location.path('/login');
                  //console.log("Password reset email sent successfully!");
            });
        }, function(err) {
           //console.error("Error: ", err);
        });
    };
    
        $scope.changePassword = function(){
            
                var resetPassPopup = $ionicPopup.show({
                    template: '<input type="password" placeholder="Old password" ng-model="data.oldPass"><br> <input type="password" placeholder="New password" ng-model="data.newPass">',
                    title: "New Password For " + $localStorage.email,
                    scope: $scope,
                    buttons: [
                        { text: 'Cancel' },
                        {
                        text: '<b>Change</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            return "Tap!";
                        }
                }]});  

                resetPassPopup.then(function(res) {    
                    if(res && $scope.data.oldPass && $scope.data.newPass){
                        Auth.changePassword({"email":$localStorage.email, "oldPass":$scope.data.oldPass,"newPass":$scope.data.newPass}).then(function() {
                            Utils.alertshow("Password Changed!", "Your Password Changed Successfully!");
                        }, function(err) {
                           //console.error("Error: ", err);
                            Utils.alertshow("Incorrect Password!", "Your Old Password is Incorrect.\nPlease Try Again.  ");
                        });
                    }
                });
    };
    
    
    $scope.deleteUser = function () {

        var myPopup = $ionicPopup.show({
            template: '<input type="password" ng-model="data.pass">',
            title: "Enter Password for " + $localStorage.email,
            scope: $scope,
            buttons: [
                { text: 'Cancel', onTap: function(e) { $scope.data.pass = null; return $scope.data.pass; }  },
                {
                text: '<b>Delete Account</b>',
                type: 'button-assertive',
                onTap: function(e) {
                    if (!$scope.data.pass) {
                    
                    e.preventDefault();
                        console.log($scope.data.pass);
                    } else {
                    return $scope.data.pass;
                    }
                }
                }
            ]
            });  
                   
                myPopup.then(function(workerPassword) {
                    if($scope.data.pass){
                        dbRef.removeUser({
                          email: $scope.data.email,
                          password: workerPassword
                        }, function(error) {
                          if (error) {
                            switch (error.code) {
                              case "INVALID_USER":
                                console.log("The specified user account does not exist.");
                                break;
                              case "INVALID_PASSWORD":
                                Utils.alertshow("Something is Wrong", "Please Make Sure You Have the Correct Password");
                                console.log("The specified user account password is incorrect.");
                                break;
                              default:
                                Utils.alertshow("Something is Wrong", "Please Try Again Later...");
                                console.log("Error removing user:", error);
                            }
                          } else {
                              FbData.deleteUser($localStorage.userkey).then(function(err){
                                     
                                  var alertPopup = $ionicPopup.alert({
                                        title: "Sad to see you Go",
                                        template: "Your User account was Deleted Successfully!"
                                    });
                                  
                                    alertPopup.then(function(res) {
                                        console.log("User account deleted successfully!");
                                        $scope.logOut();
                                    });
                              });
                              
                            
                            }
                        });
                }
            });
        
          
    }
});