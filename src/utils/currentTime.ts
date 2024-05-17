import moment from 'moment-timezone';
import { DateTime } from 'luxon';

export const currentTime = () => {
    var m = moment.utc("DD-MM-YYYY h:mm:ss A"); // parse input as UTC
    var tz = 'America/Monterrey'; // example value, you can use moment.tz.guess()
    console.log(m.clone().tz(tz).format("DD-MM-YYYY h:mm:ss")); // 30-03-2017 2:34:22 AM

    return m.clone().tz(tz).format("DD-MM-YYYY h:mm:ss");
}