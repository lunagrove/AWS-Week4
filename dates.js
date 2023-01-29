function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = '' + d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [month, day, year].join('-');
}
exports.formatDate = formatDate

function formatTime(date) {
    var d = new Date(date),
    hours = '' + (d.getHours()),
    mins = '' + d.getMinutes(),
    secs = '' + d.getSeconds();

    if (hours.length < 2) 
        hours = '0' + hours;
    if (mins.length < 2) 
        mins = '0' + mins;
    if (secs.length < 2) 
        secs = '0' + secs;

    var ampm = "am";
    if( hours > 12 ) {
        hours -= 12;
        ampm = "pm";
    }

    return [hours, mins, secs].join(':') + ampm;
} 
exports.formatTime = formatTime;