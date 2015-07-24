//Сервис работы с сессией пользователем и token
_authMod.factory('authSession',
    function ($log, authMod, $rootScope, $http, $cookieStore, authRest, authUser, $modal) {
        $log.info('authSession.factory');

        var session = {
            user: authUser.load()
        };

        var authDialog;

        function repeatedRequest(request){
            $log.debug('Repeated request: ', request.config.method, request.config.url, request.config.headers);
            $http(request.config).then(function (response) {
                request.deferred.resolve(response);
            });
        }

        //событие о необходимости авторизоваться
        authMod.subscribeLogonRequired(function (data) {
            if(!authDialog){
                session.user = authUser.remove();
                var config = authMod.getAuthDialogConfig();

                if (config) {
                    config.resolve = {
                        responseData: function () {
                            return data;
                        }
                    };
                    $log.info('authDialog.open');
                    authDialog = $modal.open(config);

                    authDialog.result.then(function (result) {
                        authDialog = null;
                    }, function () {
                        authDialog = null;
                    });

                } else {
                    $log.error('not found default dialog config');
                }
            }
        });

        //Начало новой сессии пользователя
        authMod.subscribeLogon(function (data){
            $log.debug('session create');
            session.user = authUser.create(data);
            authMod.publishSessionStarted();
        });

        //Повторно выполнить все безуспешные старые запросы
        authMod.subscribeSessionStarted(function () {
            var failedRequests = authMod.getFailedRequests();
            while(failedRequests.length>0) {
                repeatedRequest(failedRequests.shift());
            }
        });

        //событие о необходимости завершить сессию
        authMod.subscribeLogout(function () {
            authRest.logout({},
                function success() {
                    $log.debug('end session:');
                    session.user = authUser.remove();
                },
                function error() {
                    //$scope.errorMessage = 'Error removeSession';
                    $log.debug('end session:');
                    session.user = authUser.remove();
                }
            );
        });


        return {
            getInfo: function () {
                return session;
            }
        };
    });
