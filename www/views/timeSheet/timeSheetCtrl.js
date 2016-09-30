'Use Strict';
angular.module('App').controller('timeSheetCtrl', function ($scope, $state, $filter,$cordovaOauth, $cordovaFile, $cordovaDevice, $cordovaEmailComposer, $q, $localStorage, $location, $http, $ionicPopup, $firebaseObject, $firebaseArray, Auth, FURL, FbData, Utils, $ionicLoading, $ionicPlatform, $ionicHistory, $rootScope, GeoLocation, TimeManager) {

    //console.log($localStorage.TimeSheetUserkey);

    var ref = new Firebase(FURL);

    var Ref = FbData.getRefToUserByKey($localStorage.TimeSheetUserkey);
    Ref.on('value', function (dataSnapshot) {
        $scope.user = dataSnapshot.val();
    });
    

        FbData.getCurrUserRef().child('email').on('value', function (dataSnapshot) {
            $scope.currUserEmail = dataSnapshot.val();
            //console.log("Current User's Email: "+$scope.currUserEmail);
        });
    
    var msToTime = function(duration) {
        return TimeManager.msToTime(duration);
};
    $scope.clocks = [];
    var populateClocksArr = function(startTime, endTime){
        var tempDate;
        if($scope.clocks){
            $scope.clocks.length = 0; // first clear array
        }
        angular.forEach($scope.clocksFb, function(clock){
            tempDate = new Date(clock.clockOutTime);
            
            if(tempDate >= startTime && tempDate <= endTime){
                $scope.clocks.push(clock);
                //console.log($scope.clocks);
            }
        });
        
    };
    
     FbData.getUserClockRefByUserKey($localStorage.TimeSheetUserkey).on('value', function (dataSnapshot) {
         $scope.clocksFb = dataSnapshot.val();
         //$scope.clocksArr =  dataSnapshot.exportVal();
         //console.log($scope.clocksArr);
         
        $scope.clocksArr2 = $firebaseArray(FbData.getUserClockRefByUserKey($localStorage.TimeSheetUserkey));
        $scope.clocksArr2.$loaded().then(function(){
                                         
             angular.forEach($scope.clocksArr2, function(obj) {
                obj.shiftTime = msToTime((new Date(obj.clockOutTime).getTime() - new Date(obj.clockInTime).getTime()));
                obj.date = $filter('date')(new Date(obj.clockInTime),'MMMM, dd yyyy');
                obj.clockInLocation = obj.clockInLocation.address;
                obj.clockInTime = $filter('date')(new Date(obj.clockInTime),'HH:mm:ss');
                obj.clockOutLocation = obj.clockOutLocation.address;
                obj.clockOutTime = $filter('date')(new Date(obj.clockOutTime),'HH:mm:ss');
                 
                 delete obj.$id;
                 delete obj.$priority;
                 
                 //console.log(obj);
                
             });
             //console.log($scope.clocksArr2);                                                    
        });  
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
        getDateInMilSec: function (date) {
            return new Date(date);
        },
        isNotANum: function (date) {
            return isNaN(date);
        },
    };
    
    $scope.getAddress = function (lat, lng) {
        return GeoLocation.getAddress(lat, lng);
    };

    $scope.JSONToCSVConvertor = function(JSONData, ReportTitle, ShowLabel) {
        //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
        var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

        var CSV = '';    
        //Set Report title in first row or line

        CSV += ReportTitle + '\r\n';

        CSV += "Generated By: Clocker\r\nCreated at: " + (new Date().toDateString())+"\r\n\n"; 
        
        //This condition will generate the Label/Header
        if (ShowLabel) {
            var row = "";

            //This loop will extract the label from 1st index of on array
            for (var index in arrData[0]) {

                //Now convert each value to string and comma-seprated
                row += index + ',';
            }

            row = row.slice(0, -1);

            //append Label row with line break
            //CSV += row + '\r\n';
            CSV += "CLOCK-IN LOCATION,CLOCK-IN TIME,CLOCK-OUT LOCATION,CLOCK-OUT TIME,COMPANY,SHIFT TIME,DATE"+'\r\n';
        }

        //1st loop is to extract each row
        for (var i = 0; i < arrData.length; i++) {
            var row = "";

            //2nd loop will extract each column and convert it in string comma-seprated
            for (var index in arrData[i]) {
                row += '"' + arrData[i][index] + '",';
            }

            row.slice(0, row.length - 1);

            //add a line break after each row
            CSV += row + '\r\n';
        }


        if (CSV == '') {        
            console.log("CSV Data Not Created! Failed to Create CSV Data");
            return;
        }   
        console.log(CSV);
        return CSV;
    };

    $scope.exportToCSV = function(){
        
        var filename = "TimeSheet.csv";
        var filePath = null;
        
        var platform = $cordovaDevice.getPlatform();
        if(platform ==="iOS"){
            filePath = cordova.file.tempDirectory; 
            //console.log("File Path: "+ filePath);
        }
        else{ // Android
            filePath = cordova.file.cacheDirectory;   
            //console.log("File Path: "+ filePath);
        }
        
        var data = $scope.JSONToCSVConvertor($scope.clocksArr2,  $scope.user.name+"'s Time Sheet", true);
        //console.log(data);
        //console.log(filename);
        //console.log(filePath);
        
        $cordovaFile.getFreeDiskSpace().then(function(success){
            //console.log("Free Space in GB: " + success/1000000000); // free disk space in GB
        },function(err){
            //console.log(err);
        });
        
        $cordovaFile.createFile(filePath, filename, true).then(function() { 
            return $cordovaFile.writeFile(filePath, filename,  data, true);
        }).then( function(result) {
            //console.log("file written to memeory: " + result);
            
            $cordovaFile.readAsText(filePath, filename).then( function(result) {
	//console.log('readAsText: ', result);
                
                $scope.openEmailComposerWithAttach(filePath + filename); 
                
		});
            
        }, function(err) {
              //console.log(err);
        });
    };
    
    $scope.openEmailComposerWithAttach = function(attachmentFilePath){
          $cordovaEmailComposer.isAvailable().then(function() {
           // is available
         }, function () { 
           Utils.alertshow("Email Client is not Configured", "Please Make Sure Your Device's Email Account is Set-Up")
         });

          var email = {
            to: $scope.currUserEmail,
            cc: '',
            bcc: '',
            attachments: [
              attachmentFilePath,
            ],
            subject: "Clocker-" + $scope.user.name +"'s Exported Time-Sheet",
            body: 'Attached: ' + $scope.user.name +"'s Time-Sheet\n\n\nBest Regards,\nThe Clocker Team",
            isHtml: false
          };

         $cordovaEmailComposer.open(email).then(null, function () {
           // user cancelled email
         });
    };
    
      $scope.backBtn = function () {
        $ionicHistory.goBack();
  };
    
    $scope.timeWorkedThisMonth = function(userClock){
        //console.log(userClock);
        return TimeManager.timeWorkedThisMonth(userClock);
    }
    
    $scope.buttonActive = 'WEEK'; // to init the active button

    
    $scope.filterTimeSheet = function(filterBy){
       
        var startTime = new Date();
        var endTime = new Date();
        
        switch(filterBy){
            case 'WEEK':
                 $scope.buttonActive = 'WEEK';
                 startTime.setDate(endTime.getDate() - 7);
                 populateClocksArr(startTime, endTime);
                //console.log(startTime);
                break;
            case 'MONTH':
                $scope.buttonActive = 'MONTH';
                startTime.setDate(endTime.getDate() - 31);
                populateClocksArr(startTime, endTime);
                break;
            case 'YEAR':
                $scope.buttonActive = 'YEAR';
                startTime.setDate(endTime.getDate() - 365);
                populateClocksArr(startTime, endTime);
                break;
            default:
                //
        }
    };
        $scope.filterTimeSheet('WEEK'); // just to init the view 
    
});