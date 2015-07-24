_authMod.provider('authMod', function () {
    console.log('authMod.provider');
    var _name = 'auth';
    this.setModName = function (modName) {
        _name = modName;
    };

    var _authorizedTemplate = null;
    var _authDialogConfig = null;

    this.setAuthorizedTemplate = function (template) {
        _authorizedTemplate = template;
    };
    this.setAuthDialogConfig = function (dialogConfig) {
        _authDialogConfig = dialogConfig;
    };

    this.$get = function ($log, coreMod, $rootScope, $window) {
        $log.log('authMod.provider.$get');

        var _config = coreMod.configMod(_name);

        var failedRequests = [];

        return {
            isStorageSupport: function(){
                try {
                    return ('localStorage' in $window) &&  $window.localStorage !== null;
                } catch (e) {
                    return false;
                }
            },

            getTemplate: function () {
                return  _authorizedTemplate;
            },
            getUrl: function () {
                return _config.url;
            },
            getUnknown : function(){
              return _config.unknown;
            },

            getUsername: function () {
                return _config.username || 'username';
            },


            getAuthDialogConfig: function(){

                return _authDialogConfig;

            },

            getFailedRequests: function(){
                return failedRequests;
            },

            //required Session
            publishLogonRequired: function (data) {
                $log.debug('auth:logonRequired');
                $rootScope.$broadcast('auth:logonRequired',data);
            },
            subscribeLogonRequired: function (callback) {
                $rootScope.$on('auth:logonRequired', function(event, data){
                    $log.debug(event);
                    callback(data);
                });
            },

            //create Session
            publishLogon: function (data) {
                $log.debug('auth:logon');
                $rootScope.$broadcast('auth:logon',data);
            },
            subscribeLogon: function (callback) {
                $rootScope.$on('auth:logon', function(event, data){
                    $log.debug(event);
                    callback(data);
                });
            },


            //remove Session
            publishLogout: function () {
                $log.debug('auth:logout');
                $rootScope.$broadcast('auth:logout');
            },
            subscribeLogout: function (callback) {
                $rootScope.$on('auth:logout', function(event){
                    $log.debug(event);
                    callback();
                });
            },

            //session
            publishSessionStarted: function () {
                $log.debug('auth:sessionStarted');
                $rootScope.$broadcast('auth:sessionStarted');
            },
            subscribeSessionStarted: function (callback) {
                $rootScope.$on('auth:sessionStarted', function(){
                    $log.debug('auth:sessionStarted');
                    callback();
                });
            }

            //publishSessionEnded: function () {
            //    $log.debug('auth:sessionEnded');
            //    $rootScope.$broadcast('auth:sessionEnded');
            //},
            //
            //subscribeSessionEnded: function (callback) {
            //    $rootScope.$on('auth:sessionEnded', function(){
            //        $log.debug('auth:sessionEnded');
            //        callback();
            //    });
            //}
        };
    };
    this.$get.$inject = ['$log', 'coreMod', '$rootScope', '$window'];
});

