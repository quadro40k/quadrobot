const Sequelize = require('sequelize');

module.exports = {
    name: 'updbot',
    description: 'Updates your current bots data. Usage: !updbot <botnumber> <health> <damage>',
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

        let wrongArgs = 0;

        if(!args.length || isNaN(args[0]) || args[0] < 1 || args[0] > 3) {
            wrongArgs++; 
        };

        if(isNaN(args[1]) || args[1] < 1) {
            wrongArgs++; 
        };

        if(isNaN(args[2]) || args[2] < 1) {
            wrongArgs++; 
        };

        if(wrongArgs > 0) {
            return message.channel.send('Ouch, something is wrong with your arguments. Use !updbot <botnumber> <health> <damage>')
        };

        switch(Number(args[0])) {
            case 1: {
                const updBot1 = await Gang.update({
                    bot1health: args[1],
                    bot1damage: args[2]
                }, {
                    where: {
                        discordid: targetPlayer
                    }
                });
                return message.channel.send(`**${player.gamename}'s** bot number 1 is updated! ⚔️`);
            }
            case 2: {
                const updBot2 = await Gang.update({
                    bot2health: args[1],
                    bot2damage: args[2]
                }, {
                    where: {
                        discordid: targetPlayer
                    }
                });
                return message.channel.send(`**${player.gamename}'s** bot number 2 is updated! ⚔️`);
            }
            case 3: {
                const updBot3 = await Gang.update({
                    bot3health: args[1],
                    bot3damage: args[2]
                }, {
                    where: {
                        discordid: targetPlayer
                    }
                });
                return message.channel.send(`**${player.gamename}'s** bot number 3 is updated! ⚔️`);
            }
        }
        return message.channel.send(`It looks like I wasn't able to update anything :confused:`);
    }
}