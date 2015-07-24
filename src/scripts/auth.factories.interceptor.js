//Сервис перехвата запросов
_authMod.factory('authInterceptor', function ($log, $q, authMod) {
    $log.info('authInterceptor.factory');
    return {
        // optional method
        'request': function (config) {
            // do something on success
//            $log.debug('Successful request:');
//            $log.debug(config);
            if (config.url.indexOf('/api/') === 0) {
                $log.debug('Request: ', config.method, config.url, config.headers);
            }
            return config || $q.when(config);
        },
        // optional method
        'requestError': function (rejection) {
            // do something on error
//            if (canRecover(rejection)) {
//                return responseOrNewPromise
//            }
            $log.debug('Error request:');
            $log.debug(rejection);
            return $q.reject(rejection);
        },
        // optional method
        'response': function (response) {
            // do something on success
//            $log.debug('Successful response:');
//            $log.debug(response);
            return response || $q.when(response);
        },
        // optional method
        'responseError': function (rejection) {
            // do something on error
            $log.debug('Error response:',rejection.status,rejection);
            if ((rejection.status === 401) && !rejection.config.ignoreAuthModule) {
                var deferred = $q.defer();
                authMod.getFailedRequests().push({
                    config: rejection.config,
                    deferred: deferred
                });
                authMod.publishLogonRequired(rejection.data);
                return deferred.promise;
            }
            return $q.reject(rejection);
        }


    };

});
