/*
Utils.js
Creates the Utils Factory which is used to display popup alerts and pompts.

*/


angular.module('App').factory('Utils', function($ionicLoading,$ionicPopup, $q) {

	var Utils = {

    show: function() {
      $ionicLoading.show({
  	    animation: 'fade-in',
  	    showBackdrop: false,
  	    maxWidth: 200,
  	    showDelay: 500,
        template: '<p class="item-icon-left">Loading...<ion-spinner icon="lines"/></p>'
      });
    },

    hide: function(){
      $ionicLoading.hide();
    },

    alertshow: function(tit,msg){
        var alertPopup = $ionicPopup.alert({
            title: tit,
            template: msg
        });
        alertPopup.then(function(res) {

        });
    },

    alertshowWithPromise: function(tit,msg){
        var alertPopup = $ionicPopup.alert({
            title: tit,
            template: msg
        });
        return alertPopup;
    },
        
    errMessage: function(err) {

    var msg = "Unknown Error...";

    if(err && err.code) {
          switch (err.code) {
            case "EMAIL_TAKEN":
              msg = "This Email has been taken."; break;
            case "INVALID_EMAIL":
              msg = "Invalid Email."; break;
          case "NETWORK_ERROR":
              msg = "Network Error."; break;
            case "INVALID_PASSWORD":
              msg = "Invalid Password."; break;
            case "INVALID_USER":
              msg = "Invalid User."; break;
          }
    }
        Utils.alertshow("Error",msg);
	},


    confirmSelection: function(title, msg){
      var confirmPopup = $ionicPopup.confirm({
				title: title,
				template: msg
			});
			confirmPopup.then(function(res) {
                if(res) {
                //console.log('Selection Confirmed');
               }else {
                //console.log('Selection Canceled');
             }
			});  
    },
  };
	return Utils;

});
