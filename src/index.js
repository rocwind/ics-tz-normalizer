import { createServer } from 'http';
import { get } from 'https';
import { TZMapping } from './tz.js';

// There is an issue that timezone information is not handled correctly by Google calendar for calendars that are shared by Outlook.
// This little tool is created to covert the MS tz to standard tz so Google can handle it and display events correct.
// https://support.google.com/calendar/thread/253308528?msgid=254249904&sjid=8359622108085687688-AP

// Examples:
// TZID:Pacific Standard Time
// EXDATE;TZID=Singapore Standard Time:20230524T093000
const regTZ = /TZID[:=]([a-zA-Z ]+)/;

/**
 * Fix the TZ in ics file
 * @param {string} icsFileContents
 * @returns
 */
function fixTZ(icsFileContents) {
    return icsFileContents
        .split('\n')
        .map((line) => {
            const matches = regTZ.exec(line);
            if (matches) {
                const TZ = matches[1];
                const mappedTZ = TZMapping[TZ];
                if (mappedTZ) {
                    return line.replace(matches[1], mappedTZ);
                } else {
                    console.log('Unknown TZ:', TZ);
                }
            }
            return line;
        })
        .join('\n');
}

/**
 * ?ics=<encoded url>
 */
const server = createServer((req, res) => {
    const reqURL = new URL(req.url, 'http://localhost');
    const url = decodeURIComponent(reqURL.searchParams.get('ics'));
    console.log('fetch url: ', url);

    get(url, (re) => {
        const data = [];
        re.on('data', (chunk) => {
            data.push(chunk);
        });
        re.on('end', () => {
            const end = Buffer.concat(data).toString();
            res.writeHead(200);
            res.write(fixTZ(end));
            res.end();
        });
    });
});

const port = process.env.PORT || 4000;

console.log(`listening at port: ${port}`);
server.listen(port, '0.0.0.0');
