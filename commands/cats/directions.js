const Discord = require('discord.js');
const Sequelize = require('sequelize');

module.exports = {
	name: 'directions',
	description: 'Converts directions message into interactive embed with bots tracking',
	cooldown: 5,
    guildOnly: true,
	execute: async (message, args) => {

        const nocheckin = message.client.commands.get('nocheckin');
		nocheckin.execute(message);

        let directionsText = "\u200b";

        const currServer = message.guild.id;
        const currChannel = message.channel.id;

        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './data/servers.sqlite'
        });

        const Directions = sequelize.define('directions', {
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            text: Sequelize.TEXT
        });

        await Directions.sync();

        if(!args.length) {
            args[0] = 'steamroll';
        };

        const dirTemplate = await Directions.findOne({where: {name: args[0].toLowerCase()}});

        if(dirTemplate == null) {
            directionsText = args.join(" ");
        } else {
            directionsText = dirTemplate.text;
        };

        const Servers = sequelize.define('servers', {
            server: Sequelize.STRING,
            gangName: Sequelize.STRING,
            range: Sequelize.STRING,
            logRange: Sequelize.STRING,
            channel: Sequelize.STRING,
            dirChannel: Sequelize.STRING,
            spreadsheetid: Sequelize.STRING,
            role: Sequelize.STRING,
            captain: Sequelize.STRING,
            dmEnabled: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            gangLogo: Sequelize.STRING,
            redBanner: Sequelize.STRING
        });

        const server = await Servers.findOne({where: {server: currServer}});

        if(!server) {
            return message.channel.send(`Sorry, have no data for this server`);
        };

        if(server.dirChannel !== currChannel) {
            return message.channel.send(`Wrong channel, use this command in <#${server.dirChannel}>`);
        };

        const authorMem = await message.guild.members.fetch(message.author.id);

		if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return message.channel.send(`Sorry, this command is restricted to <@&${server.captain}> role.`);
		};

        const Gang = sequelize.define(server.range, {
            name: Sequelize.STRING,
            gamename: {
                type: Sequelize.STRING,
                unique: true,
            },
            prestige: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            role: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
            subrole: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
            location: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
            timezone: {
                type: Sequelize.STRING,
                defaultValue: 'Etc/UTC'
            },
            bot1health: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            bot1damage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            bot2health: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            bot2damage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            bot3health: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            bot3damage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            trophies: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            discordid: Sequelize.STRING
        }, {
            freezeTableName: true
        });

        let imgUrl = "";
        let imgName = "";
        let landedBots = 0;
        let deadBots = 0;
        let landedObj = {};
        let deadObj = {};
        let healObj = {};
        let battleResult = 'Undetermined';

        const filter = (reaction) => {
            if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                return true;
            };
            if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                return true;
            };
            if(reaction.emoji.name === "💟" || reaction.emoji.name === "💗") {
                return true;
            };
            if(reaction.emoji.name === "✅" || reaction.emoji.name === "❌" || reaction.emoji.name === "📋") {
                return true;
            };
        };

        if(message.attachments.first() !== undefined) {
            imgUrl = message.attachments.first().url;
            imgName = imgUrl.match(/\b\/[\w-.]+\.\w\w\w?\w\b/).join().slice(1);
        } else {
            imgUrl = 'https://cdn.discordapp.com/attachments/834420252720889886/841580576871677963/directions_filler.png';
            imgName = imgUrl.match(/\b\/[\w-.]+\.\w\w\w?\w\b/).join().slice(1);
        };

        const directionsEmbed = new Discord.MessageEmbed()
            .setColor('GOLD')
            .setTitle(`${server.gangName} Directions`)
            .setThumbnail(server.gangLogo)
            .attachFiles([imgUrl])
            .setImage(`attachment://${imgName}`)
            .addField('Attack order', directionsText, true)
            .setTimestamp()
            .setFooter(`directions posted by ${message.author.username}`)

        const embedImage = directionsEmbed.files[0];
        
        message.delete()
        .then(msg => message.channel.send(`<@&${server.role}>: New round!`, directionsEmbed)
            .then(embedMessage => {
                embedMessage.react("1️⃣");
                embedMessage.react("2️⃣");
                embedMessage.react("3️⃣");
                embedMessage.react("💀");
                embedMessage.react("☠");
                embedMessage.react("🦴");
                embedMessage.react("💟");
                embedMessage.react("💗");

                const collector = embedMessage.createReactionCollector(filter, {dispose: true, time: 86400000});

                collector.on('collect', async (reaction, user) => {
                    let landedNames = [];
                    let deadNames = [];

                    if(!user.bot) {
                        const role = message.guild.roles.cache.find(role => role.name == 'nocheckin');
                        
                        message.guild.members.fetch(user.id)
                        .then(member => member.roles.remove(role))
                        .catch(error => console.log(error));

                        if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                            landedBots++;
                            let playerId = user.id;
                            
                            if(!Object.keys(landedObj).includes(playerId)) {
                                landedObj[playerId] = 0;
                            };

                            if(!Object.keys(healObj).includes(playerId)) {
                                healObj[playerId] = 2;
                            };

                            landedObj[playerId]++;

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };

                        if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                            deadBots++;

                            let playerId = user.id;
                            
                            let healReminder = setTimeout(function() {
                                message.guild.channels.cache.get(server.channel).send(`<@${playerId}>: your bot is healed`)
                            }, 7200000);

                            timerID = healReminder;

                            if(!Object.keys(deadObj).includes(playerId)) {
                                deadObj[playerId] = 0;
                            };

                            if(!Object.keys(healObj).includes(playerId)) {
                                healObj[playerId] = 2;
                            };

                            deadObj[playerId]++;

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };

                        if(reaction.emoji.name === "💟" || reaction.emoji.name === "💗") {

                            let playerId = user.id;
                            
                            if(!Object.keys(healObj).includes(playerId)) {
                                healObj[playerId] = 2;
                            };

                            healObj[playerId]--;

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                        if(reaction.emoji.name === '✅') {
                            message.guild.members.fetch(user.id)
                            .then(member => {
                                if(member.roles.cache.some(role => role.id === server.captain)){
                                    battleResult = 'Win';
                                    collector.stop();
                                };
                            });
                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                        if(reaction.emoji.name === '❌') {
                            message.guild.members.fetch(user.id)
                            .then(member => {
                                if(member.roles.cache.some(role => role.id === server.captain)){
                                    battleResult = 'Loss';
                                    collector.stop();
                                };
                            });

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                        if(reaction.emoji.name === '📋') {

                            let allReactPlayers = Object.keys(landedObj).concat(Object.keys(deadObj));
                            let checkedInPlayers = [...new Set(allReactPlayers)];
                            let reserveArray = [];

                            const resObj = await Gang.findAll();

                            const resList = resObj.map(member => {
                                let plName = member.dataValues.gamename;
                                let plDiscord = member.dataValues.discordid;
                                let plRole = member.dataValues.role;

                                return [plName, plDiscord, plRole];
                            });

                            for(i = 0; i <= resList.length - 1; i++) {
                                if(checkedInPlayers.includes(resList[i][1])){
                                    let botL = 0;
                                    let botD = 0;
                                    if(landedObj[resList[i][1]]) {
                                        botL = landedObj[resList[i][1]];
                                    };
                                    if(deadObj[resList[i][1]]) {
                                        botD = deadObj[resList[i][1]];
                                    };
                                    let botnum = 3 - (botL + botD);
                                    if(botnum > 0) {
                                        reserveArray.push(`${resList[i][0].slice(0,15).padEnd(15," ")} ${resList[i][2].slice(0,5).padEnd(5," ")} ${botnum}`);
                                    };
                                } else {
                                    reserveArray.push(`${resList[i][0].slice(0,15).padEnd(15," ")} ${resList[i][2].slice(0,5).padEnd(5," ")} 3`);
                                };
                            };

                            message.guild.channels.cache.get(server.channel).send(`Available/Reserved bots:\n\`\`\`${reserveArray.join('\n')}\`\`\` `);

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                    };
                    const newEmbed = new Discord.MessageEmbed(directionsEmbed).addFields(
                        {name: 'Bots', value: `Deployed bots: ${landedBots}\nDead bots: ${deadBots}`, inline: true},
                        {name: 'Defending:', value: `⚔️\n${landedNames.join('\n')}`, inline: false},
                        {name: 'Recovering:', value: `🌡️\n${deadNames.join('\n')}`, inline: false},
                    );
                    embedMessage.edit(newEmbed);
                });

                collector.on('remove', (reaction, user) => {
                    let landedNames = [];
                    let deadNames = [];

                    if(!user.bot) {
                        if(reaction.emoji.name === "1️⃣" || reaction.emoji.name === "2️⃣" || reaction.emoji.name === "3️⃣") {
                            landedBots--;

                            let playerId = user.id;
                            
                            if(!Object.keys(landedObj).includes(playerId)) {
                                landedObj[playerId] = 0;
                            };
                            landedObj[playerId]--;
                            

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                        };
                        if(reaction.emoji.name === "💀" || reaction.emoji.name === "☠" || reaction.emoji.name === "🦴") {
                            deadBots--;

                            let playerId = user.id;
                            
                            if(!Object.keys(deadObj).includes(playerId)) {
                                deadObj[playerId] = 0;
                            };
                            deadObj[playerId]--;
                            
                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };

                        if(reaction.emoji.name === "💟" || reaction.emoji.name === "💗") {

                            let playerId = user.id;
                            
                            if(!Object.keys(healObj).includes(playerId)) {
                                healObj[playerId] = 2;
                            };

                            healObj[playerId]++;

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                        if(reaction.emoji.name === "✅" || reaction.emoji.name === "❌") {

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                        if(reaction.emoji.name === '📋') {

                            for(player of Object.keys(landedObj)) {
                                if(landedObj[player] > 0) {
                                    landedNames.push(`<@${player}>: ${landedObj[player]}, heals: ${healObj[player]}`);
                                };
                            };

                            for(player of Object.keys(deadObj)) {
                                if(deadObj[player] > 0) {
                                    deadNames.push(`<@${player}>: ${deadObj[player]}, heals: ${healObj[player]}`);
                                };
                            };
                        };
                        
                    };
                    const newEmbed = new Discord.MessageEmbed(directionsEmbed).addFields(
                        {name: 'Bots', value: `Deployed bots: ${landedBots}\nDead bots: ${deadBots}`, inline: true},
                        {name: 'Defending:', value: `⚔️\n${landedNames.join('\n')}`, inline: false},
                        {name: 'Recovering:', value: `🌡️\n${deadNames.join('\n')}`, inline: false},
                    );
                    embedMessage.edit(newEmbed);
                });
                collector.on('end', async collected => {
                    let allPlayers = Object.keys(landedObj).concat(Object.keys(deadObj));
                    let checkedIn = [...new Set(allPlayers)];
                    let checkedInNames = [];
                    let notCheckedIn = [];
            
                    const gangObj = await Gang.findAll();

                    const gangList = gangObj.map(member => {
                        let plName = member.dataValues.gamename;
                        let plDiscord = member.dataValues.discordid;
                        let plRole = member.dataValues.role;
                        
                        let plArray = [plName, plDiscord, plRole];
                        return plArray;
                    });

                    for(i = 0; i <= gangList.length - 1; i++) {
                        if(checkedIn.includes(gangList[i][1])){
                            checkedInNames.push(gangList[i][0]);
                        } else {
                            notCheckedIn.push(gangList[i][0]);
                        };
                    };

                    const battleReport = `
**Latest battle Report**
__Checked in players__:
\`\`\`\u200b
${checkedInNames.join('\n')}
\`\`\`
__Not checked in players__:
\`\`\`\u200b
${notCheckedIn.join('\n')}
\`\`\`
Battle result: **${battleResult}**
                    `;

                    return message.guild.channels.cache.get(server.channel).send(battleReport, {files:[embedImage]});
                });
            })
        )
    }
}