const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'rescan',
	description: 'Restricted command, do not use',
	cooldown: 5,
	guildOnly: false,
	execute(message) {

		if(message.author.id !== '547360365386661888') {
			message.reply('This is a restricted command, you are not authorized')
		} else {

		const commandFolders = fs.readdirSync('./commands');

		delete require.cache;

		try {
			for (const folder of commandFolders) {
				const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
				for (const file of commandFiles) {
					const newCommand = require(`../../commands/${folder}/${file}`);
					message.client.commands.set(newCommand.name, newCommand);
				}
			}
			message.channel.send(`All commands reloaded`);
		}
		catch(error) {
			console.log(error);
			message.channel.send(`Error:` + error);
		}
		}
	},
};