const Sequelize = require('sequelize');

module.exports = {
	name: 'adddir',
	description: 'Adds directions template',
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
			role: Sequelize.STRING,
			captain: Sequelize.STRING,
			gangLogo: Sequelize.STRING,
		});

        const server = await Servers.findOne({where: {server: currServer}});

        if(!server) {
			return message.channel.send(`Sorry, this command cannot be used on this server.`);
		};

        const authorMem = await message.guild.members.fetch(message.author.id);

		if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return message.channel.send(`Sorry, this command is restricted to <@&${server.captain}> role.`);
		};

        if(args.length < 2) {
			return message.channel.send('You need to specifiy the name and the text of directions');
		};

        const Directions = sequelize.define('directions', {
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            text: Sequelize.TEXT
        });

        await Directions.sync();

        const addDirections = Directions.create({
            name: args[0].toLowerCase(),
            text: args.slice(1).join(' ')
        })
        .then(upd => {

            return message.channel.send(`Template **${args[0].toLowerCase()}** has been added!`);

        })
        .catch(error => {
            if(error.name === 'SequelizeUniqueConstraintError') {
                return message.channel.send('This template already exists, use !upddir if your want to update it.')
            }
            return message.channel.send(`Something went wrong while adding the template.`)
        });
    }
}