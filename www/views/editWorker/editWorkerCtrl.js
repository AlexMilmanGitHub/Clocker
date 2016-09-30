'Use Strict';
angular.module('App').controller('editWorkerCtrl', function ($scope, $state, $cordovaOauth, $localStorage, $q, $location, $http, $window, $ionicPopup, $ionicHistory, $firebaseObject, $firebaseArray, Auth, FURL, Utils, TimeManager, $cordovaGeolocation, $ionicLoading, FbData, GeoLocation) {
    //console.log(Auth.currentWorkerToEditKey);
    
    var KM_TO_MILES = 0.621371;
    
    var geocoder = new google.maps.Geocoder();
      var ref = new Firebase(FURL);
 $scope.data = {};
 $scope.addressInputed = {};
 $scope.data.radius = 0.1; // init value 
    
    $scope.kmToMile = function(km){
        
        return String((km * KM_TO_MILES).toFixed(2));
    };
    
 $scope.updateList = function () { 

     //console.log("UPDATE LIST CALLED ");

     var workerRef = FbData.getRefToUserByKey(Auth.currentWorkerToEditKey);
     workerRef.on('value', function (dataSnapshot) {
         $scope.data.currWorker = dataSnapshot.val();
     });
     workerRef.child('clock').on('value', function (dataSnapshot) {
         $scope.data.currWorkerClock = dataSnapshot.val();
     });
 };
    
    
     $scope.updateList();
   
    
    $scope.addLocation = function(){
        $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
        });
           
       GeoLocation.getGoogleMapWithCurrPos().then(function (map) {
           $scope.map = map;
           //console.log("EDIT WORKER: MAP-" + $scope.map);
 
           
        });
        
        $ionicLoading.hide();                                
    }
    
    $scope.codeAddress = function(map) {
        //console.log("EDIT WORKER-ADDRESS: "+ $scope.data.address);
    geocoder.geocode( { 'address':  $scope.data.address}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
          
          $scope.addressInputed = {"coordinates":{"lat": results[0].geometry.location.lat(), "long": results[0].geometry.location.lng()}, "address": $scope.data.address, "radius":$scope.data.radius};
            
          var confirmPopup = $ionicPopup.confirm({
                title: "Address Found!",
                template: "Save This Location?"
            });
            confirmPopup.then(function(res) {
                if(res) {
                  $scope.addNewAddress().then(function(){
                      //console.log('Location Saved!');
                      Utils.alertshow("Address Saved!","Your Employee Can Now Clock-In/Out From It");
                  });
               }else {
                //console.log('Address Was Not Saved...');
             }
            }); 
          
      } else {
        $scope.addressInputed = null;
        //console.log("Geocode was not successful for the following reason: " + status);
        Utils.alertshow("Address Not Found","Please Try Again...");
      }
    });
  };

    $scope.addNewAddress = function(){
        var q = $q.defer();
        if($scope.addressInputed){
            //console.log(Auth.currentWorkerToEdit);
               ref.child('profiles').orderByChild("id").equalTo(Auth.currentWorkerToEdit[Auth.currentWorkerToEdit.$indexFor('id')].$value).on("child_added", function(snapshot) {

              var currWorkerAllowedLocRef = new Firebase(FURL+"profiles/"+snapshot.key()+"/allowedCoordinates/");

                   //console.log($scope.addressInputed.radius);
                   
                   q.resolve(FbData.addToUser({"coordinates": $scope.addressInputed.coordinates, "address":  $scope.addressInputed.address, "radius": $scope.addressInputed.radius}, snapshot.key(), "allowedCoordinates"));
              //currWorkerAllowedLocRef.push({"coordinates": $scope.addressInputed.coordinates, "address":  $scope.addressInputed.address});
               $scope.updateList();
                $scope.data.address = null; 
         
          });
        }
        else{
            Utils.alertshow("Address Not Found","Please Try Again...");
        }
        
        return q.promise;
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
        
        $localStorage.TimeSheetUserkey = Auth.currentWorkerToEditKey; 
         $state.go('tabsCtrl.timeSheet'); 
    };
    
    $scope.timeWorkedThisMonth = function(workerClock){
        //console.log(workerClock);
        return TimeManager.timeWorkedThisMonth(workerClock);
    };
    
}
);
