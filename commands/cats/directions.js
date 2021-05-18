const fs = require('fs');
const Discord = require('discord.js');
const {servers} = require('../../spreadsheet.json')

module.exports = {
	name: 'directions',
	description: 'Converts directions message into interactive embed with bots tracking',
	cooldown: 5,
    guildOnly: true,
	execute(message, args) {

        //delete require.cache[require.resolve('../../spreadsheet.json')];

        const standardDir = `
        @Alphas
        1️⃣Small Twin, buff +3
        2️⃣Second Twin
        @Betas
        ▶️ Non-Twins, standard order
        ══════════════
        👉  Non-Twins attack order is from Biggest to Smallest, Counter Clockwise 🔄 , Start from upper left
        👉 After all buildings are full, if you're going to be busy or 💤 sleeping, overbuff all buildings evenly, starting with twins and contested buildings.
        ══════════════
        `
        const steamrollDir = `
        ❗STEAMROLL❗
        @Alphas
        1️⃣Twins
        2️⃣Non-twins, reserve
        @Betas
        ▶️ Non-Twins, standard order
        ══════════════
        👉  Non-Twins attack order is from Biggest to Smallest, Counter Clockwise 🔄 , Start from upper left
        👉 After all buildings are full, if you're going to be busy or 💤 sleeping, overbuff all buildings evenly, starting with twins and contested buildings.
        ══════════════
        `
        const notwinsDir = `
        ❗NO TWINS❗
        @Alphas
        @Betas
        ▶️ Non-Twins, standard order
        ══════════════
        👉  Non-Twins attack order is from Biggest to Smallest, Counter Clockwise 🔄 , Start from upper left
        👉 After all buildings are full, if you're going to be busy or 💤 sleeping, overbuff all buildings evenly, starting with twins and contested buildings.
        ══════════════
        `

        if(args.length == 0) {
            args[0] = standardDir;
        }

        if(args.length == 1 && args[0].toLowerCase() == "steamroll") {
            args[0] = steamrollDir;
        }

        if(args.length == 1 && args[0].toLowerCase() == "notwins") {
            args[0] = notwinsDir;
        }

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
                    let landedBots = 0;
                    let deadBots = 0;
                    let landedObj = {};
                    let deadObj = {};
                    let healObj = {};

                    const filter = (reaction) => {
                        if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                            return true;
                        } 
                        if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                            return true;
                        }
                        if(reaction.emoji.name === "💟" || reaction.emoji.name === "💗") {
                            return true;
                        }
            
                    }
                    if(message.attachments.first() !== undefined) {
                        imgUrl = message.attachments.first().url;
                        imgName = imgUrl.match(/\b\/[\w-.]+\.\w\w\w?\w\b/).join().slice(1);
                    } else {
                        imgUrl = 'https://cdn.discordapp.com/attachments/834420252720889886/841580576871677963/directions_filler.png';
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
                            embedMessage.react("💟");
                            embedMessage.react("💗");
                            const collector = embedMessage.createReactionCollector(filter, {dispose: true, time: 86400000});
                            let timerID = 0;
                            collector.on('collect', (reaction, user) => {

                                let landedNames = [];
                                let deadNames = [];

                                if(!user.bot) {
                                    if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                                        landedBots++
                                        let playerId = user.id;
                                        
                                        
                                        if(!Object.keys(landedObj).includes(playerId)) {
                                            landedObj[playerId] = 0;
                                        }

                                        if(!Object.keys(healObj).includes(playerId)) {
                                            healObj[playerId] = 2;
                                        }

                                        landedObj[playerId]++

                                        for(player of Object.keys(landedObj)) {
                                            if(landedObj[player] > 0) {
                                                landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                        for(player of Object.keys(deadObj)) {
                                            if(deadObj[player] > 0) {
                                                deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                    }
                                    if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                                        deadBots++

                                        let playerId = user.id;
                                        
                                        let healReminder = setTimeout(function() {
                                            message.guild.channels.cache.get(servers[currServer].channel).send(`<@${playerId}>: your bot is healed`)
                                        }, 7200000);

                                        timerID = healReminder;

                                        if(!Object.keys(deadObj).includes(playerId)) {
                                            deadObj[playerId] = 0;
                                        }

                                        if(!Object.keys(healObj).includes(playerId)) {
                                            healObj[playerId] = 2;
                                        }

                                        deadObj[playerId]++

                                        for(player of Object.keys(landedObj)) {
                                            if(landedObj[player] > 0) {
                                                landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                        for(player of Object.keys(deadObj)) {
                                            if(deadObj[player] > 0) {
                                                deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }
                                    }

                                    if(reaction.emoji.name === "💟" || reaction.emoji.name === "💗") {

                                        let playerId = user.id;
                                        
                                        if(!Object.keys(healObj).includes(playerId)) {
                                            healObj[playerId] = 2;
                                        }

                                        healObj[playerId]--

                                        for(player of Object.keys(landedObj)) {
                                            if(landedObj[player] > 0) {
                                                landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                        for(player of Object.keys(deadObj)) {
                                            if(deadObj[player] > 0) {
                                                deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }
                                    }

                                }
                                const newEmbed = new Discord.MessageEmbed(directionsEmbed).addFields(
                                    {name: 'Bots', value: `Deployed bots: ${landedBots}\nDead bots: ${deadBots}`, inline: true},
                                    {name: 'Defending:', value: `⚔️\n${landedNames.join('\n')}`, inline: false},
                                    {name: 'Recovering:', value: `🌡️\n${deadNames.join('\n')}`, inline: false},
                                    )
                                embedMessage.edit(newEmbed)
                            })
                            collector.on('remove', (reaction, user) => {
                                let landedNames = [];
                                let deadNames = [];

                                if(!user.bot) {
                                    if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                                        landedBots--

                                        let playerId = user.id;
                                        
                                        if(!Object.keys(landedObj).includes(playerId)) {
                                            landedObj[playerId] = 0;
                                        }
                                        landedObj[playerId]--
                                        

                                        for(player of Object.keys(landedObj)) {
                                            if(landedObj[player] > 0) {
                                                landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                        for(player of Object.keys(deadObj)) {
                                            if(deadObj[player] > 0) {
                                                deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                    }
                                    if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                                        deadBots--

                                        let playerId = user.id;

                                        //clearTimeout(timerID);
                                        
                                        if(!Object.keys(deadObj).includes(playerId)) {
                                            deadObj[playerId] = 0;
                                        }
                                        deadObj[playerId]--
                                        
                                        for(player of Object.keys(landedObj)) {
                                            if(landedObj[player] > 0) {
                                                landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                        for(player of Object.keys(deadObj)) {
                                            if(deadObj[player] > 0) {
                                                deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }
                                    }

                                    if(reaction.emoji.name === "💟" || reaction.emoji.name === "💗") {

                                        let playerId = user.id;
                                        
                                        if(!Object.keys(healObj).includes(playerId)) {
                                            healObj[playerId] = 2;
                                        }

                                        healObj[playerId]++

                                        for(player of Object.keys(landedObj)) {
                                            if(landedObj[player] > 0) {
                                                landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }

                                        for(player of Object.keys(deadObj)) {
                                            if(deadObj[player] > 0) {
                                                deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`)
                                            }
                                        }
                                    }
                                    
                                }
                                const newEmbed = new Discord.MessageEmbed(directionsEmbed).addFields(
                                    {name: 'Bots', value: `Deployed bots: ${landedBots}\nDead bots: ${deadBots}`, inline: true},
                                    {name: 'Defending:', value: `⚔️\n${landedNames.join('\n')}`, inline: false},
                                    {name: 'Recovering:', value: `🌡️\n${deadNames.join('\n')}`, inline: false},
                                    )
                                embedMessage.edit(newEmbed)
                            })
                        }))
                    .catch(console.error)

                  }
            }

    }
}