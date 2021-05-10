const fs = require('fs');
const Discord = require('discord.js');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'directions',
	description: 'Converts directions message into interactive embed with bots tracking',
	cooldown: 5,
    guildOnly: true,
	execute(message, args) {

        let currServer = message.guild.id;
        let currChannel = message.channel.id;
    
        if(servers[currServer] == undefined) {
                message.channel.send(`Sorry, have no data for this server`);
            } else {
                if(servers[currServer].dirChannel !== currChannel) {
                    message.channel.send(`Wrong channel, use this command in <#${servers[currServer].dirChannel}>`);
                  } else {
                    let imgUrl = "";
                    let directionsText = args.join(" ");
                    let imgName = "";
                    let landedBots = -3;
                    let deadBots = -3;
                    let landedObj = {};
                    let deadObj = {};

                    const filter = (reaction) => {
                        if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                            return true;
                        } 
                        if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                            return true;
                        }
            
                    }
                    if(message.attachments.first() !== undefined) {
                        imgUrl = message.attachments.first().url;
                        imgName = imgUrl.match(/\b\/[\w-.]+\.\w\w\w?\w\b/).join().slice(1);
                    } else {
                        imgUrl = servers[currServer].gangLogo;
                        imgName = imgUrl.match(/\b\/[\w-.]+\.\w\w\w?\w\b/).join().slice(1);
                    }
                    
                    const file = new Discord.MessageAttachment(imgUrl);

                    const directionsEmbed = new Discord.MessageEmbed()
                        .setColor('GOLD')
                        .setTitle('Directions')
                        .setThumbnail(servers[currServer].gangLogo)
                        .attachFiles([imgUrl])
                        .setImage(`attachment://${imgName}`)
                        .addField('Attack order', directionsText, true)

                    message.delete()
                    .then(msg => message.channel.send(directionsEmbed)
                        .then(embedMessage => {
                            //embedMessage.react("⚔️");
                            embedMessage.react("1️⃣");
                            embedMessage.react("2️⃣");
                            embedMessage.react("3️⃣");
                            embedMessage.react("💀");
                            embedMessage.react("☠");
                            embedMessage.react("🦴");
                            const collector = embedMessage.createReactionCollector(filter, {dispose: true, time: 86400000});
                            collector.on('collect', (reaction, user) => {

                                let landedNames = [];
                                let deadNames = [];

                                if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                                    landedBots++
                                    let playerId = user.id;
                                    
                                    
                                    if(!Object.keys(landedObj).includes(playerId)) {
                                        landedObj[playerId] = 0;
                                    }
                                    landedObj[playerId]++

                                    for(player of Object.keys(landedObj)) {
                                        if(landedObj[player] > 0) {
                                            landedNames.push(`<@${player}>: ${landedObj[player]}`)
                                        }
                                    }

                                    for(player of Object.keys(deadObj)) {
                                        if(deadObj[player] > 0) {
                                            deadNames.push(`<@${player}>: ${deadObj[player]}`)
                                        }
                                    }

                                }
                                if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                                    deadBots++

                                    let playerId = user.id;
                                    
                                    if(!Object.keys(deadObj).includes(playerId)) {
                                        deadObj[playerId] = 0;
                                    }
                                    deadObj[playerId]++

                                    for(player of Object.keys(landedObj)) {
                                        if(landedObj[player] > 0) {
                                            landedNames.push(`<@${player}>: ${landedObj[player]}`)
                                        }
                                    }

                                    for(player of Object.keys(deadObj)) {
                                        if(deadObj[player] > 0) {
                                            deadNames.push(`<@${player}>: ${deadObj[player]}`)
                                        }
                                    }
                                }
                                console.log(landedNames);
                                console.log(deadNames);
                                const newEmbed = new Discord.MessageEmbed(directionsEmbed).addFields(
                                    {name: 'Bots', value: `Deployed bots: ${landedBots}\nDead bots: ${deadBots}`, inline: true},
                                    {name: 'Defending:', value: `⚔️\n${landedNames.slice(1).join('\n')}`, inline: false},
                                    {name: 'Recovering:', value: `🌡️\n${deadNames.slice(1).join('\n')}`, inline: false},
                                    )
                                embedMessage.edit(newEmbed)
                            })
                            collector.on('remove', (reaction, user) => {
                                let landedNames = [];
                                let deadNames = [];

                                if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                                    landedBots--

                                    let playerId = user.id;
                                    
                                    if(!Object.keys(landedObj).includes(playerId)) {
                                        landedObj[playerId] = 0;
                                    }
                                    landedObj[playerId]--
                                    

                                    for(player of Object.keys(landedObj)) {
                                        if(landedObj[player] > 0) {
                                            landedNames.push(`<@${player}>: ${landedObj[player]}`)
                                        }
                                    }

                                    for(player of Object.keys(deadObj)) {
                                        if(deadObj[player] > 0) {
                                            deadNames.push(`<@${player}>: ${deadObj[player]}`)
                                        }
                                    }

                                }
                                if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                                    deadBots--

                                    let playerId = user.id;
                                    
                                    if(!Object.keys(deadObj).includes(playerId)) {
                                        deadObj[playerId] = 0;
                                    }
                                    deadObj[playerId]--
                                    
                                    for(player of Object.keys(landedObj)) {
                                        if(landedObj[player] > 0) {
                                            landedNames.push(`<@${player}>: ${landedObj[player]}`)
                                        }
                                    }

                                    for(player of Object.keys(deadObj)) {
                                        if(deadObj[player] > 0) {
                                            deadNames.push(`<@${player}>: ${deadObj[player]}`)
                                        }
                                    }
                                }
                                console.log(landedNames);
                                console.log(deadNames);
                                const newEmbed = new Discord.MessageEmbed(directionsEmbed).addFields(
                                    {name: 'Bots', value: `Deployed bots: ${landedBots}\nDead bots: ${deadBots}`, inline: true},
                                    {name: 'Defending:', value: `⚔️\n${landedNames.slice(1).join('\n')}`, inline: false},
                                    {name: 'Recovering:', value: `🌡️\n${deadNames.slice(1).join('\n')}`, inline: false},
                                    )
                                embedMessage.edit(newEmbed)
                            })
                        }))
                    .catch(console.error)

                  }
            }

    }
}