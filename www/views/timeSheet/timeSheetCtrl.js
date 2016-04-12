'Use Strict';
angular.module('App').controller('timeSheetCtrl', function ($scope, $state, $cordovaOauth, $q, $localStorage, $location, $http, $ionicPopup, $firebaseObject, $firebaseArray, Auth, FURL, FbData, Utils, $ionicLoading, $ionicPlatform, $ionicHistory, GeoLocation) {

    console.log($localStorage.TimeSheetUserkey);

    var ref = new Firebase(FURL);
    //$scope.clocks = $firebaseArray(ref.child('profiles').child($localStorage.TimeSheetUserkey).child("clock"));
   
    var Ref = FbData.getRefToUserByKey($localStorage.TimeSheetUserkey);
    Ref.child('name').on('value', function (dataSnapshot) {
        $scope.userName = dataSnapshot.val();
    });

     FbData.getUserClockRefByUserKey($localStorage.TimeSheetUserkey).on('value', function (dataSnapshot) {
         $scope.clocks = dataSnapshot.val();
    });

    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    $scope.isEmployer = FbData.getCurrUserType();
    
    $scope.Date = {
        getDiffrenceInSec: function (date1, date2) {
            var res = (((new Date(date2).getTime()) - (new Date(date1).getTime())) / 1000) % 60;
            if (res > 9)
                return res;
            else
                return ("0" + res);
        },
        getDiffrenceInMin: function (date1, date2) {
            var res = Math.floor(((((new Date(date2).getTime()) - (new Date(date1).getTime())) / 1000) / 60) % 60);
            if (res > 9)
                return res;
            else
                return ("0" + res);
        },
        getDiffrenceInHours: function (date1, date2) {
            var res = Math.floor(((((new Date(date2).getTime()) - (new Date(date1).getTime())) / 1000) / 60) / 60);
            if (res > 9)
                return res;
            else
                return ("0" + res);
        },
        getDayInMonth: function (date) {
            return new Date(date).getDate();
        },
        getMonth: function (date) {
            return new Date(date).getMonth();
        },
        getMonthName: function (date) {
            return monthNames[new Date(date).getMonth()];
        },
        getYear: function (date) {
            return new Date(date).getFullYear();
        },
        getDayInWeek: function (date) {
            return new Date(date).getDay();
        },
        getNumHours: function (date) {
            return new Date(date).getHours();
        },
        getNumMinutes: function (date) {
            return new Date(date).getMinutes();
        },
        getNumSeconds: function (date) {
            return new Date(date).getSeconds();
        },
    };
    
    $scope.getAddress = function (lat, lng) {
        return GeoLocation.getAddress(lat, lng);
    }

      $scope.backBtn = function () {
        $ionicHistory.goBack();
  }
});