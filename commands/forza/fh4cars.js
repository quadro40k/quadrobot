const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');

const carListSheet = "1D0tumuFzvUmLnnPf0TmEXYtreci6sZCa6VPGo-DxY9c";
const carRange = "Cars!A:BZ"

module.exports = {
    name: 'fh4cars',
    description: `Lists Forza Horizon 4 cars fitting given parameters.
    Up to 20 results will be shown.
    Search parameters are case sensitive: "ferrari" won\'t find anything, while "Ferrari" will.
    Multi-word parameters need to be enclosed in quotes, like so: "Aston Martin".
    Usage examples:
    !fh4cars Ferrari S2 - all Ferrari cars in S2 stock class
    !fh4cars Germany "Hot Hatch" - all German cars belonging to Hot Hatch category
    !fh4cars Lamborghini 250,000 - all Lambos with 250k price`,
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
                        const make = year + 1;
                        const carType = rows[0].indexOf("Car Type");
                        const model = year + 2;
                        const nickname = rows[0].indexOf("Nickname");
                        const isFH4 = rows[0].indexOf("FH4");
                        const carClass = rows[0].indexOf("Class");
                        const price = rows[0].indexOf("Car Value");
                        const rarity = rows[0].indexOf("Rarity");

                        const argsFilters = {"one": rows.filter(element => element.includes(args[0]) && element[isFH4] !== ""),
                                          "two": rows.filter(element => element.includes(args[0]) && element[isFH4] !== "").filter(element => element.includes(args[1])),
                                          "three": rows.filter(element => element.includes(args[0]) && element[isFH4] !== "").filter(element => element.includes(args[1])).filter(element => element.includes(args[2])),
                                          "four": rows.filter(element => element.includes(args[0]) && element[isFH4] !== "").filter(element => element.includes(args[1])).filter(element => element.includes(args[2])).filter(element => element.includes(args[3]))}
                        
                        //console.log(`${rows[9][year]} ${rows[9][make]} ${rows[9][model]}, Nickname: ${rows[9][nickname]}, FH4: ${rows[9][isFH4]}`);
                        let fh4Array = argsFilters[Object.keys(argsFilters)[argsCase]];
                        if(fh4Array.length == 0) {
                            message.channel.send(`Sorry, I couldn\'t find anything with these parameters. \nTry running broader search.\nType !help fh4cars for more details.` );
                            message.channel.stopTyping();
                        } else {
                            let tempArray = fh4Array.slice(0, 20);
                            let outputArray = [];
                            for(let car of tempArray) {
                                outputArray.push(`${car[year]} ${car[make]} ${car[model]}, Class: ${car[carClass]}, ${car[rarity]}, Price: ${car[price]}`)
                            }
                            outputArray.unshift(`Showing first ${tempArray.length} of ${fh4Array.length} results:`);
                            outputArray.push(`\nPowered by Manteomax, www.manteomax.com. Coded by PTG quadro40k.`)
                            message.channel.send(`\`\`\`${outputArray.join("\n")}\`\`\``);
                            message.channel.stopTyping();
                        }
                    }
                }
            })
        }
    }
}