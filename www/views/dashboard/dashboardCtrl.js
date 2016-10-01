/*
dashboardCtrl.js
Creates the dashboardCtrl Controller, which acts as the main controller of the application.
This controller handles both the employer and worker dashboards, binds data to the view and makes available methods to handle Clock-In/ Clock-Out and display user data. 
*/


'Use Strict';
angular.module('App').controller('dashboardCtrl', function ($scope, $state, $localStorage, $ionicPopup, Auth, Utils, $ionicLoading, $ionicPlatform, GeoLocation, FbData, TimeManager) {
    
     var KM_TO_MILES = 0.621371;

    
    $scope.init = function(){

        $scope.data.workersArray = [];
    
        $scope.showClockIn = !$localStorage.isClockedIn;
        $scope.showClockOut = $localStorage.isClockedIn;
//console.log($localStorage.isClockedIn);

        var userRef = FbData.getCurrUserRef();
        userRef.on('value', function (dataSnapshot) {
            $scope.data.currUser = dataSnapshot.val();
        });
    };
    
    $scope.kmToMile = function(km){
        
        return String((km * KM_TO_MILES).toFixed(2));
    };
    
    $scope.ClockIn = function () {
          
        GeoLocation.getCurrentPosition().then(function (currCoordinates) { //the promise makes sure that the current position is obtained before it is checked
            //console.log($localStorage.isClockedIn);
            if (GeoLocation.isCurrentPositionLegal(currCoordinates) &&  ($localStorage.isClockedIn === false || $localStorage.isClockedIn === undefined)) {
                GeoLocation.getAddress(currCoordinates.lat, currCoordinates.long).then(function (address) {
                    //console.log("TEST_GEO:" + address);
                    FbData.addClockIn(Date(),currCoordinates.lat,currCoordinates.long, address,  $scope.data.currUser.companyName);
                });
               
                $scope.showClockIn = false;
                $scope.showClockOut = true;
                FbData.setIsClockedIn("true");
                Utils.alertshow("Clock-In Successful", "You Are Now Clocked-In!");
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
                    
                    FbData.addClockOut(Date(), currCoordinates.lat,currCoordinates.long, address);
                });

                $scope.showClockOut = false;
                $scope.showClockIn = true;
                FbData.setIsClockedIn("false");
                Utils.alertshow("Clock-Out Successful", "You Are Now Clocked-Out!");
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
        }, function(err){
            $ionicLoading.hide();
            Utils.alertshow("Error","Could Not Get Current Geo-Position");
        });     
       }
       else if (userTypeGlobal === "EMPLOYER") {

            FbData.getCurrUserWorkersKeysRef().on('value', function(dataSnapshot){
                
                FbData.getCurrUserWorkers().then(function(workerArr){
                 
                    $scope.data.workersArray = workerArr; // update the workers list
                    
                    //console.log( $scope.data.workersArray);
                    
                    $scope.data.numWorkersClockedIn = 0;
                    $scope.data.numWorkers = 0;
                    
                    angular.forEach($scope.data.workersArray, function(worker) {
                        
                        $scope.data.numWorkers++;
                            (FbData.getDbRef().child("profiles/"+worker.key)).on('value', function(snap){
                                //console.log(snap.val());
                                worker.value.isClockedIn = snap.val().isClockedIn; // Keep Track of when a user is clocked-in OR clocked-out
                                $scope.checkHowManyClockedIn();
                              //  console.log(snap.val());
                                //console.log("value chaned");
                            });
                        }); // end
                    });  
                });


            $scope.checkHowManyClockedIn = function(){
                
                  $scope.data.numWorkersClockedIn = 0;
                  angular.forEach($scope.data.workersArray, function(worker) {  
                        if (worker.value.isClockedIn === "true") {
                            //console.log( $scope.data.numWorkersClockedIn);
                            //console.log("add worker clock in");
                            $scope.data.numWorkersClockedIn++; //TODO FIX THIS
                            //console.log("Num of Workers Clocked In is: "+$scope.numWorkersClockedIn);
                        }
                  });
            };
           
            $scope.addWorker = function(){
                $scope.addWorkerModel = {};

                var myPopup = $ionicPopup.show({
                template: '<input type="email" placeholder="Employee Email" ng-model="addWorkerModel.email"><br> <input type="text" placeholder="Employee User ID" ng-model="addWorkerModel.workerUId">',
                title: "Enter Employee's Details",
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
                            //console.log($scope.addWorkerModel.email);
                        } else {
                        return {workerEmail:$scope.addWorkerModel.email, workerUId:$scope.addWorkerModel.workerUId};
                        }
                    }
                    }
                ]
                });  

                    myPopup.then(function(workerDetails) {

                        if(workerDetails){
                            //console.log('Looking for worker with email: ' + workerDetails.workerEmail);

                            var tempRes = FbData.isWorkerLegalToAdd($scope.data.currUser.email, workerDetails, $scope.data.workersArray);

                            if(tempRes === true)
                            {
                                FbData.addWorkerToCurrUser(workerDetails.workerEmail, $scope.data.currUser.companyName).then(function(){
                                    Utils.alertshow("Employee Added","A New Employee Was Successfully Added!")
                                });
                            }
                            else if(workerDetails.workerEmail){
                                Utils.alertshow(tempRes,"Please Make Sure You Have the Correct Email Address/ User ID");
                            }
                        }
                    });

            };

            $scope.deleteWorker = function(worker){
                FbData.deleteWorkerFromUser(worker.key);
            };

            $scope.editWorker = function(worker){
                //console.log("WORKER TO EDIT IS: "+ worker.key);

                Auth.currentWorkerToEdit = null;

                Auth.currentWorkerToEdit = FbData.getUser(worker.key);
                Auth.currentWorkerToEditKey = worker.key;

                Auth.currentWorkerToEdit.$loaded().then(function(){
                         //console.log(Auth.currentWorkerToEdit);
                         $state.go('editWorker'); 
                    });


                };

           $scope.doRefresh = function() {
            //TODO ADD REFRESHING DATA
          };

        }
     
    });
   
    $scope.timeWorkedThisMonth = function(userClock){
        
        return TimeManager.timeWorkedThisMonth(userClock);
    };

});
