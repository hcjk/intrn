angular.module('intrn')
    .factory('User', ['API_BASE', '$resource', function (API_BASE, $resource) {
        return $resource(API_BASE +  'users/:user_id', {
            user_id: '@_id'
        }, {
            queryCompanies: {
                method: 'GET',
                url: API_BASE + 'users/:user_id/companies',
                isArray: true
            }
        });
    }]);