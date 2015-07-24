_authMod.config(function (authModProvider, $httpProvider) {
    console.log('authMod.config');
    authModProvider.setModName('auth');
    authModProvider.setAuthorizedTemplate('mod/auth/views/authorized.html');
    authModProvider.setAuthDialogConfig({
        size: 'sm',
        templateUrl: 'mod/auth/views/dialog.html',
        controller: 'AuthPwdDialogController'
    });

    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $httpProvider.defaults.withCredentials = true;
    $httpProvider.interceptors.push('authInterceptor');
});
