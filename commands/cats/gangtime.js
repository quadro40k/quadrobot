const { getLocalTime } = require('../../scripts/gettime.js');
const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')


module.exports = {
	name: 'gangtime',
	description: 'Outputs current time for each gang member',
	cooldown: 5,
  guildOnly: true,
	execute(message) {
    let currServer = message.guild.id;
    let currChannel = message.channel.id;

    if(servers[currServer] == undefined) {
			message.channel.send(`Sorry, have no data for this server`);
		}
    else {
      if(servers[currServer].channel !== currChannel) {
        message.channel.send(`Wrong channel, use this command in <#${servers[currServer].channel}>`);
      }
      else {
        message.channel.startTyping();
        const gangSheet = servers[currServer].range;
        const gangsheetid = servers[currServer].spreadsheetid;
        
        // configure a JWT auth client
        let jwtClient = new google.auth.JWT(
          privatekey.client_email,
          null,
          privatekey.private_key,
          ['https://www.googleapis.com/auth/spreadsheets']);
        //authenticate request
        jwtClient.authorize(function (err, tokens) {
        if (err) {
          console.log(err);
          return;
        } else {
          return;
          }
        });

        const sortArray = [];
        const outputArray = [];

        const sheets = google.sheets('v4');
        
        sheets.spreadsheets.values.get({
          auth: jwtClient,
          spreadsheetId: gangsheetid,
          range: gangSheet,
          }, (err, res) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = res.data.values;
            if (rows.length) {
              const loc = rows[0].indexOf("Location");
              const tz = rows[0].indexOf("Timezone");

              for(i = 1; i <= rows.length - 1; i++) {
                      
                if(rows[i][0] !== undefined && rows[i][0] !== "" && rows[i][0] !== null) {
                  let localTime = getLocalTime(rows[i][tz]).slice(0, 5);
                  let name = rows[i][0].slice(0, 14).padEnd(15, " ");
                  let location = rows[i][loc].padEnd(14, " ");
                  sortArray.push([name, localTime, location])
                }
              }

              sortArray.sort((a, b) => {
                if (a[1] < b[1]) {
                  return -1;
                }
                if (a[1] > b[1]) {
                  return 1;
                }
                  return 0;
              });

              sortArray.forEach((player) => {
                outputArray.push(player[0]+ " " + player[1]+ "   " + player[2]);
              });

              outputArray.unshift("Name".padEnd(15) + " " + "Time   " + " " + "Location");
              message.channel.send(`\`\`\`${outputArray.join("\n")}\`\`\``)
              message.channel.stopTyping();

            } else {
                console.log('No data found.');
              }
          });
          
      }
    }      
	},
};