const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'gangtr',
	description: 'Outputs gang\'s trophies details',
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
                const curr = rows[0].indexOf("CurCycle");
                const cycle2 = rows[0].indexOf("Cycle2");
                const cycle3 = rows[0].indexOf("Cycle3");
                const cycle4 = rows[0].indexOf("Cycle4");

                for(i = 1; i <= rows.length - 1; i++) {
                    
                    if(rows[i][0] !== undefined && rows[i][0] !== "" && rows[i][0] !== null) {
                    let name = rows[i][0].slice(0, 14).padEnd(15, " ");
                    let playerCurr = rows[i][curr].toString().padEnd(8, " ");
                    let playerAvg = Math.round((Number(rows[i][cycle2]) + Number(rows[i][cycle3]) + Number(rows[i][cycle4]))/3);
                    sortArray.push([name, playerCurr, playerAvg])
                    }
                }
                sortArray.sort((a, b) => {
                    return b[1] - a[1];
                });
                sortArray.forEach((player) => {
                    outputArray.push(player[0]+player[1]+player[2]);
                });

                outputArray.unshift("Name".padEnd(15)  + "Current" + " " + "Avg");
                  message.channel.send(`\`\`\`${outputArray.join("\n")}\`\`\``);
                  message.channel.stopTyping();
              } else {
                console.log('No data found.');
              }
               
            });
        }
      
    }   
	},
};