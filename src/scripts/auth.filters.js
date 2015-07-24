_authMod.filter('authUsername', function (authMod, $log) {

    function getListField(usernameField) {
        var list;
        if (angular.isString(usernameField)) {
            list = [usernameField];
        } else if (angular.isArray(usernameField)) {
            list = usernameField;
        } else if (angular.isObject(usernameField)) {
            list = [];
            for (var part in usernameField) {
                if (usernameField.hasOwnProperty(part)) {
                    list.push(usernameField[part]);
                }
            }

        } else {
            list = ['username'];
        }
        return list;
    }

    var fields = getListField(authMod.getUsername());

    return function (userObject) {
        var username = null;
        if (userObject) {

            for (var i = 0; i < fields.length; i++) {
                if (userObject[fields[i]]) {
                   // $log.debug(fields[i], userObject[fields[i]]);
                    if (!username) {
                        username = userObject[fields[i]];
                    } else {
                        username += ' ' + userObject[fields[i]];
                    }
                }
            }

        }
        return username;
    };
});