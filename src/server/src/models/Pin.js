var PIN_ID = 'id'
    , PIN_DIRECTION = 'direction'
    , PIN_INTERRUPT = 'interrupt'
    , PIN_NUMBER = 'number'
    , WRITE_VALUE = 'value';
var logger = require('../services/logger.js');
//var GPIO = require('onoff').Gpio;

var Pin = function (id, direction, interrupt, number) {
    var self = this;

    //self.__gpio = new GPIO(number, direction, interrupt);
    self.id = id;
    self.direction = direction;
    self.interrupt = interrupt;
    self.number = number;

    self.read = function () {
        var promise = new Promise(function (accept) {
            var readVal = 0;
            logger.debug('Reading pin: ' + readVal);
            //self.__gpio.read()
            accept(readVal);
        });

        return promise;
    };

    self.write = function (writeVal) {
        var promise = new Promise(function (accept) {
            logger.debug('Writing pin: ' + writeVal);
            //self.__gpio.write(writeVal, function () {
                accept();
            //});
        });

        return promise;
    };

    self.setDirection = function (direction) {
        logger.debug('Setting direction: ' + direction);
        //self.__gpio.setDirection(direction);
    };

    self.setInterrupt = function (interrupt) {
        logger.debug('Setting interrupt: ' + interrupt);
        //self.__gpio.setEdge(edge);
    };

    self.setNumber = function (number) {
        logger.debug('Setting pin number: ' + number);
        if (self.__gpio) {
            //self.__gpio.unwatchAll();
        }

        //self.__gpio = new GPIO(number, direction, interrupt);
    };
};

var init = function(apiModel) {
    apiModel.registerPublicRoute('get'
        , 'pin'
        , '/api/pins'
        , getPins
        , { }
        , 'Get a list of current pin settings.');
    apiModel.registerPublicRoute('get'
        , 'pin'
        , '/api/pin'
        , getPin
        , {
            PIN_ID: {
                'required': true
                , 'dataType': 'string'
            }
        }
        , 'Get the current status of the specified pin.');
    apiModel.registerPublicRoute('post'
        , 'pin'
        , '/api/pin'
        , updatePin
        , {
            PIN_ID: {
                'required': true
                , 'dataType': 'string'
            }
            , PIN_DIRECTION: {
                'required': false
                , 'dataType': 'string'
            }
            , PIN_INTERRUPT: {
                'required': false
                , 'dataType': 'string'
            }
            , PIN_NUMBER: {
                'required': false
                , 'dataType': 'number'
            }
        }
        , 'Update a pin\'s meta data.');
    apiModel.registerPublicRoute('post'
        , 'pin'
        , '/api/pin/write'
        , writePin
        , {
            PIN_ID: {
                'required': true
                , 'dataType': 'string'
            }, WRITE_VALUE: {
                'required': true
                , 'dataType': 'number'
            }
        }
        , 'Write the specified value to the pin.');
}

var pins = {};
var validDirections = [
    'in'
    , 'out'
    , 'high'
    , 'low'
    , 'off'
];
var validInterupts = [
    'both'
    , 'rising'
    , 'falling'
    , 'none'
];
var validPinNumbers = [
    2
    , 3
    , 4
    , 17
    , 27
    , 22
    , 10
    , 9
    , 11
    , 5
    , 6
    , 13
    , 19
    , 26
    , 14
    , 15
    , 18
    , 23
    , 24
    , 25
    , 8
    , 7
    , 12
    , 16
    , 20
    , 21
];

var validatePinId = function (pinId, res) {
    logger.debug('Pin Id:' + pinId);
    if (!pinId) {
        res.status(400)
            .json({
                'message': 'Invalid Pin Id'
                , 'code': 400
            });
        return false;
    }

    return true;
};

var validatePinNumber = function (pinNumber, res) {
    return validateInArray('Pin Number', pinNumber, validPinNumbers, res);
};

var validateDirection = function (direction, res) {
    return validateInArray('Direction', direction, validDirections, res);
};

var validateInterrupt = function (interrupt, res) {
    return validateInArray('Interrupt', interrupt, validInterupts, res);
};

var validateInArray = function (label, val, arr, res) {
    if (!val || arr.indexOf(val) < 0) {
        res.status(400)
            .json({
                'message': 'Invalid ' + label
                , 'code': 400
            });
        return false;
    }

    return true;
};

var validateWriteValue = function (writeVal, res) {
    logger.debug(writeVal);
    if (writeVal === undefined
        || writeVal < 0
        || writeVal > 1) {
        res.status(400)
            .json({
                'message': 'Invalid Value ' + writeVal
                , 'code': 400
            });
        return false;
    }

    return true;
};

var getPins = function(req, res, next) {
    res.status(200)
        .json(pins);
};

var getPin = function(req, res, next) {
    var pinId = req.query.id;

    if (!validatePinId(pinId, res)) return;

    res.status(200)
        .json(pins[pinId]);
};

var updatePin = function(req, res, next) {
    var pinId = req.body[PIN_ID];
    var pinDirection = req.body[PIN_DIRECTION];
    var pinInterrupt = req.body[PIN_INTERRUPT];
    var pinNumber = parseInt(req.body.number);

    if (!validatePinId(pinId, res)
        || (pinDirection && !validateDirection(pinDirection, res))
        || (pinInterrupt && !validateInterrupt(pinInterrupt, res))
        || (pinNumber && !validatePinNumber(pinNumber, res))) return;

    pins[pinId] = new Pin(pinId, pinDirection, pinInterrupt, pinNumber);

    res.status(200)
        .json({
            'code': 200
        });
};

var writePin = function(req, res, next) {
    var pinId = req.body[PIN_ID];
    var writeVal = req.body[WRITE_VALUE];

    if (!validatePinId(pinId, res)
        || !validateWriteValue(writeVal, res)) return;

    if (!pins[pinId] || !pins[pinId].write) {
        res.status(400)
            .json({
                'message': 'Pin has not been initialized.'
                ,'code': 400
            });
    } else {
        pins[pinId].write(writeVal)
            .then(function () {
                res.status(200)
                    .json({
                        'code': 200
                    });
            });
    }
};

exports.init = init;