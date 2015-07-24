//Сервис rest запросов аутентификации
angular.module('authBackend', []).config(function ($provide) {
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
}).run(function ($log, $httpBackend) {
        $log.info('authBackend');
        var url = '/api/auth';

        var sessions = {};
        var users = {
            'user1': { profile: { name: 'Закиров', surname: 'Рустем'}, password: '1'},
            'user2': { profile: { name: 'Иванов', surname: 'Иван'}, password: '2'}
        };
        var captures = [
            {},
            { question: '126/3', answer: '42'},
            { question: '317+32', answer: '349'},
            { question: '24*3', answer: '72'},
            { question: '28+33', answer: '61'}
        ];

        function quickGuid() {
            return Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
        }

        //Поиск сессии по token
        function getSession(token) {
            if (token && sessions[token]) {
                return sessions[token];
            } else {
                return null;
            }
        }

        //Удаление сессии
        function deleteSession(token) {
            if (token && sessions[token]) {
                delete sessions[token];
            }
        }

        //Создание новой сессии
        function createSession(username,count) {
            var token = quickGuid();
            sessions[token] = {count: count, username: username};
            return token;
        }

        //Поиск пользователя
        function getUser(username) {
            if (username && users[username]) {
                return users[username];
            } else {
                return null;
            }
        }

        function getCapture(challenge) {
            if (challenge && captures[challenge]) {
                return captures[challenge];
            } else {
                return null;
            }
        }

        function getCaptureRequest() {
            var challenge = Math.floor(Math.random()*(captures.length-1))+1;
            var capture = captures[challenge];
            return { challenge: challenge, question: capture.question};
        }


        function loginAuthenticate(credentials, currentToken) {
            //Наличие пользователя с заданным именем
            var user = getUser(credentials.username);
            if (user) {
                var session = getSession(currentToken);
                $log.debug('user:', user);
                //проверка пароля
                if (user.password === credentials.password) {
                    //Если успешно
                    var count=0;
                    if(session){
                        count = session.count;
                        deleteSession(currentToken);  //удаление старой сессии
                    }
                    var newToken = createSession(credentials.username,count); //создание новой
                    var result = {status: 201, message: 'Session is created', token: newToken,
                        username: credentials.username, profile: user.profile};
                    $log.debug('result: 201(Created)', result);
                    return [201, result, {}];
                } else {
                    //Неверный пароль
                    $log.debug('result: 403(Forbidden) Invalid password');
                    return [403, {status: 403, message: 'Invalid password'}, {}];
                }
            } else {
                //Неверное имя пользователя
                $log.debug('result: 404(Not Found) User not found');
                return [404, {status: 404, message: 'User not found'}, {}];
            }
        }

        function captureAuthenticate(credentials, currentToken) {
            var capture = getCapture(credentials.challenge);
            if (capture) {
                $log.debug('capture:', capture);
                if (capture.answer === credentials.answer) {
                    var session = getSession(currentToken);
                    var result;
                    if (session) {
                        session.count = 0;
                        result = {status: 200, message: 'Session is confirmed', username: null, token: currentToken };
                        var user = getUser(session.username);
                        if (user) {  //Именованная сессия
                            result.username = session.username;
                            result.profile = user.profile;
                        }
                        $log.debug('result: 200(OK) Session is confirmed');
                        return [200, result, {}];
                    } else {
                        //новая сессия
                        var newToken = createSession(null,0); //создание новой
                        result = {status: 201, message: 'Session is created', username: null, token: newToken };
                        $log.debug('result: 201(Created) Session is created', result);
                        return [201, result, {}];
                    }
                } else {
                    //Не верный ответ на capture
                    $log.debug('result: 403(Forbidden) Invalid capture answer');
                    return [403, {status: 403, message: 'Invalid capture answer'}, {}];
                }
            } else {
                //Идентификатор сapture не найден
                $log.debug('result: 404(Not Found) Capture not found');
                return [404, {status: 404, message: 'Capture not found'}, {}];
            }

        }


        //проверка существующей сесии
        $httpBackend.whenGET(url + '/session').respond(function (method, url, data, headers) {
            $log.debug('Received these data:', method, url, data, headers);
            var token = headers['X-Auth-Token'];
            if (token) {
                var session = getSession(token);
                if (session) {
                    var result = {status: 200, token: token, username: session.username};
                    var user = getUser(session.username);
                    if (user) {  //Именованная сессия
                        result.profile = user.profile;
                    }
                    $log.debug('result', result);
                    return [200, result , {}];
                } else {
                    //Сессия не найдена
                    $log.debug('result: 404(Not Found) Session not found');
                    return [404, {status: 404, message: 'Session not found'}, {}];
                }
            } else {
                //Не указан токен в запросе
                $log.debug('result: 400(Bad Request)');
                return [400, {status: 400, message: 'Bad Request'}, {}];
            }
        });


        //Создание новой сессии
        $httpBackend.whenPOST(url + '/session').respond(function (method, url, data, headers) {
            $log.debug('Received these data:', method, url, data, headers);
            var oldToken = headers['X-Auth-Token']; //Если задан
            var credentials = angular.fromJson(data);
            $log.debug('credentials:', credentials);
            if (credentials.username && credentials.password) {
                return loginAuthenticate(credentials, oldToken);
            } else if (credentials.challenge && credentials.answer) {
                return captureAuthenticate(credentials, oldToken);
            } else {
                //Не заданы пароль и имя пользователя, ни капча
                $log.debug('result: 400(Bad Request)');
                return [400, {status: 400, message: 'Bad Request'}, {}];
            }
        });
        //Удаление существующей сессии
        $httpBackend.whenDELETE(url + '/session').respond(function (method, url, data, headers) {
            $log.debug('Received these data:', method, url, data, headers);
            var token = headers['X-Auth-Token'];
            if (token) {
                if (sessions[token]) {
                    delete sessions[token];
                }
                $log.debug('result: 200(OK)');
                return [200, {}, {}];
            } else {
                //Не указан токен в запросе
                $log.debug('result: 400(Bad Request)');
                return [400, {status: 400, message: 'Bad Request'}, {}];
            }
        });

        function check(method, url, data, headers) {
            $log.debug('Received these data:', method, url, data, headers);
            var token = headers['X-Auth-Token'];
            var session;
            if (token && (session = getSession(token))) {
                session.count++;
                if (session.count < 5) {
                    return [200, {status: 200, message: 'OK' } , {}];
                } else {
                    return [401, {status: 401, message: 'Unauthorized', capture: getCaptureRequest()}, {}];
                }
            } else {
                //Не указан токен в запросе
                $log.debug('result: 401(Unauthorized)');
                return [401, {status: 401, message: 'Unauthorized', capture: getCaptureRequest()}, {}];
            }

        }


        $httpBackend.whenGET(/^\/api\//).respond(check);
        $httpBackend.whenPOST(/^\/api\//).respond(check);
        $httpBackend.whenPUT(/^\/api\//).respond(check);
        $httpBackend.whenDELETE(/^\/api\//).respond(check);



        function tokenAllow(headers) {
            $log.debug('Received request with headers:', headers);
            var token = headers['X-Auth-Token'];
            var session;
            if (token && (session = getSession(token))) {
                if (session.count < 5) {
                    //увеличиваем счетчик
                    session.count++;
                    $log.debug('Access allow:', session);
                    return true;
                }
            }
            $log.debug('Access not allow');
            return false;
        }

        function unauthorizedResponse(method, url, data, headers){
            $log.debug('unauthorizedResponse');
            return [401, {status: 401, message: 'Unauthorized', capture: getCaptureRequest()}, {}];
        }

        var restUrl=/^\/rest\//;

//        $httpBackend.whenGET(restUrl,tokenAllow).verify().passThrough();
//        $httpBackend.whenGET(restUrl,!tokenAllow).respond(unauthorizedResponse);
//
//
//        $httpBackend.when('POST',restUrl,undefined,!tokenAllow).respond(unauthorizedResponse);
//        $httpBackend.when('POST',restUrl,undefined,tokenAllow).passThrough();
//
//        $httpBackend.when('PUT',restUrl,undefined,tokenAllow).respond(unauthorizedResponse);
//        $httpBackend.when('PUT',restUrl,undefined,tokenAllow).passThrough();
//
//        $httpBackend.when('DELETE',restUrl,undefined,tokenAllow).respond(unauthorizedResponse);
//        $httpBackend.when('DELETE',restUrl,undefined,tokenAllow).passThrough();

//
//        $httpBackend.when(/^\/rest1\//).
//            get().
//            verify(function(headers) {
//                return headers.authToken === 'winnebago warrior';
//            }).
//            then().passThrough();

        $httpBackend.whenGET(/^\/rest\//).passThrough();
        $httpBackend.whenPOST(/^\/rest\//).passThrough();
        $httpBackend.whenPUT(/^\/rest\//).passThrough();
        $httpBackend.whenDELETE(/^\/rest\//).passThrough();
    });