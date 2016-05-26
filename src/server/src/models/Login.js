var logger = require('../services/logger.js');

var init = function(apiModel) {
    apiModel.registerPublicRoute('get'
        , 'login'
        , '/login'
        , login
        , {
            'user': {
                'required': true,
                'dataType': 'string'
            }
            , 'password': {
                'required': true,
                'dataType': 'string'
            }
        }
        , 'Login to a pi demo');
}

var login = function(req, res, next) {
    var user = req.query.user;
    var password = req.query.password;

    // TODO Validate login

    res.redirect('/dashboard');
}


exports.init = init;