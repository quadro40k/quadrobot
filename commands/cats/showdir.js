const Sequelize = require('sequelize');

module.exports = {
	name: 'showdir',
	description: 'Shows directions template',
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

        const Directions = sequelize.define('directions', {
            name: {
                type: Sequelize.STRING,
                unique: true,
            },
            text: Sequelize.TEXT
        });

        if(!args.length) {
            const dirList = await Directions.findAll({attributes: ['name']});
            const dirString = dirList.map(template => template.name).join(', ') || `I don\'t have any teplates yet`;
            return message.channel.send(`List of directions templates: \n${dirString}`);
        } else {

            const dirTemplate = await Directions.findOne({where: {name: args[0].toLowerCase()}});
            if(!dirTemplate) {
                return message.channel.send(`No template with such name found.`);
            } else {
                return message.channel.send(`Showing template **${dirTemplate.name}**:\n${dirTemplate.text}`);
            };
        };
    }
}