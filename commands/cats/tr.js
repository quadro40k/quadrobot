const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'tr',
	description: 'Pings players below given trophies amount (default pings under 200)',
	cooldown: 5,
  guildOnly: true,
	execute(message, args) {

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

        if(!args.length) {
            args[0] = 200;
        };

        if(args[0] == NaN) {
            message.channel.send('You should specify some number as an argument!');
        } else {
        const gangSheet = servers[currServer].range;
        const gangsheetid = servers[currServer].spreadsheetid;
        message.channel.startTyping();
        
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
                  const discID = rows[0].indexOf("DiscordID");

                  for(i = 1; i <= rows.length - 1; i++) {
                      
                      if(rows[i][0] !== undefined && rows[i][0] !== "" && rows[i][0] !== null) {
                          if(Number(rows[i][curr]) < args[0]) {
                              sortArray.push(`<@${rows[i][discID]}>`)
                          }
                      }
                  }

              } else {
                console.log('No data found.');
              }
              message.channel.send(`Hey ${sortArray.join(", ")}, you are below ${args[0]} trophies :man_facepalming:! Do your GF, eh?`)
              message.channel.stopTyping();
            });
          }
        }
      
    }
	},
};