//Сервис rest запросов аутентификации
_authMod.factory('authRest', function ($log, $http, $resource, authMod) {
    $log.info('authRest.factory');

    var url = authMod.getUrl();

    return $resource(url, {}, {
        logon: { url: url.logon, method: 'POST', params: {}, ignoreAuthModule: true },
        logout: {url: url.logout, method: 'POST', params: {}, ignoreAuthModule: true},
        user: { url: url.user, method: 'GET', params: {} }

    });
});
