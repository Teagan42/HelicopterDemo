var curry = require('curry');

var LEVEL = {
    INFO: 'INFO',
    DEBUG: 'DEBUG',
    WARN: 'WARN',
    ERROR: 'ERROR',
    FATAL: 'FATAL'
};

var config;
var loggers = [];

function loadLogger(loggerConfig) {
    console.log('Loading Logger', loggerConfig.name);
    var logger = require('./loggers/' + loggerConfig.name + '.logger.js');

    if (logger.init) {
        logger.init(loggerConfig);
    }

    loggers.push(logger);
}

function loadLoggers(loggers) {
    if (loggers && loggers instanceof Array) {
        loggers.forEach(function(loggerConfig) {
            loadLogger(loggerConfig);
        });
    }
}

function init(cfg) {
    if (config) { return; }

    config = cfg || {};

    loadLoggers(config.loggers);
}

var log = curry(function(logLevel, message) {
    if (!loggers || !(loggers instanceof Array)) { return; }

    var strMessage = typeof message === 'string' ? message : JSON.stringify(message);

    loggers.forEach(function(logger) {
        if (logger.canLog(logLevel)) {
            logger.log(logLevel, strMessage);
        }
    });
});

exports.init = init;
exports.info = log(LEVEL.INFO);
exports.debug = log(LEVEL.DEBUG);
exports.warn = log(LEVEL.WARN);
exports.error = log(LEVEL.ERROR);
exports.fatal = log(LEVEL.FATAL);