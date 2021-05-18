const fs = require('fs');
const Discord = require('discord.js');
const { findTimeZone, getZonedTime } = require('timezone-support');
const { formatZonedTime } = require('timezone-support/dist/parse-format');
const {google} = require('googleapis');
const privatekey = require('../../serviceacc.json');
const {servers} = require('../../spreadsheet.json')


module.exports = {
	name: 'ckfinish',
	description: 'Calculates the time of CK round finish based on input value and provides check-in method for the team',
	cooldown: 5,
	guildOnly: true,
	execute(message, args) {

		//delete require.cache[require.resolve('../../spreadsheet.json')];

		if(!args.length || args[0] == NaN || args[0] <= 0 || args[0] >= 2359) {
			message.channel.send(`Incorrect argument, please enter a number between 1 and 2359`)
		} else {
			let currServer = message.guild.id;

			if(servers[currServer] == undefined) {
				message.channel.send(`Sorry, have no data for this server`);
			} else {
				const gangSheet = servers[currServer].range;
				const gangsheetid = servers[currServer].spreadsheetid;

				let dateObj = new Date

				let hours = args[0].toString().padStart(4,0).slice(0,2)
				let minutes = args[0].toString().padStart(4,0).slice(2,4)

				let hoursMs = hours * 3600000
				let minutesMs = minutes * 60000

				let totalTime = hoursMs + minutesMs

				const target = dateObj.setTime(Date.now()+totalTime)

				const getTargetTime = function(timezone = 'Etc/UTC') {
					try {
					const myTZ = findTimeZone(timezone);
					const timeFormat = 'HH:mm z';
					const now = target 
				
					let localTime = formatZonedTime(getZonedTime(now, myTZ), timeFormat);
					
						return localTime;
					} catch(error) {
						return "Error";
					}
				}

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

				const timeArray = [];
				const tempArray = [];
				const alphaObj = {};
				const betaObj = {};
				const declineObj = {};

				const filter = (reaction) => {
					if(reaction.emoji.name === "🅰" || reaction.emoji.name === "🅱" || reaction.emoji.name === "❌") {
						return true;
					} 
				}
				
				const sheets = google.sheets('v4');

				sheets.spreadsheets.values.get({
					auth: jwtClient,
					spreadsheetId: gangsheetid,
					range: gangSheet,
					},(err, res) => {
						if (err) return console.log('The API returned an error: ' + err);
						const rows = res.data.values;
						if (rows.length){
							const tz = rows[0].indexOf("Timezone");
							const loc = rows[0].indexOf("Location");

							for(i = 1; i <= rows.length - 1; i++) {
								if(rows[i][0] !== undefined && rows[i][0] !== "" && rows[i][0] !== null){
									let targetTime = getTargetTime(rows[i][tz]);
									let location = rows[i][loc].padEnd(11, " ")
									if (targetTime !== "Error") {
										timeArray.push([location, targetTime])
									}
								}
							}

							timeArray.sort((a, b) => {
								if (a[1] < b[1]) {
									return -1;
								}
								if (a[1] > b[1]) {
									return 1;
								}
									return 0;
							});

							timeArray.forEach((value) => {
								tempArray.push(value[0] + value[1])
							})
							
							let outputArray = [...new Set(tempArray)];

							let startTimes = outputArray.join("\n");

							const finishTimesEmbed = new Discord.MessageEmbed()
							.setColor('AQUA')
							.setTitle('Battle Finish Times')
							.setThumbnail(servers[currServer].gangLogo)
							.addField('Timezone/Localtime:', `\`\`\`${startTimes}\`\`\``, false)
							.setFooter('Who\'s coming?', servers[currServer].gangLogo)

							message.channel.send(finishTimesEmbed)
							.then(embedMessage => {
								embedMessage.react("🅰");
								embedMessage.react("🅱");
								embedMessage.react("❌");

								const collector = embedMessage.createReactionCollector(filter, {dispose: true, time: 86400000});

								collector.on('collect', (reaction, user) => {
									let alphaNames = [];
									let betaNames = [];
									let declineNames = [];

									if(reaction.emoji.name == "🅰") {
										let playerId = user.id;
										
										if(!Object.keys(alphaObj).includes(playerId)) {
											alphaObj[playerId] = 0;
										}
										alphaObj[playerId]++

										for(player of Object.keys(alphaObj)) {
											if(alphaObj[player] > 0) {
												alphaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(betaObj)) {
											if(betaObj[player] > 0) {
												betaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(declineObj)) {
											if(declineObj[player] > 0) {
												declineNames.push(`<@${player}>`)
											}
										}
									}
									if(reaction.emoji.name == "🅱") {
										let playerId = user.id;
										
										if(!Object.keys(betaObj).includes(playerId)) {
											betaObj[playerId] = 0;
										}
										betaObj[playerId]++

										for(player of Object.keys(alphaObj)) {
											if(alphaObj[player] > 0) {
												alphaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(betaObj)) {
											if(betaObj[player] > 0) {
												betaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(declineObj)) {
											if(declineObj[player] > 0) {
												declineNames.push(`<@${player}>`)
											}
										}
									}
									if(reaction.emoji.name == "❌") {
										let playerId = user.id;
										
										if(!Object.keys(declineObj).includes(playerId)) {
											declineObj[playerId] = 0;
										}
										declineObj[playerId]++

										for(player of Object.keys(alphaObj)) {
											if(alphaObj[player] > 0) {
												alphaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(betaObj)) {
											if(betaObj[player] > 0) {
												betaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(declineObj)) {
											if(declineObj[player] > 0) {
												declineNames.push(`<@${player}>`)
											}
										}
									}
									const newEmbed = new Discord.MessageEmbed(finishTimesEmbed).addFields(
										{name: 'Alphas', value: `🅰 ${alphaNames.slice(1).join('\n')}`, inline: true},
										{name: 'Betas', value: `🅱 ${betaNames.slice(1).join('\n')}`, inline: true},
										{name: 'Not online', value: `❌ ${declineNames.slice(1).join('\n')}`, inline: true},
										)
									embedMessage.edit(newEmbed)

								})

								collector.on('remove', (reaction, user) => {
									let alphaNames = [];
									let betaNames = [];
									let declineNames = [];

									if(reaction.emoji.name == "🅰") {
										let playerId = user.id;
										
										if(!Object.keys(alphaObj).includes(playerId)) {
											alphaObj[playerId] = 0;
										}
										alphaObj[playerId]--

										for(player of Object.keys(alphaObj)) {
											if(alphaObj[player] > 0) {
												alphaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(betaObj)) {
											if(betaObj[player] > 0) {
												betaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(declineObj)) {
											if(declineObj[player] > 0) {
												declineNames.push(`<@${player}>`)
											}
										}
									}
									if(reaction.emoji.name == "🅱") {
										let playerId = user.id;
										
										if(!Object.keys(betaObj).includes(playerId)) {
											betaObj[playerId] = 0;
										}
										betaObj[playerId]--

										for(player of Object.keys(alphaObj)) {
											if(alphaObj[player] > 0) {
												alphaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(betaObj)) {
											if(betaObj[player] > 0) {
												betaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(declineObj)) {
											if(declineObj[player] > 0) {
												declineNames.push(`<@${player}>`)
											}
										}
									}
									if(reaction.emoji.name == "❌") {
										let playerId = user.id;
										
										if(!Object.keys(declineObj).includes(playerId)) {
											declineObj[playerId] = 0;
										}
										declineObj[playerId]--

										for(player of Object.keys(alphaObj)) {
											if(alphaObj[player] > 0) {
												alphaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(betaObj)) {
											if(betaObj[player] > 0) {
												betaNames.push(`<@${player}>`)
											}
										}
										for(player of Object.keys(declineObj)) {
											if(declineObj[player] > 0) {
												declineNames.push(`<@${player}>`)
											}
										}
									}
									const newEmbed = new Discord.MessageEmbed(finishTimesEmbed).addFields(
										{name: 'Alphas', value: `🅰 ${alphaNames.slice(1).join('\n')}`, inline: true},
										{name: 'Betas', value: `🅱 ${betaNames.slice(1).join('\n')}`, inline: true},
										{name: 'Not online', value: `❌ ${declineNames.slice(1).join('\n')}`, inline: true},
										)
									embedMessage.edit(newEmbed)
								})
							})
						}
				})
			}
		}
	},
};