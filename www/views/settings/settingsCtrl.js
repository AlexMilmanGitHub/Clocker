'Use Strict';
angular.module('App').controller('settingsCtrl', function($scope, $location, $window, $state, $localStorage, Auth) {
    
    
      $scope.logOut = function () {

          Auth.logout();
   
           $state.go('login'); 
          
          //$localStorage.shouldClearDataFlag = true;
          //$location.path("/login");
     
          //$window.location.reload(true); // TODO CHECK IF IT WILL WORK WITHOUT REFRESH
          //ionic.Platform.exitApp();
  };
    
    
});