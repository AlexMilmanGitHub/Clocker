angular.module('App').factory('TimeManager', function() {
    
    var msToTime = function(duration) {
                var milliseconds = parseInt((duration%1000)/100)
                    , seconds = parseInt((duration/1000)%60)
                    , minutes = parseInt((duration/(1000*60))%60)
                    , hours = parseInt((duration/(1000*60*60)));

                hours = (hours < 10) ? "0" + hours : hours;
                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;

                return hours + ":" + minutes + ":" + seconds;
            };
    
    var TimeM = {
            timeWorkedThisMonth: function(userClock){ //TODO CHECK FOR THIS MONTH ONLY
                var totalTime = 0;
                var tempDate = new Date();
                tempDate.setDate(0);
                //console.log(tempDate);
                  angular.forEach(userClock, function(clock) {
                  //    console.log(clock);
                      if(clock.shiftTime){
                          if(tempDate < new Date(clock.clockOutTime)){
                            totalTime += parseFloat(clock.shiftTime); // total in ms
                        }
                      }
                    });

                //console.log(totalTime);

                return msToTime(totalTime * 3600000); // 1000*60*60 ms in 1 hour 
            },
        
        msToTime: function(duration){
            return msToTime(duration);
        },
    };
    
    return TimeM;
});