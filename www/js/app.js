/*
app.js
Generates and Configures the main Angular Module.

The $sateProvider is used to route the diffrent urls to the templates and controllers.

*/


'Use Strict';

var userTypeGlobal = null;

angular.module('App', ['ionic','ngStorage', 'ngCordova','firebase','ngMessages','ngSanitize','ngCsv'])
.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
    
      $ionicConfigProvider.tabs.position('bottom');
    
    
        $stateProvider
            .state('login', {
              url: '/login',
              templateUrl: 'views/login/login.html',
              controller:'loginController'
            })
            .state('forgot', {
              url: '/forgot',
              templateUrl: 'views/forgot/forgot.html',
              controller:'forgotController'
            })
            .state('register', {
              url: '/register',
              templateUrl: 'views/register/register.html',
              controller:'registerController'
            })
            .state('tabsCtrl', {
              url: '/tabsCtrl',
              abstract:true,
              templateUrl: 'views/tabs/tabsCtrl.html',
              controller: 'tabsCtrl'
            })
            .state('tabsCtrl.dashboard', {
              url: '/worker_dashboard',
              views: {
                'tab1': {
                  templateUrl:function(){
                    //  console.log("ROUTING...");
                      if(userTypeGlobal === "WORKER"){
                      //    console.log("ROUTE: WORKER...");
                        //  console.log("User Type is " + userTypeGlobal +". Moving to WORKER Dashboard.");
                      return 'views/dashboard/worker_dashboard.html';
                    }
                      else if(userTypeGlobal === "EMPLOYER"){
                        //  console.log("ROUTE: EMPLOYER...");
                        //  console.log("User Type is " + userTypeGlobal +". Moving to EMPLOYER Dashboard.");
                          return 'views/dashboard/employer_dashboard.html';
                      }
                  },
                  controller: 'dashboardCtrl as dashboardCtrl'
                }
              }
            })
        .state('tabsCtrl.settings',{
            url: '/settings',
              views: {
                'tab3': {
                  templateUrl: 'views/settings/settings.html',
                  controller: 'settingsCtrl as settingsCtrl'
                }
              }
        })
            .state('tabsCtrl.timeSheet', {
                url: '/timeSheet',
                views: {
                    'tab2': {
                        templateUrl: 'views/timeSheet/timeSheet.html',
                        controller: 'timeSheetCtrl as timeSheetCtrl'
                    }
                }
            })
            .state('editWorker', {
              url: '/editWorker',
              templateUrl: 'views/editWorker/editWorker.html',
              controller:'editWorkerCtrl'
            });

        $urlRouterProvider.otherwise("/login");
})

.constant('FURL', 'https://popping-torch-4712.firebaseio.com/')

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});
