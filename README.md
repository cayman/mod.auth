#mod.auth - Компонента авторизации и аутентификации
## Описание
Отображение основного навигационного меню на портале.
Компонента реализована как директива Angular. Реализован как атрибут authorization.
 <div id="authorization" authorization>
 </div>
###Параметр (значение атрибута)
В качестве параметра передается название текущего приложение
###Настройки компоненты
**config.yml**
    mod:
        auth:
            name: auth
            version: 1.3.0
            url:
              logon: /api/auth/logon   # url выхода в систему
              logout: /api/auth/logout # url  выход из системы
              user: /api/auth/user # url запроса текущего пользователя
            token: X-Auth-Token # при использовании токена при аутентификации
            params:
              login: login       # параметр логина, для входа в систему
              password: password # параметр пароля
              token: token       # параметр токена, только для авторизации токен в заголовке
              message: message
            username: username # string field or array
            unknown: Guest  #dafault username name

###Сборка
При сборки портала, файла конфигурации перезаписывает значения полей конфигурационным файлом
приложения а затем общим конфигурационным файлом портала (при наличии схожих полей).

## Использование
- Используется шаблоном портала template,
 в шаблоне template/src/_includes/header.hbs
Внутри самих приложений не используется

## Зависимости
- [Компонета mod.core](mode_core/mod/core)
- [Компонета mod.message](mode_message/mod/message)

