//Сервис rest запросов аутентификации
_authMod.factory('authStorage', function ($log, $cookieStore, authMod) {
    $log.info('authStorage.factory');

    var isStorageSupport = authMod.isStorageSupport();


    function load(name) {
        return isStorageSupport ? localStorage.getItem(name) : $cookieStore.get('storage_' + name);
    }

    function save(name, value) {
        if (isStorageSupport) {
            localStorage.setItem(name, value);
        }
        else {
            $cookieStore.set('storage_' + name, value);
        }
    }

    function remove(name) {
        if (isStorageSupport) {
            localStorage.removeItem(name);
        }
        else {
            $cookieStore.remove('storage_' + name, value);
        }
    }

    return {
        load: function (name) {
            var value = load(name);
            return value && value.indexOf('{') === 0 ? JSON.parse(value) : value;
        },
        save: function (name, value) {
            save(name, angular.isObject(value) ? JSON.stringify(value) : value);
        },
        remove: remove
    };
});
