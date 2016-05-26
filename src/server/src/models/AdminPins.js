var init = function(apiModel) {
    apiModel.registerPublicRoute('get'
        , 'administer pins'
        , '/admin/pins'
        , administerPins
        , { }
        , 'Administer GPIO pins - assign pins to relays, buttons, LEDs, etc.');
}

var administerPins = function(req, res, next) {
    res.render('admin/pins.html');
};

exports.init = init;