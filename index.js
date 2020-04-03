const token_generator = require('./token_generator');
const listDaysEventCalendars = require('./eventsGetter');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const express = require('express');
var app = express();
var token = "";

app.get('/today', function(req, res) {
  if (req.headers['authorization'] == token) {
    answerRequest(listDaysEventCalendars, req, res, 1);
  } else {
    res.status(401).send('Unauthorized');
  }
});

app.get('/week', function(req, res) {
  if (req.headers['authorization'] == token) {
    answerRequest(listDaysEventCalendars, req, res, 7);
  } else {
    res.status(401).send('Unauthorized');
  }
});


// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function answerRequest(callback, req, res, object) {
  // Load client secrets from a local file.
  fs.readFile('./configure/credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err);
    // Authorize a client with credentials, then call the Google Calendar API.
    authorize(JSON.parse(content), callback, req, res, object);
  });
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback, req, res, object) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback, res, req, object);
    oAuth2Client.setCredentials(JSON.parse(token));
    oAuth2Client.on('tokens', (tokens) => {
        if (tokens.refresh_token) {
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
              });
        }
    });
    callback(oAuth2Client, res, req, object);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback, res, req, object) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client, res, req, object);
    });
  });
}

try {
  if (fs.existsSync('./configure/token.json')) {
    fs.readFile('./configure/token.json', (err, raw) => { 
      token = JSON.parse(raw).token; 
      console.log('The token is : ' + token);
      app.listen(8080, function() {
        console.log('App listening on port 8080.');
      });
    });
  }
  else {
    token_generator();
    setTimeout(function() {
      fs.readFile('./configure/token.json', (err, raw) => { token = JSON.parse(raw).token; console.log('The token is : ' + token); }); 
      app.listen(8080, function() {
        console.log('App listening on port 8080.');
      });
    }, 500);
  }
} catch (err) {
  console.error(err);
}
