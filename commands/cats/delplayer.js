const Sequelize = require('sequelize');

module.exports = {
	name: 'delplayer',
	description: 'Deletes player data from the database. Usage: !delplayer <@mention or name>.',
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

		const authorMem = await message.guild.members.fetch(message.author.id);

		if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return message.channel.send(`Sorry, this command is restricted to <@&${server.captain}> role.`);
		};

        if(!args.length) {
			return message.channel.send('You need to @ mention Discord member or use in-game name to remove the player.');
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

		let target = args[0];
        let lookup = 'gamename';
        let player = undefined;

        if(message.mentions.members.keys().next().value) {
			target = message.mentions.members.keys().next().value;
            lookup = 'discordid';
		};

        if(lookup == 'gamename') {
            player = await Gang.findOne({where: {gamename: target}});
        } else {
            player = await Gang.findOne({where: {discordid: target}});
        };

        if(!player) {
            return message.channel.send(`Sorry, I can\'t find this player.`)
        };

		const toDelete = player.gamename;
		const toRemoveRole = await message.guild.members.fetch(player.discordid);

		const delplayer = await Gang.destroy({
			where: {
				gamename: toDelete
			}
		})
		.catch(error => {
			console.log(error)
			return message.channel.send(`Something went wrong while trying to delete the player.`)
		});

		const gangRole = message.guild.roles.cache.find(role => role.id == server.role);
		toRemoveRole.roles.remove(gangRole)
		.catch(e => console.log(e));

		return message.channel.send(`Player **${toDelete}** has been removed. \nI really hope you knew what you were doing...`);
	}
}