
module.exports = {
	name: 'instant',
	description: 'Calculates time until instant win. Usage: !instant <points gain> <current points> <instant limit>.\nIf instant limit is omitted, 140000 is used as default.',
	cooldown: 5,
	guildOnly: false,
	execute(message, args) {

		let errors = 0;

		if(args.length < 2) {
			message.channel.send('Not enough arguments, please use !help instant for details');
		} else {

			if(!args[2] || args[2] == 0) {
				args[2] = 140000
			}
		
			args.forEach(argument => {
				if(isNaN(argument) || argument == 0) {
					errors++
				} 
			});

			if(errors > 0) {
				message.channel.send('You messed up some arguments, try using !help instant')
			} else {
				let minutesTotal = Math.ceil((args[2] - args[1])/args[0]);
				let hours = Math.floor(minutesTotal/60);
				let minutes = minutesTotal - (hours * 60);
				if(Number(args[1]) >= Number(args[2])) {
					message.channel.send(`Looks like you already won! 🏆`)
				} else {
					message.channel.send(`\`\`\`Instant win in ${hours} hours, ${minutes} minutes ⌛\`\`\``);
				}
			}
		}
	},
};