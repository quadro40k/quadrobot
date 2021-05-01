const { findTimeZone, getZonedTime } = require('timezone-support');
const { formatZonedTime } = require('timezone-support/dist/parse-format');

//this module relies on timezone-support npm package and exports getLocalTime function to be used in bot commands

exports.getLocalTime = function(timezone = 'Etc/UTC') {
    try {
    const myTZ = findTimeZone(timezone);
    const timeFormat = 'HH:mm z';
    const now = new Date();

    let localTime = formatZonedTime(getZonedTime(now, myTZ), timeFormat);
    
        return localTime;
    } catch(error) {
        return "sorry mate, that timezone is rubbish";
    }
};

