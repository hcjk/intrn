angular.module('intrn')
    .constant('API_BASE', '/api/')
    .config(['$locationProvider', function ($locationProvider) {
        $locationProvider.hashPrefix('');
    }])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                template: '<intrn-home-view></intrn-home-view>'
            })
            .when('/dashboard', {
                resolveRedirectTo: ['Auth', function (Auth) {
                    var payload = Auth.getTokenPayload();
                    if (payload) {
                        return '/users/' + payload.user || payload.user._id;
                    }

                    return '/';
                }]
            })
            .when('/users/:user_id', {
                template: '<intrn-dashboard-view></intrn-dashboard-view>'
            })
            .when('/login', {
                template: '<intrn-login-view></intrn-login-view>'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .config(['$authProvider', function ($authProvider) {
        $authProvider.google({
            clientId: '941216388351-2h4l60ast77vft9o1ugkat7ikjloiq9o.apps.googleusercontent.com'
        });

        $authProvider.baseUrl = '/api';
    }]);