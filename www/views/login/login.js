'Use Strict';
angular.module('App').controller('loginController', function ($scope, $state, $localStorage, $firebaseObject, Auth, FURL, Utils) {
  var ref = new Firebase(FURL);
  var userkey = "";
        
  ref.onAuth(function(authData) {
  if (authData) {
    //console.log("User " + authData.uid + " is logged in with " + authData.provider);
       
      ref.child('profiles').orderByChild("id").equalTo(authData.uid).on("child_added", function(snapshot) {
        //console.log(snapshot.key());

        userkey = snapshot.key();
                  
        var obj = $firebaseObject(ref.child('profiles').child(userkey));
   
        obj.$loaded()
          .then(function(data) {
          //  console.log(data === obj); // true
        //    console.log(obj.email);
            $localStorage.email = obj.email;
            $localStorage.userkey = userkey;
            userTypeGlobal = obj.userType;
            
              Utils.hide();
         
               $state.go('tabsCtrl.dashboard', {}, { reload: true }); 
               
        //      console.log("Starter page",userTypeGlobal);

          })
          .catch(function(error) {
            //console.error("Error:", error);
          });});
          
  } else {
    //console.log("User is logged out");

  }
});
    
  $scope.signIn = function (user) {
    if(angular.isDefined(user)){
    Utils.show();
    Auth.login(user)
      .then(function(authData) {
    
      //console.log("user id:" + JSON.stringify(authData));

      ref.child('profiles').orderByChild("id").equalTo(authData.uid).on("child_added", function(snapshot) {
        //console.log(snapshot.key());

        userkey = snapshot.key();
                  
        var obj = $firebaseObject(ref.child('profiles').child(userkey));
   
        obj.$loaded()
          .then(function(data) {
            //console.log(data === obj); // true
            //console.log(obj.email);
            //$localStorage.isClockedIn = false;
            $localStorage.email = obj.email;
            $localStorage.userkey = userkey;
            userTypeGlobal = obj.userType;
               
              Utils.hide();
               
            $state.go('tabsCtrl.dashboard', {}, { reload: true });
       
              //console.log("Starter page", userTypeGlobal);

          })
          .catch(function(error) {
            console.error("Error:", error);
          });
      });

      }, function(err) {
        Utils.hide();
         Utils.alertshow("Wrong Email/Password","Make Sure You Have The Right Email and Password");
      });
    }
  };
});
