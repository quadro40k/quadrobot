const {Discord, MessageEmbed} = require('discord.js');
const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');

const ptgRosterSheet = "14IYUT0r6xiBDuMhTs5-hkncXLf5oB0DrMSlTeoe8rr8";
const teamRange = "Sheet1!A4:K54"

module.exports = {
	name: 'ptg',
	description: 'Outputs current PTG team roster',
    aliases: ['ptgwankers'],
	cooldown: 5,
	execute(message) {

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

        const sheets = google.sheets('v4');

        sheets.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: ptgRosterSheet,
            range: teamRange
        }, function (err, res) {
            if(err) {
            console.log('API error' + err);
        } else {
            const rows = res.data.values;
            if (rows.length) {
                const outputArray = [];
                const name = 0;
                const tuner = 2;
                const painter = 3;
                const photo = 5;
                const racer = 7;
                const location = 10;
                const twitter = 9;
                let i = 0;
                rows.forEach(player => {
                    outputArray.push(player[name].slice(0,16).padEnd(16," ") + player[racer].padEnd(6," ") + player[tuner].padEnd(6," ") + player[painter].padEnd(8," "));

                })

                outputArray.sort((a, b) => {
                    if (a < b) {
                      return -1;
                    }
                    if (a > b) {
                      return 1;
                    }
                      return 0;
                  });
                outputArray.unshift('Name'.padEnd(16," ")+'Racer '+'Tuner '+ 'Painter ')
                //message.channel.send(`\`\`\`Sorry, this command is currently under construction\`\`\``);
                message.channel.send(`\`\`\`PTG Team Roster:\n${outputArray.join("\n")}\`\`\``);
                message.channel.stopTyping();

            }
        }
        })

    }
}