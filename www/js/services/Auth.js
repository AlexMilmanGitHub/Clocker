angular.module('App').factory('Auth', function(FURL, $firebaseAuth, $firebaseArray, $firebaseObject, Utils) {

	var ref = new Firebase(FURL);
	var auth = $firebaseAuth(ref);
    var uidGen = function(){
        function s4() {
            return Math.floor((1 + Math.random()) * 0x15)
              .toString(16)
              .substring(1);
          }
          return (s4() + s4() + s4() + s4() + s4());    
    };
    
	var Auth = {
		user: {},
        
    createProfile: function(uid, user) {
      var profile = {
				id: uid,
        name: user.name,
        email: user.email,
        avatar: "img/empty_avatar.jpg",
        registered_in: Date(),
        userType: user.userType,
        companyName: user.companyName ? user.companyName : "-",
        accountType:"FREE",
    };
        if(profile.userType === "WORKER")
            {
                profile.clock = null;
                profile.allowedCoordinates = null;
                profile.isClockedIn = "false";
                profile.userId = uidGen();
            }
        else if(profile.userType === "EMPLOYER")
        {
            profile.workers = null;
        }
        
      var profileRef = $firebaseArray(ref.child('profiles'));
      return profileRef.$add(profile).then(function(ref) {
			  var id = ref.key();
			 
			  profileRef.$indexFor(id); // returns location in the array
			});
    },

    login: function(user) {
      return auth.$authWithPassword({email: user.email, password: user.password});
    },

    register: function(user) {
      return auth.$createUser({email: user.email, password: user.password })
        .then(function() {
          // authenticate so we have permission to write to Firebase
          return Auth.login(user);
        })
        .then(function(data) {
          // store user data in Firebase after creating account
            Auth.createProfile(data.uid, user).then(function(){Auth.login(user)});
        });
    },

    logout: function() {
      auth.$unauth();
      console.log("User Exits.");       
    },

		resetpassword: function(user) {
			return auth.$resetPassword({
				  email: user.email
				}).then(function() {
					Utils.alertshow("A Temporary Password Was Sent To Your Emaill Address.");
				    console.log("Password reset email sent successfully!");
				}).catch(function(error) {
					Utils.errMessage(error);
				    console.error("Error: ", error.message);
				});
    },

		changePassword: function(user) { 
			return auth.$changePassword({email: user.email, oldPassword: user.oldPass, newPassword: user.newPass});
		},

    signedIn: function() {
      return !!Auth.user.provider; //using !! means (0, undefined, null, etc) = false | otherwise = true
    }
        
	};

	auth.$onAuth(function(authData) {
		if(authData) {
      angular.copy(authData, Auth.user);
      //console.log(Auth.user);
      Auth.user.profile = $firebaseObject(ref.child('profiles').child(authData.uid));
        } else {
      if(Auth.user && Auth.user.profile) {
        Auth.user.profile.$destroy();

      }

      angular.copy({}, Auth.user);
		}
	});

	return Auth;

});
