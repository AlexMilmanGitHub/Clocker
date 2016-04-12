'Use Strict';
angular.module('App').controller('dashboardCtrl', function ($scope, $state, $q, $localStorage, $location, $http, $ionicPopup, $firebaseObject, $firebaseArray, Auth, FURL, Utils, $cordovaGeolocation, $ionicLoading, $ionicPlatform, GeoLocation, FbData) {
    
    
    $scope.init = function(){
        $scope.workersArray = [];
    
        $scope.showClockIn = !$localStorage.isClockedIn;
        $scope.showClockOut = $localStorage.isClockedIn;


        var userRef = FbData.getCurrUserRef();
        userRef.on('value', function (dataSnapshot) {
            $scope.data.currUser = dataSnapshot.val();
        });

        userRef.child('name').on('value', function (dataSnapshot) {
            $scope.data.userName = dataSnapshot.val();
            console.log( $scope.data.userName);
        });
    };
  
    //$scope.init();
    
    $scope.ClockIn = function () {
               
        GeoLocation.getCurrentPosition().then(function (currCoordinates) { //the promise makes sure that the current position is obtained before it is checked
            if (GeoLocation.isCurrentPositionLegal(currCoordinates) &&  $localStorage.isClockedIn === false) {

                GeoLocation.getAddress(currCoordinates.lat, currCoordinates.long).then(function (address) {
                    console.log("TEST_GEO:" + address);
                    FbData.addClockIn(Date(),currCoordinates.lat,currCoordinates.long, address);
                });
               
                $scope.showClockIn = false;
                $scope.showClockOut = true;
                FbData.setIsClockedIn("true");
            } 
            else {
                Utils.alertshow("Sorry You are not allowed to Clock-in from Here", "Please Try Again When your are closer...");
                $scope.showClockIn = true;
            }
        });
        
    }     
   
    $scope.ClockOut = function () {
        GeoLocation.getCurrentPosition().then(function (currCoordinates) {
            if (GeoLocation.isCurrentPositionLegal(currCoordinates) &&  $localStorage.isClockedIn === true) {
         
                GeoLocation.getAddress(currCoordinates.lat, currCoordinates.long).then(function (address) {
                    
                    FbData.addClockOut(Date(),currCoordinates.lat,currCoordinates.long, address);
                });

                $scope.showClockOut = false;
                $scope.showClockIn = true;
                FbData.setIsClockedIn("false");
            }
            else{
                Utils.alertshow("Sorry You are not allowed to Clock-Out from Here", "Please Try Again When your are closer...");
                $scope.showClockOut=true;
            }    
           });
        }
   
 
 $ionicPlatform.ready(function() {
     
     $scope.init();
     
   if(userTypeGlobal === "WORKER"){
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
        });   
         $localStorage.TimeSheetUserkey = $localStorage.userkey;
       
        GeoLocation.getGoogleMapWithCurrPos().then(function (map) {
            $scope.map = map;
            $ionicLoading.hide();
        });     
   }
   else if (userTypeGlobal === "EMPLOYER") {

        FbData.getCurrUserWorkersKeysRef().on('value', function(dataSnapshot){
            FbData.getCurrUserWorkers().then(function(workerArr){
                
                $scope.workersArray = workerArr; // update the workers list
                $scope.numWorkersClockedIn = 0;
                $scope.numWorkers = 0;
                angular.forEach($scope.workersArray, function(worker) {
                    
                    
                    $scope.numWorkers++;
                        (FbData.getDbRef().child("profiles/"+worker.key)).on('value', function(snap){
                            console.log(snap.val());

                            worker.value.isClockedIn = snap.val().isClockedIn; // Keep Track of when a user is clocked-in OR clocked-out

                            if (worker.value.isClockedIn === "true") {
                                $scope.numWorkersClockedIn++; //TODO FIX THIS
                                console.log("Num of Workers Clocked In is: "+$scope.numWorkersClockedIn);
                            }
                            else{
                                $scope.numWorkersClockedIn--; 
                                if($scope.numWorkersClockedIn<0){
                                    $scope.numWorkersClockedIn = 0;
                                }
                                console.log("Num of Workers Clocked In is: "+$scope.numWorkersClockedIn);
                            }
                        });
                    });
                });  
            });
            
    
        
        $scope.addWorker = function(){
            $scope.addWorkerModel = {};
            
            var myPopup = $ionicPopup.show({
            template: '<input type="email" ng-model="addWorkerModel.email">',
            title: "Enter Employee's Email Address",
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                text: '<b>Add</b>',
                type: 'button-positive',
                onTap: function(e) {
                    if (!$scope.addWorkerModel.email) {
                    //don't allow the user to close unless he enters valid email
                    e.preventDefault();
                        console.log($scope.addWorkerModel.email);
                    } else {
                    return $scope.addWorkerModel.email;
                    }
                }
                }
            ]
            });  
                   
                myPopup.then(function(workerEmail) {
                    
                    console.log('Looking for worker with email: ' + workerEmail);
                    
                    var tempRes = FbData.isWorkerLegalToAdd($scope.data.currUser.email, workerEmail, $scope.workersArray);
                    
                    if(tempRes === true)
                    {
                        FbData.addWorkerToCurrUser(workerEmail);
                    }
                    else if(workerEmail){
                        Utils.alertshow(tempRes,"Please Make Sure You Have the Correct Email Address");
                    }
                });
                   
        };
        
        $scope.deleteWorker = function(worker){
            FbData.deleteWorkerFromUser(worker.key);
        };
       
        $scope.editWorker = function(worker){ // TODO FIX THIS
            console.log("WORKER TO EDIT IS: "+ worker.key);
            
            Auth.currentWorkerToEdit = null;
            
            Auth.currentWorkerToEdit = FbData.getUser(worker.key);
            Auth.currentWorkerToEditKey = worker.key;

            Auth.currentWorkerToEdit.$loaded().then(function(){
                     console.log(Auth.currentWorkerToEdit);
                     $state.go('editWorker'); 
                });

           
            };
       
       $scope.doRefresh = function() {
        //TODO ADD REFRESHING DATA
      };
       

       
        }
    });
   

});
