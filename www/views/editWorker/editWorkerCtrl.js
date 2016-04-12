'Use Strict';
angular.module('App').controller('editWorkerCtrl', function ($scope, $state, $cordovaOauth, $localStorage, $location, $http, $window, $ionicPopup, $ionicHistory, $firebaseObject, $firebaseArray, Auth, FURL, Utils, $cordovaGeolocation, $ionicLoading, FbData, GeoLocation) {
    console.log(Auth.currentWorkerToEditKey);
    var geocoder = new google.maps.Geocoder();
      var ref = new Firebase(FURL);
 $scope.data = {};
   
 $scope.updateList = function () { 

     console.log("UPDATE LIST CALLED ");

     var workerRef = FbData.getRefToUserByKey(Auth.currentWorkerToEditKey);
     workerRef.child('name').on('value', function (dataSnapshot) {
         $scope.data.currWorkerName = dataSnapshot.val();
     });
     workerRef.child('email').on('value', function (dataSnapshot) {
         $scope.data.currWorkerEmail = dataSnapshot.val();
     });
     workerRef.child('isClockedIn').on('value', function (dataSnapshot) {
         $scope.data.currWorkerClockedIn = dataSnapshot.val();
     });
     workerRef.child('clock').on('value', function (dataSnapshot) {
         $scope.data.currWorkerClock = dataSnapshot.val();
     });
     workerRef.child('allowedCoordinates').on('value', function (dataSnapshot) {
         $scope.data.allowedCoordinates = dataSnapshot.val();
     });
 };
    
    
     $scope.updateList();
   
    
    $scope.addLocation = function(){
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
        });
           
       GeoLocation.getGoogleMapWithCurrPos().then(function (map) {
           $scope.map = map;
           console.log("EDIT WORKER: MAP-" + $scope.map);
        });
        
        $ionicLoading.hide();                                
    }
    
    $scope.codeAddress = function(map) {
        console.log("EDIT WORKER-ADDRESS: "+ $scope.data.address);
    geocoder.geocode( { 'address':  $scope.data.address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
          
          $scope.addressInputed = {"coordinates":{"lat": results[0].geometry.location.lat(), "long": results[0].geometry.location.lng()}, "address": $scope.data.address};
            //$scope.showSaveLocBtn = 'true';
      } else {
        $scope.addressInputed = null;
        console.log("Geocode was not successful for the following reason: " + status);
        Utils.alertshow("Address Not Found","Please Try Again...");
      }
    });
  };

    $scope.addNewAddress = function(){
        if($scope.addressInputed){
            console.log(Auth.currentWorkerToEdit);
               ref.child('profiles').orderByChild("id").equalTo(Auth.currentWorkerToEdit[Auth.currentWorkerToEdit.$indexFor('id')].$value).on("child_added", function(snapshot) {

              var currWorkerAllowedLocRef = new Firebase(FURL+"profiles/"+snapshot.key()+"/allowedCoordinates/");

                   FbData.addToUser({"coordinates": $scope.addressInputed.coordinates, "address":  $scope.addressInputed.address}, snapshot.key(), "allowedCoordinates");
              //currWorkerAllowedLocRef.push({"coordinates": $scope.addressInputed.coordinates, "address":  $scope.addressInputed.address});
               $scope.updateList();
                $scope.data.address = null; 
                   //$scope.showSaveLocBtn = 'false';
          });
        }
        else{
            Utils.alertshow("Address Not Found","Please Try Again...");
        }
    };
    
    $scope.deleteAddress = function(address){

        FbData.deleteAddressFromUser(Auth.currentWorkerToEditKey, address).then(function () {
            $scope.updateList();
        });
     
    };
    
    $scope.backToDash = function(){
         $scope.updateList(); 
         $scope.data.address = null;
         Auth.currentWorkerToEdit = null;
         $ionicHistory.goBack();
        
        
    };
    
    $scope.goToTimeSheet = function(){
        
        $localStorage.TimeSheetUserkey = Auth.currentWorkerToEditKey; //TODO
         $state.go('tabsCtrl.timeSheet'); 
    };
    
}
);
