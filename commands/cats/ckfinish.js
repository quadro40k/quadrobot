const Discord = require('discord.js');
const { findTimeZone, getZonedTime } = require('timezone-support');
const { formatZonedTime } = require('timezone-support/dist/parse-format');
const Sequelize = require('sequelize');

module.exports = {
	name: 'ckfinish',
	description: 'Calculates the time of CK round finish based on input value and provides check-in method for the team',
	cooldown: 5,
	guildOnly: true,
	execute: async (message, args) => {

        if(!args.length || args[0] == NaN || args[0] <= 0 || args[0] >= 2359) {
			return message.channel.send(`Incorrect argument, please enter a number between 1 and 2359`);
		};

        const currServer = message.guild.id;
        const currChannel = message.channel.id;

        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './data/servers.sqlite'
        });

        const Servers = sequelize.define('servers', {
            server: Sequelize.STRING,
            gangName: Sequelize.STRING,
            range: Sequelize.STRING,
            channel: Sequelize.STRING,
            dirChannel: Sequelize.STRING,
            role: Sequelize.STRING,
            captain: Sequelize.STRING,
            gangLogo: Sequelize.STRING,
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

        let dateObj = new Date;

        let hours = args[0].toString().padStart(4,0).slice(0,2);
        let minutes = args[0].toString().padStart(4,0).slice(2,4);

        let hoursMs = hours * 3600000;
        let minutesMs = minutes * 60000;

        let totalTime = hoursMs + minutesMs;

        const target = dateObj.setTime(Date.now()+totalTime);

        const getTargetTime = function(timezone = 'Etc/UTC') {
            try {
            const myTZ = findTimeZone(timezone);
            const timeFormat = 'HH:mm z';
            const now = target;
        
            let localTime = formatZonedTime(getZonedTime(now, myTZ), timeFormat);
            
                return localTime;
            } catch(error) {
                return "Error";
            };
        };

        const tempArray = [];
        const alphaObj = {};
        const betaObj = {};
        const declineObj = {};

        const filter = (reaction) => {
            if(reaction.emoji.name === "🅰" || reaction.emoji.name === "🅱" || reaction.emoji.name === "❌") {
                return true;
            };
        };

        const Gang = sequelize.define(server.range, {
            location: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
            timezone: {
                type: Sequelize.STRING,
                defaultValue: 'Etc/UTC'
            },
        }, {
            freezeTableName: true
        });

        const gangObj = await Gang.findAll();

        const timeArray = gangObj.map(member => {
            let loc = member.dataValues.location.padEnd(11, " ");
            let time = getTargetTime(member.dataValues.timezone);
            return [loc, time]
        });

        timeArray.sort((a, b) => {
            if (a[1] < b[1]) {
                return -1;
            };
            if (a[1] > b[1]) {
                return 1;
            };
                return 0;
        });

        timeArray.forEach((value) => {
            if(value[1] !== 'Error') {
                tempArray.push(value[0] + value[1]);
            };
        });

        let outputArray = [...new Set(tempArray)];

        let startTimes = outputArray.join("\n");

        const finishTimesEmbed = new Discord.MessageEmbed()
        .setColor('AQUA')
        .setTitle('Battle Finish Times')
        .setThumbnail(server.gangLogo)
        .addField('Timezone/Localtime:', `\`\`\`${startTimes}\`\`\``, false)
        .setFooter(`${server.gangName}, who\'s coming?`, server.gangLogo)

        message.channel.send(`<@&${server.role}>: check in for the next round!`, finishTimesEmbed)
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
                    };
                    alphaObj[playerId]++;

                    for(player of Object.keys(alphaObj)) {
                        if(alphaObj[player] > 0) {
                            alphaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(betaObj)) {
                        if(betaObj[player] > 0) {
                            betaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(declineObj)) {
                        if(declineObj[player] > 0) {
                            declineNames.push(`<@${player}>`);
                        };
                    };
                };
                if(reaction.emoji.name == "🅱") {
                    let playerId = user.id;
                    
                    if(!Object.keys(betaObj).includes(playerId)) {
                        betaObj[playerId] = 0;
                    };
                    betaObj[playerId]++;

                    for(player of Object.keys(alphaObj)) {
                        if(alphaObj[player] > 0) {
                            alphaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(betaObj)) {
                        if(betaObj[player] > 0) {
                            betaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(declineObj)) {
                        if(declineObj[player] > 0) {
                            declineNames.push(`<@${player}>`);
                        };
                    };
                };
                if(reaction.emoji.name == "❌") {
                    let playerId = user.id;
                    
                    if(!Object.keys(declineObj).includes(playerId)) {
                        declineObj[playerId] = 0;
                    }
                    declineObj[playerId]++;

                    for(player of Object.keys(alphaObj)) {
                        if(alphaObj[player] > 0) {
                            alphaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(betaObj)) {
                        if(betaObj[player] > 0) {
                            betaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(declineObj)) {
                        if(declineObj[player] > 0) {
                            declineNames.push(`<@${player}>`);
                        };
                    };
                };
                const newEmbed = new Discord.MessageEmbed(finishTimesEmbed).addFields(
                    {name: 'Alphas', value: `🅰 ${alphaNames.slice(1).join('\n')}`, inline: true},
                    {name: 'Betas', value: `🅱 ${betaNames.slice(1).join('\n')}`, inline: true},
                    {name: 'Not online', value: `❌ ${declineNames.slice(1).join('\n')}`, inline: true},
                    )
                embedMessage.edit(newEmbed);
            });
            collector.on('remove', (reaction, user) => {
                let alphaNames = [];
                let betaNames = [];
                let declineNames = [];

                if(reaction.emoji.name == "🅰") {
                    let playerId = user.id;
                    
                    if(!Object.keys(alphaObj).includes(playerId)) {
                        alphaObj[playerId] = 0;
                    };
                    alphaObj[playerId]--;

                    for(player of Object.keys(alphaObj)) {
                        if(alphaObj[player] > 0) {
                            alphaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(betaObj)) {
                        if(betaObj[player] > 0) {
                            betaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(declineObj)) {
                        if(declineObj[player] > 0) {
                            declineNames.push(`<@${player}>`);
                        };
                    };
                };
                if(reaction.emoji.name == "🅱") {
                    let playerId = user.id;
                    
                    if(!Object.keys(betaObj).includes(playerId)) {
                        betaObj[playerId] = 0;
                    };
                    betaObj[playerId]--;

                    for(player of Object.keys(alphaObj)) {
                        if(alphaObj[player] > 0) {
                            alphaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(betaObj)) {
                        if(betaObj[player] > 0) {
                            betaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(declineObj)) {
                        if(declineObj[player] > 0) {
                            declineNames.push(`<@${player}>`);
                        };
                    };
                };
                if(reaction.emoji.name == "❌") {
                    let playerId = user.id;
                    
                    if(!Object.keys(declineObj).includes(playerId)) {
                        declineObj[playerId] = 0;
                    };
                    declineObj[playerId]--;

                    for(player of Object.keys(alphaObj)) {
                        if(alphaObj[player] > 0) {
                            alphaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(betaObj)) {
                        if(betaObj[player] > 0) {
                            betaNames.push(`<@${player}>`);
                        };
                    };
                    for(player of Object.keys(declineObj)) {
                        if(declineObj[player] > 0) {
                            declineNames.push(`<@${player}>`);
                        };
                    };
                };
                const newEmbed = new Discord.MessageEmbed(finishTimesEmbed).addFields(
                    {name: 'Alphas', value: `🅰 ${alphaNames.slice(1).join('\n')}`, inline: true},
                    {name: 'Betas', value: `🅱 ${betaNames.slice(1).join('\n')}`, inline: true},
                    {name: 'Not online', value: `❌ ${declineNames.slice(1).join('\n')}`, inline: true},
                    )
                embedMessage.edit(newEmbed);
            });
        });
    }
}