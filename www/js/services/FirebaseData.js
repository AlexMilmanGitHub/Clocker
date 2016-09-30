angular.module('App').factory('FbData', function (FURL, $q, $localStorage, $firebaseArray, $firebaseObject) {

    var milSecInHour = 3600000; // 1000 * 60 * 60
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
    currUserType = $firebaseObject((currUserRef).child("userType")),
    rootRef = firebase.database().ref(); // for Firebase 3.0
    
    //console.log(rootRef);
    
    var findAddressKey = function(userKey, address){
          var q = $q.defer();
        //console.log("find key" + userKey);
          var allowedCooRef = new Firebase(FURL + 'profiles/'+userKey+'/'+"allowedCoordinates");
          allowedCooRef.orderByValue().on("value", function(snapshot) {
              snapshot.forEach(function(data) {
                  if(data.val().address === address)
                      {
                          //console.log("Found Address: " + data.val() + "with key: " +data.key());
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
            if(snap.val()){
                //console.log('matching user key is-', Object.keys(snap.val())[0]);
                    //console.log('matching user key is-', Object.keys(snap.val())[0]);
                     key = Object.keys(snap.val())[0]; // Add as Worker      
            }
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
           // console.log(currUser);
            return currUser;
        },
        
        getCurrUserRef: function () {
            return currUserRef;
        },

        getUser: function(userKey){
            //console.log(userKey);
            return $firebaseArray((dbRefrence).child('profiles/'+userKey));
        },
        
        getCurrUserAllowedCoordinates: function(){
            return currUserAllowedCoordinates;
        },
        
        getUserClockRefByUserKey: function (userKey) {
            return (new Firebase(FURL + 'profiles/' + userKey + "/clock"));
        },

        addClockIn: function(time, lat, lng, address, company){
              currUserClock.$add({ "clockInTime": time, "clockOutTime": null, "clockInLocation": { "lat": lat, "long": lng, "address": address }, "clockOutLocation": "No Location Yet", "company": company }).then(function(ref){
                  $localStorage.lastClockInKey = ref.key();
                   $localStorage.isClockedIn = true;
              });
        },
        
        addClockOut: function(time, lat, lng, address){
             var shiftDuration;

            currUserRef.child("clock/"+ $localStorage.lastClockInKey).on('value', function(lastClock){
                //console.log(lastClock.val().clockInTime);
                shiftDuration = ((new Date(time).getTime() - new Date(lastClock.val().clockInTime).getTime())/milSecInHour).toFixed(4);
                //console.log(shiftDuration);
                 currUserRef.child("clock/"+ $localStorage.lastClockInKey ).update({ "shiftTime":shiftDuration, "clockOutTime": time, "clockOutLocation": { "lat": lat, "long": lng, "address": address }});
            $localStorage.isClockedIn = false;
            });
           
             
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
                    //console.log('I fetched a user!', snap.val());
                      q.resolve(workersArray);
                    });
                });
                
            });
            
            return q.promise;
        },
        
        getCurrUserType: function(){
            return currUserType.$value;
        },
        
        addWorkerToCurrUser: function(workerEmail, companyName){
            
            var q = $q.defer();

           var key = findWorkerKey(workerEmail);
                //console.log(key);
            if(key !== undefined){
                currUserWorkersKeys.$add({"workerKey": key}).then(function(){
                     q.resolve(usersRef.child(key).update({"companyName": companyName}));
                });
            }
            return q.promise;
        },
        
        setCurrUserAvatar: function(avatar){
            //console.log(avatar);
            //console.log(currUserRef);
            currUserRef.update({"avatar": avatar});
        },
        
        addToUser: function(value, userKey, child){
            return $firebaseArray((dbRefrence.child('profiles').child(userKey)).child(child)).$add(value);
        },
        
        deleteAddressFromUser: function(userKey, address){
            var q = $q.defer();
            //console.log("delete called"+ userKey);
            
            findAddressKey(userKey, address).then(function(key){
                //console.log(key);
                var addressRef = new Firebase(FURL + 'profiles/'+userKey+'/'+"allowedCoordinates/"+key);
                addressRef.remove();
                //console.log("THE ADDRESS: "+address+" was DELETED! From User: " + userKey);
                 q.resolve();
            });
            
            return q.promise;
        },
        
        deleteWorkerFromUser: function(workerKey){
            var q = $q.defer();
    
          currUserRef.child('workers').orderByValue().once("value", function(snapshot) {
              snapshot.forEach(function(data) {
                  
                  //console.log(data.key());
                  var tempKeyToDelete = data.key();
                  var tempKeyVal = data.val().workerKey;
                  //console.log(tempKeyVal);
                  if(tempKeyVal === workerKey){
                     // console.log(tempKeyVal + " " + currUserKey);
                      var ref = new Firebase(FURL + 'profiles/'+currUserKey+'/workers/'+tempKeyToDelete);
                     // console.log(ref);
                      ref.remove();
                    //  console.log(ref);
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
        
        isWorkerLegalToAdd: function(employerEmail, workerDetails, workersArray){
         //   console.log(workerDetails);
          //  console.log("isWorkerLegal Called!"+ employerEmail+" "+ workerDetails.workerEmail);
         
            var res = true;
            var tempKey = findWorkerKey(workerDetails.workerEmail);
            
            if(tempKey !== undefined){
                if(employerEmail !== workerDetails.workerEmail) // check if its the employers email
                {
                    var workerUID;
                    (new Firebase(FURL + 'profiles/'+tempKey+'/'+"userId")).on('value', function (dataSnapshot) {
                            workerUID = dataSnapshot.val();

                     //   console.log(workerUID);
                        if(workerDetails.workerUId !== workerUID){ // make sure the worker autherized this action by giving the employer his UID
                            res = "Wrong User ID";
                        }
                    }); 
                        angular.forEach(workersArray, function(worker) { // check if the employer alrady added this worker
                    //        console.log("check worker"+ worker.value.email);
                            if(worker.value.email == workerDetails.workerEmail){
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

          //  console.log("RETURNING "+ res);
            return res;
        },
        
        deleteUser: function(userKey){
            var q = $q.defer();
            
            var ref = new Firebase(FURL+'profiles/'+userKey);
             q.resolve(ref.remove()); // this deletes all user info and data!!!
            
            return q.promise;
        },

        
    };
    
    return FirebaseDB;
    
});