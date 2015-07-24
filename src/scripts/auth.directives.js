_authMod.directive('authBlock', function (authMod, authSession, $log) {
    $log.info('auth-block.directive');
    return {
        templateUrl: authMod.getTemplate(),
        restrict: 'EA',
        scope: false,
        link: function (scope, element, attrs) {

            scope.session = authSession.getInfo();

            scope.logon = function () {
                authMod.publishLogonRequired();
            };

            scope.logout = function () {
                authMod.publishLogout();
            };

        }
    };
});

