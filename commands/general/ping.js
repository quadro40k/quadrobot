module.exports = {
	name: 'ping',
	description: 'Pings the bot. Doesn\'t ping other players',
	cooldown: 5,
	execute(message) {
		message.reply('ping yourself bro');
	},
};