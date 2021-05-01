const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
    name: 'updtr',
    description: 'Updates your current trophies. Usage: -updtr <number>',
    cooldown: 5,
    guildOnly: true,
    execute(message, args) {
        let currServer = message.guild.id;
        let currChannel = message.channel.id;
        let targetPlayer = message.author.id;

        if(servers[currServer] == undefined) {
            message.channel.send(`Sorry, have no data for this server`);
        } else {
            if(servers[currServer].channel !== currChannel) {
                message.channel.send(`Wrong channel, use this command in <#${servers[currServer].channel}>`);
            } else {
                if(!args.length || isNaN(args[0]) || args[0] < 0) {
                    message.channel.send('Mate, you need to specify a valid number after -updtr')
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
                                const discID = rows[0].indexOf("DiscordID");
                                const currTr = rows[0].indexOf("CurCycle");

                                const playerRow = rows.findIndex(element => {
                                    return element.includes(targetPlayer);
                                }) + 1;
                                
                                if(playerRow == 0) {
                                    message.channel.send('Sorry mate, don\'t know you :confused:');
                                    message.channel.stopTyping();
                                } else {
                                    let updateCell = `R${playerRow}C${currTr+1}`;
                                    let updatePage = res.data.range.split("!")[0];
                                    let updateRange = updatePage + "!" + updateCell;
                                    let updateValue = [];
                                    updateValue.push([args[0]]);
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
                                        } else {
                                            message.channel.send('Your trophy count is updated! :thumbsup:');
                                            message.channel.stopTyping()
                                        }
                                    })
                                }
                            }
                        }
                        
                    })

                }
            }
        }
    }

}