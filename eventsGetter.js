const {google} = require('googleapis');

/**
 * Returns an array of dates for the 7 next coming days.
 * The date are in string in the YYYY-MM-DD format.
 */
function getXDaysDates(days) {
    const today = new Date();
    const week = [];
    for (let i = 0; i < days; i++) {
        week.push(today.toISOString().split('T')[0]);
        today.setDate(today.getDate() + 1);
    }
    return (week);
}

/**
 * Parse the event and check if it is in the next upcoming 7 days.
 * @param {google.calendar.event} event The event to parse.
 */
function checkEvent(event, days) {
  const week = getXDaysDates(days);
  const start = event.start.date;
  const date = event.start.date || event.start.dateTime;
  // adding event if in week
  if (week.includes(start)) {
    return ({
      date: date,
      name: event.summary
    });
  } else {
    return null;
  }
}

/**
 * Lists the user's calendars 
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listDaysEventCalendars(auth, response, request, days) {
    const calendar = google.calendar({version: 'v3', auth});
    var obj = {
        totalEvents: 0,
        cals: []
    };
    new Promise((resolve, reject) => {

        // getting calendars list
        calendar.calendarList.list({}, (err, res) => {

            // Checking for various errors
            if (err) return reject(new Error('The API returned an error: ' + err));
    
            const calendars = res.data.items;
            if (calendars.length == undefined) return reject(new Error("No calendars"));

            // creating an array of promises to get every evvents from the calendars.
            let calendarPromise = calendars.map((cal, i) => {
                return new Promise((calResolve, calReject) => {
                    calendar.events.list({
                        calendarId: cal.id,
                        timeMin: (new Date()).toISOString(),
                        maxResults: 10,
                        singleEvents: true,
                        orderBy: 'startTime',
                    }, (err, res) => {
                        // callback once the event list is received
                        var calObj = {
                            name: cal.summary,
                            events: []
                        };

                        // checking errors
                        if (err) return ;
                        const events = res.data.items;
                        if (events.length == undefined) return;
        
                        // mapping on calendar's event
                        events.map((event, i) => {
                            var ret = checkEvent(event, days);
                            if (ret != null) {
                                obj.totalEvents += 1;
                                calObj.events.push(ret);
                            }
                        });
                        obj.cals.push(Object.assign({}, calObj));
                        calResolve();
                    });
                });
            });
            Promise.all(calendarPromise).then(() => resolve());
        });
    }).then(() => {
        return response.status(200).send(JSON.stringify(obj));
    }).catch((err) => {
        return response.status(400).send(JSON.stringify(err));
    });
}

module.exports = listDaysEventCalendars;