_authMod.controller('AuthPwdDialogController', function ($log, authRest, $scope, $modalInstance, responseData, authMod) {
    $log.info('authMod.AuthPwdDialogController');
    $scope.errorMessage = '';
    $scope.credentials = {};
    if (responseData) {
        $scope.alert = responseData;
    }
    $scope.logon = function () {
        $scope.process = true;
        authRest.logon($scope.credentials,
            function success(session) {
                if(session.id){
                    $log.debug('success logon', session);
                    authMod.publishLogon( session );
                    $scope.process = false;
                    $modalInstance.close(session);
                }else{
                    $log.debug('error logon');
                    $scope.errorMessage = 'empty user.id ';
                    $scope.process = false;
                }
            },
            function error(e) {
                $log.debug('error logon', e);
                $scope.errorMessage = (e.data.error) ? e.data.error : e.data;
                $scope.process = false;
            });
    };

    $scope.close = function (result) {
        $log.debug('close dialog logon', result);
        $modalInstance.close(result);
    };

});
