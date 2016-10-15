/*
GeoLocation.js
Creates the GeoLocation Factory which handles the GPS, Maps and Location Logic.

*/

angular.module('App').factory('GeoLocation', function($cordovaGeolocation, $q, FbData, $ionicLoading, Utils) {
    var geocoder = new google.maps.Geocoder();
	
    var Geo = {

	    currentLocationLat: null,
	    currentLocationLong: null,

	    getCurrentPosition: function () {
	        var q = $q.defer();

	        var posOptions = {
	            enableHighAccuracy: true,
	            timeout: 20000,
	            maximumAge: 0
	        };

	        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
	            currentLocationLat = position.coords.latitude;
	            currentLocationLong = position.coords.longitude;

	            q.resolve({ "lat": position.coords.latitude, "long": position.coords.longitude });
	            //console.log("current position is: lat:" + currentLocationLat + ", long:" + currentLocationLong);

	        }, function (err) {
	            //console.log(err);
	        });
	        return q.promise;
	    },

        isCurrentPositionLegal: function (currCoordinates) {
        var res = false;
        var p1;

        var p2 = new google.maps.LatLng(currCoordinates.lat, currCoordinates.long);
        //console.log("p2:" + p2);

        angular.forEach(FbData.getCurrUserAllowedCoordinates(), function(coordinate){
          
            p1 = new google.maps.LatLng(coordinate.coordinates.lat, coordinate.coordinates.long);
          
            //console.log("COORDINATE TO MATCH: lat:" + coordinate.coordinates.lat + " long:" + coordinate.coordinates.long);
            //console.log("DISTANCE BETWEEN:" + (google.maps.geometry.spherical.computeDistanceBetween(p1, p2)));

            if((google.maps.geometry.spherical.computeDistanceBetween(p1, p2)) <= (coordinate.radius*1000)) //check if the distance if less than radius in meters
                res = true;
        });
        return res;
    },

        getAddress: function (lat, lng) {
            var q = $q.defer();
            var place = new google.maps.LatLng(lat, lng);
            geocoder.geocode({
                'latLng': place
            }, function (results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        console.log(results[0]);
                        q.resolve(results[0].formatted_address);
                    } else {
                        console.log('GEOCODER-FIND_ADDRESS: No results found');
                    }
                } else {
                    console.log('Geocoder failed due to: ' + status);
                }
            });
            return q.promise;
        },
    
        getGoogleMapWithCurrPos: function () {
            var q = $q.defer();
            
            var posOptions = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };
          
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (position) {

                var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                var mapOptions = {
                    center: myLatlng,
                    zoom: 16,
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    disableDefaultUI: true
                };

                var map = new google.maps.Map(document.getElementById("map"), mapOptions);

           //     console.log("GOOGLE MAP CREATED");

                var marker = new google.maps.Marker({
                    position: myLatlng,
                    title: "Hello World!"
                });

                // Add the marker to the map
                marker.setMap(map);

                q.resolve(map);

            }, function (err) {
                $ionicLoading.hide();
                Utils.alertshow("GPS Error","Could Not Get Current Geo-Position");
                console.log(err);
            });
            return q.promise;
        },
    }
    return Geo;
});