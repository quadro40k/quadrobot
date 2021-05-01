const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');

const carListSheet = "1IAr3t4-hKoK6SlR9bMUBq3wQ79l-cuV5UQPe6ICXpKQ";
const carRange = "PTG Jamie !A:K"

module.exports = {
    name: 'jamie',
    description: `Lists PTG Jamie's tunes for Forza Horizon 4 fitting given parameters.
    Up to 20 results will be shown.
    Search parameters are case sensitive: "ferrari" won\'t find anything, while "Ferrari" will.
    Multi-word parameters need to be enclosed in quotes, like so: "Aston Martin".
    Usage examples:
    !jamie Ferrari S2 - all Ferrari tunes to S2 class
    !jamie "Aston Martin" RWD - all Aston Martin tunes with RWD`,
    cooldown: 5,
    execute(message, args) {
        if(args.length == 0) {
            message.channel.send('I need some arguments');
        } else {
            let argsCase = 0;
            if(args.length > 4) {
                argsCase = 3;
            } else {
                argsCase = args.length - 1
            };
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
                spreadsheetId: carListSheet,
                range: carRange
            }, function (err, res) {
                if(err) {
                    console.log('API error' + err);
                } else {
                    const rows = res.data.values;
                    if (rows.length) {
                        const year = rows[0].indexOf("Year");
                        const make = rows[0].indexOf("Make");
                        const carType = rows[0].indexOf("Championship Division");
                        const model = rows[0].indexOf("Models");
                        const purpose = rows[0].indexOf("Purpose");
                        const whatPI = rows[0].indexOf("PI");
                        const carClass = rows[0].indexOf("Class");
                        const driveType = rows[0].indexOf("Drive Type");
                        //const rarity = rows[0].indexOf("Rarity");

                        const argsFilters = {"one": rows.filter(element => element.includes(args[0])),
                                          "two": rows.filter(element => element.includes(args[0])).filter(element => element.includes(args[1])),
                                          "three": rows.filter(element => element.includes(args[0])).filter(element => element.includes(args[1])).filter(element => element.includes(args[2])),
                                          "four": rows.filter(element => element.includes(args[0])).filter(element => element.includes(args[1])).filter(element => element.includes(args[2])).filter(element => element.includes(args[3]))}
                        
                        //console.log(`${rows[9][year]} ${rows[9][make]} ${rows[9][model]}, Nickname: ${rows[9][nickname]}, FH4: ${rows[9][isFH4]}`);
                        let fh4Array = argsFilters[Object.keys(argsFilters)[argsCase]];
                        if(fh4Array.length == 0) {
                            message.channel.send(`Sorry, I couldn\'t find a tune by PTG Jamie with these parameters.\nTry running broader search.\nType !help jamie for more details.` );
                            message.channel.stopTyping();
                        } else {
                            let tempArray = fh4Array.slice(0, 20);
                            let outputArray = [];
                            for(let car of tempArray) {
                                outputArray.push(`${car[year]} ${car[make]} ${car[model]}, Class: ${car[carClass]}${car[whatPI]}, ${car[driveType]}, ${car[purpose]}`)
                            }
                            outputArray.unshift(`PTG Jamie\'s Forza Horizon 4 Tunes\nShowing first ${tempArray.length} of ${fh4Array.length} tunes:`);
                            //outputArray.push(`\nPowered by Manteomax, www.manteomax.com. Coded by PTG quadro40k.`)
                            message.channel.send(`\`\`\`${outputArray.join("\n")}\`\`\``);
                            message.channel.stopTyping();
                        }
                    }
                }
            })
        }
    }
}