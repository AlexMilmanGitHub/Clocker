angular.module('App').factory('FbData', function (FURL, $q, $firebaseAuth, $localStorage, $firebaseArray, $firebaseObject, Utils, $log) {

    var dbRefrence = new Firebase(FURL),
    usersRef = dbRefrence.child('profiles'),
    currUserRef = usersRef.child($localStorage.userkey),
    currUserKey = $localStorage.userkey,
    users = $firebaseArray(usersRef),
    currUser = $firebaseArray(currUserRef),
    currUserWorkersKeys = $firebaseArray(currUserRef.child("workers")),
    currUserClock = $firebaseArray((currUserRef).child("clock")),
    currUserAllowedCoordinates = $firebaseArray((currUserRef).child("allowedCoordinates")),
    currUserIsClockedIn = $firebaseObject((currUserRef).child("isClockedIn")),
    currUserType = $firebaseObject((currUserRef).child("userType"));
    
    console.log(currUserType);
    
    var findAddressKey = function(userKey, address){
          var q = $q.defer();
        console.log("find key" + userKey);
          var allowedCooRef = new Firebase(FURL + 'profiles/'+userKey+'/'+"allowedCoordinates");
          allowedCooRef.orderByValue().on("value", function(snapshot) {
              snapshot.forEach(function(data) {
                  if(data.val().address === address)
                      {
                          console.log("Found Address: " + data.val() + "with key: " +data.key());
                         q.resolve(data.key());
                      }
                
              });
            }); 
         return q.promise;
        };
    
    var findWorkerKey = function(workerEmail){
        var key;
        usersRef.orderByChild('email')
                .startAt(workerEmail)
                .endAt(workerEmail)
                .once('value', function(snap) {
                console.log('matching user key is-', Object.keys(snap.val())[0]);
                    //console.log('matching user key is-', Object.keys(snap.val())[0]);
                    //TODO SEND REQUIEST TO WORKER TO VERIFY AND MAKE SURE HE IS NOT ADDED TWICE
                     key = Object.keys(snap.val())[0]; // Add as Worker      
                });
        return key;
    };
        
    
    
    
    // This is what gets returned...
    var FirebaseDB = {
        
        getRefToUserByKey: function (key) {
            return (new Firebase(FURL+'profiles/'+key));
        },

        getCurrUserWorkersKeysRef: function(){
            return currUserRef.child("workers");
        },
        
        getDbRef: function(){
              return dbRefrence;
        },
        
        getCurrUser: function(){
            console.log(currUser);
            return currUser;
        },
        
        getCurrUserRef: function () {
            return currUserRef;
        },

        getUser: function(userKey){
            console.log(userKey);
            return $firebaseArray((dbRefrence).child('profiles/'+userKey));
        },
        
        getCurrUserAllowedCoordinates: function(){
            return currUserAllowedCoordinates;
        },
        
        getUserClockRefByUserKey: function (userKey) {
            return (new Firebase(FURL + 'profiles/' + userKey + "/clock"));
        },

        addClockIn: function(time, lat, lng, address){
              currUserClock.$add({ "clockInTime": time, "clockOutTime": "Not Clocked Out Yet", "clockInLocation": { "lat": lat, "long": lng, "address": address }, "clockOutLocation": "No Location Yet", "company": "Name Of Company" }).then(function(ref){
                  $localStorage.lastClockInKey = ref.key();
                   $localStorage.isClockedIn = true;
              });
        },
        
        addClockOut: function(time, lat, lng, address){
              currUserRef.child("clock/"+ $localStorage.lastClockInKey ).update({ "clockOutTime": time, "clockOutLocation": { "lat": lat, "long": lng, "address": address }, "company": "Name Of Company" });
            $localStorage.isClockedIn = false;
        },
        
        setIsClockedIn: function(value){
              currUserRef.child("isClockedIn").set(value);
        },
        
        getIsClockedIn: function(){
            var q = $q.defer();
            currUserIsClockedIn.$loaded().then(function(){
                  q.resolve(currUserIsClockedIn.$value);
            });
           return q.promise;
        },
        getCurrUserWorkers: function(){
            var q = $q.defer();
            var workersArray = [];
            currUserWorkersKeys;
            currUserWorkersKeys.$loaded().then(function(){
            angular.forEach(currUserWorkersKeys, function(key) {
                new Firebase(FURL+'profiles/' + key.workerKey).once('value', function(snap){
                    workersArray.push({"value":snap.val(), "key":snap.key()});
                    console.log('I fetched a user!', snap.val());
                    });
                });
                  q.resolve(workersArray);
            });
            
            return q.promise;
        },
        
        getCurrUserType: function(){
            return currUserType.$value;
        },
        
        addWorkerToCurrUser: function(workerEmail){
            
            var res = true;
           var key = findWorkerKey(workerEmail);
                console.log(key);
            if(key !== undefined){
                currUserWorkersKeys.$add({"workerKey": key});
            }
            else{
                res = false;
            }
                return res;
        },
        
        
        
        addToUser: function(value, userKey, child){
            $firebaseArray((dbRefrence.child('profiles').child(userKey)).child(child)).$add(value);
        },
        
        deleteAddressFromUser: function(userKey, address){
            var q = $q.defer();
            console.log("delete called"+ userKey);
            
            findAddressKey(userKey, address).then(function(key){
                console.log(key);
                var addressRef = new Firebase(FURL + 'profiles/'+userKey+'/'+"allowedCoordinates/"+key);
                addressRef.remove();
                console.log("THE ADDRESS: "+address+" was DELETED! From User: " + userKey);
                 q.resolve();
            });
            
            return q.promise;
        },
        
        deleteWorkerFromUser: function(workerKey){
            var q = $q.defer();
    
          currUserRef.child('workers').orderByValue().once("value", function(snapshot) {
              snapshot.forEach(function(data) {
                  
                  console.log(data.key());
                  var tempKeyToDelete = data.key();
                  var tempKeyVal = data.val().workerKey;
                  console.log(tempKeyVal);
                  if(tempKeyVal === workerKey){
                      console.log(tempKeyVal + " " + currUserKey);
                      var ref = new Firebase(FURL + 'profiles/'+currUserKey+'/workers/'+tempKeyToDelete);
                      console.log(ref);
                      ref.remove();
                      console.log(ref);
                      q.resolve(true);
                  }
                
              });
            }); 
         return q.promise;
        },
        
        addToCurrUser: function(value, child){
            $firebaseArray((currUserRef).child(child)).$add(value);
        },
        
        deleteFromCurrUser: function(){
            
        },
        getRefToUser: function(userKey){
            return (new Firebase(FURL + 'profiles/').child(userKey));
        },
        
        isWorkerLegalToAdd: function(employerEmail, workerEmail, workersArray){
            console.log("isWorkerLegal Called!"+ employerEmail+" "+ workerEmail);
         
            var res = true;
            var tempKey = findWorkerKey(workerEmail);
             
            if(tempKey !== undefined){
                if(employerEmail !== workerEmail) // check if its the employers email
                {
                        angular.forEach(workersArray, function(worker) { // check if the employer alrady added this worker
                            console.log("check worker"+ worker.value.email);
                            if(worker.value.email == workerEmail){
                                res = "You've Already Added This Employee";
                            }
                        });
                }
                else{
                    res = "You've Inputed Your Own Email";
                }
            }
            else{
                res = "User Was Not Found";  
            }

            console.log("RETURNING "+ res);
            return res;
        },

        
    };
    
    return FirebaseDB;
    
});