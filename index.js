const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');


//scan ./commands folder for all .js files, each representing a command for a bot
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

// log Ready! message to confirm bot is loaded and operational
client.once('ready', () => {
	console.log('Ready!');
});

// parse channel messages for commands. ignore anything that's not a command or is sent by bot itself
// message contents after command are split into arguments that are passed to the command
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const inputArray = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = inputArray.shift().toLowerCase();
	const argsString = inputArray.join(" ");
	let longArgs = argsString.match(/\"[\w ]+\"/g);
	if (longArgs == null) {
		longArgs = "";
	} else {
		longArgs = longArgs.join("").split(/\"/);
	};
	const noLongs = argsString.split(/\"[\w ]+\"/);
	const shortArgs = noLongs.join(" ").split(/[ ]+/);
	const args = shortArgs.concat(longArgs);

	function cleanUpArgs(array, elem) {
		var index = array.indexOf(elem);
		while (index > -1) {
			array.splice(index, 1);
			index = array.indexOf(elem);
		}
	};
	cleanUpArgs(args, "");

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply('You can not do this!');
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);