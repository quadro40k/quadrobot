const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'battlestats',
	description: 'Shows gang\'s battle stats and last 10 battles details.',
    aliases: ['gangstats'],
	cooldown: 5,
	guildOnly: true,
	execute(message, args) {

        delete require.cache[require.resolve('../../spreadsheet.json')];

		let currServer = message.guild.id;

		if(servers[currServer] == undefined || servers[currServer].logRange == undefined) {
            message.channel.send(`Sorry, I have no data for this server`);
        } else {
			const gangSheet = servers[currServer].logRange;
			const gangsheetid = servers[currServer].spreadsheetid;
			message.channel.startTyping();

			// configure a JWT auth client
			let jwtClient = new google.auth.JWT(
				privatekey.client_email,
				null,
				privatekey.private_key,
				['https://www.googleapis.com/auth/spreadsheets']
			);
			//authenticate request
			jwtClient.authorize(function (err, tokens) {
				if(err) {
					console.log(err);
					return;
				} else {
					return;
				}
			});

			const sheets = google.sheets('v4');

			const sortArray = [];
			const outputArray = [];

			sheets.spreadsheets.values.get({
				auth: jwtClient,
				spreadsheetId: gangsheetid,
				range: gangSheet,
				}, (err, res) => {
				  if (err) return console.log('The API returned an error: ' + err);
				  const rows = res.data.values;
				  if (rows.length) {
					const date = rows[0].indexOf("Date");
					const enemy = rows[0].indexOf("Enemy");
					const result = rows[0].indexOf("Result");
					const instant = rows[0].indexOf("Instant");

					let wins = 0;
					let losses = 0;
						
					for(i = 1; i <= rows.length - 1; i++) {        
                        if(rows[i][0] !== undefined && rows[i][0] !== "" && rows[i][0] !== null) {
                          let battleDate = rows[i][date].slice(5,10).padEnd(6," ");
                          let enemyName = rows[i][enemy].slice(0, 15).padEnd(15, " ");
                          let battleRes = rows[i][result];
                          let battleIns = rows[i][instant].padEnd(4, " ");
  
  
                          if(args[0] !== undefined) {
                              if(enemyName.toLowerCase().includes(args[0].toLowerCase())) {
                                  sortArray.push([battleDate, enemyName, battleRes, battleIns])
                                  if(battleRes.toLowerCase() == 'win') {
                                      wins++
                                  }
                                  if(battleRes.toLowerCase() == 'loss'){
                                      losses++
                                  }
                              }
                          } else {
                              sortArray.push([battleDate, enemyName, battleRes, battleIns])
                              if(battleRes.toLowerCase() == 'win') {
                                  wins++
                              }
                              if(battleRes.toLowerCase() == 'loss'){
                                  losses++
                              }
                          }
                          
                        }
                    }

					let count = 0;

					if(sortArray.length > 10) {
						count = sortArray.length - 10;
					}
                    if(sortArray.length == 0) {
						outputArray.push(`No battle data found`)
					}

					for(j = count; j <= sortArray.length - 1; j++) {
						outputArray.push(`${sortArray[j][0]}${sortArray[j][1]}${sortArray[j][2].padEnd(5, " ")}${sortArray[j][3]}`)
					}
	  
					outputArray.unshift("Date".padEnd(6, " ")  + "Enemy".padEnd(15, " ") + "Win? " + "Inst");
					outputArray.unshift(`Showing last 10 battles:`);
					outputArray.unshift(`Total: ${wins+losses}, Wins: ${wins}, Losses: ${losses}, Ratio: ${Math.round(wins/(wins+losses)*100)}%`);
					message.channel.send(`\`\`\`${outputArray.join("\n")}\`\`\``);
					message.channel.stopTyping();
				  } else {
					console.log('No data found.');
					message.channel.stopTyping();
				  }
					 
				});
		}
	},
};