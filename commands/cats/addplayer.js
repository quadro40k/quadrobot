const Sequelize = require('sequelize');

module.exports = {
	name: 'addplayer',
	description: 'Adds a player. Use !addplayer @mention <in-game-name>. This will also add your gang role to the player you are setting up.',
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
			channel: Sequelize.STRING,
			dirChannel: Sequelize.STRING,
			role: Sequelize.STRING,
			captain: Sequelize.STRING,
			gangLogo: Sequelize.STRING,
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

		if(args.length < 2 || !message.mentions.members.keys().next().value) {
			return message.channel.send('You need to @ mention Discord member and add in-game name.');
		};

		const targetPlayer = message.mentions.members.keys().next().value;
		const target = message.guild.members.cache.get(targetPlayer);
		const playerName = target.displayName;
		const gameName = args[1];
	
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

		const addPlayer = Gang.create({
			name: playerName,
			gamename: gameName,
			discordid: targetPlayer
		})
		.then(upd => {

			const role = message.guild.roles.cache.find(role => role.id == server.role);
			target.roles.add(role)
			.catch(e => console.log(e));
			return message.channel.send(`Player **${gameName}** has been added!`);

		})
		.catch(error => {
			if(error.name === 'SequelizeUniqueConstraintError') {
				return message.channel.send('This player already exists, use !updplayer if you want to update the player.');
			}
			return message.channel.send(`Something went wrong while adding the player.`);
		});
	},
};