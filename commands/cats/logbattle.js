const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'logbattle',
	description: 'Logs battle results into spreadsheet. Usage: !logbattle <Enemy_Name> [Win/Loss] [Instant: Yes/No]',
	cooldown: 5,
	guildOnly: true,
	execute(message, args) {

		delete require.cache[require.resolve('../../spreadsheet.json')];

		if(args.length == 0) {
			message.channel.send('You need to specify the enemy and result')
		}

		if(args[1] == undefined) {
			args[1] = 'Win'
		}

		if(args[2] == undefined) {
			args[2] = 'No'
		}

		let imgUrl = ''

		if(message.attachments.first() !== undefined) {
			imgUrl = message.attachments.first().url;
		}

		let currServer = message.guild.id;
        let currChannel = message.channel.id;

		if(servers[currServer] == undefined || servers[currServer].logRange == undefined) {
            message.channel.send(`Sorry, I have no data for this server`);
        } else {
			if(servers[currServer].dirChannel !== currChannel) {
                message.channel.send(`Wrong channel, use this command in <#${servers[currServer].dirChannel}>`);
            } else {
				const today = new Date().toISOString().slice(0,10);

				const gangSheet = servers[currServer].logRange;
				const gangsheetid = servers[currServer].spreadsheetid;

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

				let updateRange = gangSheet;
				let updateValue = [];
				updateValue.push([today,args[0],args[1],args[2],imgUrl])
				let updateRes = { 'values': updateValue};

				sheets.spreadsheets.values.append({
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
						message.channel.send(`Thanks, your battle data has been logged! :crossed_swords:`);
					}
				})
			}
		}
	},
};