var colors = require('colors');

var config;
var activeLevels = {};
var levelColors = {
    INFO: colors.white,
    DEBUG: colors.green,
    WARN: colors.yellow,
    ERROR: colors.magenta,
    FATAL: colors.red
};

function setColors(colors) {
    if (colors && colors instanceof Array) {
        colors.forEach(function(levelColor) {
            if (!colors[levelColor.color.toLowerCase()]) {
                throw new Error('Console color [' + levelColor.color.toLowerCase() + '] is not available.');
            } else {
                levelColors[levelColor.level.toUpperCase()] = colors[levelColor.color.toLowerCase()];
            }
        });
    }
}

function setLevels(levels) {
    if (levels && levels instanceof Array) {
        levels.forEach(function(logLevel) {
            activeLevels[logLevel.toUpperCase()] = true;
        });
    }
}

function canLog(logLevel) {
    return activeLevels[logLevel];
}

function init(cfg) {
    config = cfg || {};

    setLevels(cfg.levels);

    setColors(cfg.colors);
}

function log(logLevel, message) {
    console.log(levelColors[logLevel](message)); // eslint-disable-line no-console
}

exports.init = init;
exports.log = log;
exports.canLog = canLog;