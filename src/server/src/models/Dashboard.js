var init = function(apiModel) {
    apiModel.registerPublicRoute('get'
        , 'dashboard'
        , '/'
        , dashboard
        , { }
        , 'View dashboard');
}

var dashboard = function(req, res, next) {
    res.render('dashboard.html');
};

exports.init = init;