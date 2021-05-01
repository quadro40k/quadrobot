const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');

const carListSheet = "1xI07iE3Y1Aqcmx30Yp3Aq8dCbOCMabjYCBwGnFsF3X0";
const carRange = "Cars List!A:BS"

module.exports = {
    name: 'fm7cars',
    description: `Lists Forza Motorsport 7 cars fitting given parameters.
    Up to 20 results will be shown.
    Search parameters are case sensitive: "ferrari" won\'t find anything, while "Ferrari" will.
    Multi-word parameters need to be enclosed in quotes, like so: "Aston Martin".
    Usage examples:
    !fm7cars Ferrari S - all Ferrari cars in S stock class
    !fm7cars "Sport GT" Italy - all Italian cars belonging to Sport GT category
    !fm7cars Lamborghini 400,000 - all Lambos with 400k price`,
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
                        const isFM7 = rows[0].indexOf("FM7");
                        const carClass = rows[0].indexOf("Class");
                        const price = rows[0].indexOf("Value");
                        const rarity = rows[0].indexOf("Tier");

                        const argsFilters = {"one": rows.filter(element => element.includes(args[0]) && element[isFM7] !== ""),
                                          "two": rows.filter(element => element.includes(args[0]) && element[isFM7] !== "").filter(element => element.includes(args[1])),
                                          "three": rows.filter(element => element.includes(args[0]) && element[isFM7] !== "").filter(element => element.includes(args[1])).filter(element => element.includes(args[2])),
                                          "four": rows.filter(element => element.includes(args[0]) && element[isFM7] !== "").filter(element => element.includes(args[1])).filter(element => element.includes(args[2])).filter(element => element.includes(args[3]))}
                        
                        let fm7Array = argsFilters[Object.keys(argsFilters)[argsCase]];
                        if(fm7Array.length == 0) {
                            message.channel.send(`Sorry, I couldn\'t find anything with these parameters. \nTry running broader search.\nType !help fm7cars for more details.` );
                            message.channel.stopTyping();
                        } else {
                            let tempArray = fm7Array.slice(0, 20);
                            let outputArray = [];
                            for(let car of tempArray) {
                                outputArray.push(`${car[year]} ${car[make]} ${car[model]}, Class: ${car[carClass]}, ${car[rarity]}, Price: ${car[price]}`)
                            }
                            outputArray.unshift(`Showing first ${tempArray.length} of ${fm7Array.length} results:`);
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