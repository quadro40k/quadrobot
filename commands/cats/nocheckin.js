const fs = require('fs');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'nocheckin',
	description: 'Assings nocheckin role (if exists) to all gang members',
	cooldown: 5,
	guildOnly: true,
	execute(message) {

		const role = message.guild.roles.cache.find(role => role.name == 'nocheckin')

		if(role == undefined) {
			console.log('No suitable role');
			return;
		} else {
		
			let currServer = message.guild.id;

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
					const discId = rows[0].indexOf("DiscordID");
					
					for(i = 1; i <= rows.length - 1; i++) {        
					if(rows[i][0] !== undefined && rows[i][0] !== "" && rows[i][0] !== null) {
						let player = rows[i][discId]
						sortArray.push(player)
					}
					}
					message.guild.members.fetch({user: sortArray})
					.then(members => {
						members.forEach(member => member.roles.add(role))
					})
					.catch(error => console.log(error));
				} else {
					console.log('No data found.');
				}
					
			});
		}
		
	},
};