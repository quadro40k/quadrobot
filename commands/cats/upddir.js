const Sequelize = require('sequelize');

module.exports = {
	name: 'upddir',
	description: 'Updates directions template.',
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
			captain: Sequelize.STRING,
			gangLogo: Sequelize.STRING,
		});

        const server = await Servers.findOne({where: {server: currServer}});

        if(!server) {
			return;
		};

        const authorMem = await message.guild.members.fetch(message.author.id);

		if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return;
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

        const addDirections = Directions.update({
            text: args.slice(1).join(' ')
        }, {
            where: {
                name: args[0].toLowerCase()
            }
        })
        .then(upd => {
            if(upd == 1) {
                message.channel.send(`Template **${args[0].toLowerCase()}** has been updated!`);
            } else {
                message.channel.send(`Template **${args[0].toLowerCase()}** doesn\'t exist, add it before updating.`);
            };
        })
        .catch(error => {
            console.log(error);
            return message.channel.send(`Something went wrong while updating the template.`);
        });
    }
}