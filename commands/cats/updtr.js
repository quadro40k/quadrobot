const Sequelize = require('sequelize');

module.exports = {
    name: 'updtr',
    description: 'Updates your current trophies. Usage: !updtr <number>',
    cooldown: 5,
    guildOnly: true,
    execute: async (message, args) => {

        const currServer = message.guild.id;

		const sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: './data/servers.sqlite'
		});

		const Servers = sequelize.define('servers', {
			server: Sequelize.STRING,
			gangName: Sequelize.STRING,
			gangTag: Sequelize.STRING,
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

		await Servers.sync();

		const server = await Servers.findOne({where: {server: currServer}});

		if(!server) {
			return message.channel.send(`Sorry, I have no data for this server.`);
		};

        let targetPlayer = message.author.id;

        if(message.mentions.members.keys().next().value) {
            const authorMem = await message.guild.members.fetch(targetPlayer);
            if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
                return message.channel.send(`Sorry, you need to have <@&${server.captain}> role to update other players.`);
            };
			targetPlayer = message.mentions.members.keys().next().value;
            args = args.slice(1);
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

		await Gang.sync();

        const player = await Gang.findOne({where: {discordid: targetPlayer}});

        if(!player) {
            return message.channel.send(`Sorry, I cannot find this player.`);
        };

        if(!args.length || isNaN(args[0]) || args[0] < 0) {
            return message.channel.send('Mate, you need to specify a valid number after !updtr');
        };

        let responseText = `**${player.gamename}'s** trophy count is updated! :thumbsup:`;

        if(args[0] >= 825) {
            responseText = `Oh my! That's a lot of 🏆! Great job! I updated **${player.gamename}'s** record btw.`;
        };
        const updTrophy = await Gang.update({
            trophies: args[0]
        }, {
            where: {
                discordid: targetPlayer
            }
        });
        return message.channel.send(responseText);
    }
}