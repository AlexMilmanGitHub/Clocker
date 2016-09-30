'Use Strict';
angular.module('App').controller('tabsCtrl', function ($scope, $localStorage,FURL, FbData) {
     
    // Reference to the Firebase database.
    var ref = new Firebase(FURL);
    $scope.data = {};
    // $scope.isWorker = true;
    //console.log("TABS CTRL START"); 
    
//    if (userTypeGlobal === "WORKER") {
//            $scope.isWorker = false;
//         console.log("isWorker:"+  $scope.isWorker);
//        }
//        else {
//            $scope.isWorker = true;
//               console.log("FALSE-isWorker:" +  $scope.isWorker);
//        }
    
    
    $scope.isWorker = function () {
        //console.log(FbData.getCurrUserType());
        if(FbData.getCurrUserType() === "WORKER"){
            return false;
        }
        else{
            return true;
        }
    }
   
}
);
