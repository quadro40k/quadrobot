const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
    name: 'updbot',
    description: 'Updates your current bots data. Usage: !updbot <botnumber> <health> <damage>',
    cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        let currServer = message.guild.id;
        let currChannel = message.channel.id;
        let targetPlayer = message.author.id;

        if(servers[currServer] == undefined) {
            message.channel.send(`Sorry, have no data for this server`);
        } else {
            //if(servers[currServer].channel !== currChannel) {
            //    message.channel.send(`Wrong channel, use this command in <#${servers[currServer].channel}>`);
            //} else {

                let wrongArgs = 0;

                if(!args.length || isNaN(args[0]) || args[0] < 1 || args[0] > 3) {
                    wrongArgs++; 
                };

                if(isNaN(args[1]) || args[1] < 1) {
                    wrongArgs++; 
                };

                if(isNaN(args[2]) || args[2] < 1) {
                    wrongArgs++; 
                };

                if(wrongArgs > 0) {
                    message.channel.send('Ouch, something is wrong with your arguments. Use !updbot <botnumber> <health> <damage>')
                } else {
                    const gangSheet = servers[currServer].range;
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

                    sheets.spreadsheets.values.get({
                        auth: jwtClient,
                        spreadsheetId: gangsheetid,
                        range: gangSheet
                    }, function(err, res) {
                        if (err) {
                            console.log('API Error:' + err);
                        } else {
                            const rows = res.data.values;
                            if (rows.length) {
                                const healthString = "Health" + args[0];
                                const currentBot = rows[0].indexOf(healthString);

                                const playerRow = rows.findIndex(element => {
                                    return element.includes(targetPlayer);
                                }) + 1;
                                
                                if(playerRow == 0) {
                                    message.channel.send('Sorry mate, don\'t know you :confused:');
                                    message.channel.stopTyping();
                                } else {
                                    let updateCell = `R${playerRow}C${currentBot+1}`;
                                    let updateCellEnd = `R${playerRow}C${currentBot+2}`;
                                    let updatePage = res.data.range.split("!")[0];
                                    let updateRange = updatePage + "!" + updateCell + ":" + updateCellEnd;
                                    let updateValue = [];
                                    updateValue.push([args[1], args[2]]);
                                    let updateRes = { 'values': updateValue};

                                    sheets.spreadsheets.values.update({
                                        auth: jwtClient,
                                        spreadsheetId: gangsheetid,
                                        range: updateRange,
                                        valueInputOption: 'USER_ENTERED',
                                        resource: updateRes
                                    }, (err, result) => {
                                        if(err) {
                                            console.log("Error writing:" + err);
                                            message.channel.send('Ouch, something went wrong, update failed');
                                            message.channel.stopTyping();
                                        } else {
                                            message.channel.send(`Your bot number ${args[0]} is updated! :crossed_swords:`);
                                            message.channel.stopTyping()
                                        }
                                    })
                                }
                            }
                        }
                        
                    })

                }
            //}
        }
    }

}