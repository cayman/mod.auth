
//Сервис rest запросов аутентификации
_authMod.factory('authUser', function ($log, authRest, authStorage, authMod, $q) {
    $log.info('authUser.factory');

    var NAME = 'auth_user_object';

    return {
        load: function(){
            return authStorage.load(NAME);
        },
        create: function(session){
            return authRest.user(session, function success(user) {
                $log.debug('session user:',  user);
                authStorage.save(NAME, user);
            }, function error(data) {
                $log.info('Error load user info',data);
            });
        },
        remove: function(){
            authStorage.remove(NAME);
            return null;
        }
    };
});
