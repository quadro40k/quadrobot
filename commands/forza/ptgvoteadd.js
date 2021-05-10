const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'ptgvoteadd',
	description: 'Creates a single option vote with content of your message. Will collect 👍 and update vote count. Will take up to one picture and embed it into the vote',
	cooldown: 5,
    guildOnly: true,
	aliases: ['voteadd'],
	execute(message, args) {
		
		let imgUrl = "";
        let voteContent = args.join(" ");
		let imgName = "";

		let votes = -1;

		const filter = (reaction) => {
			if(reaction.emoji.name === "👍") {
				return true;
			} 
		}

		if(message.attachments.first() !== undefined) {
			imgUrl = message.attachments.first().url;
			imgName = imgUrl.match(/\/[\w-]+\.\w\w\w?\w\b/).join().slice(1);
		} else {
			imgUrl = 'https://cdn.discordapp.com/attachments/711200274638831696/759060114321309736/image0.png';
			imgName = imgUrl.match(/\/[\w-]+\.\w\w\w?\w\b/).join().slice(1);
		}

		const file = new Discord.MessageAttachment(imgUrl);

		const votingEmbed = new Discord.MessageEmbed()
			.setColor('#ed872d')
			.setTitle('Voting entry')
			.setThumbnail('https://cdn.discordapp.com/attachments/711200274638831696/759060114321309736/image0.png')
			.attachFiles([imgUrl])
			.setImage(`attachment://${imgName}`)
			.addField('Entry details:', voteContent, true)
		
		message.delete()
			.then(msg => message.channel.send(votingEmbed)
				.then(embedMessage => {
					embedMessage.react("👍");
					const collector = embedMessage.createReactionCollector(filter, {dispose: true});
					collector.on('collect', reaction => {
						if(reaction.emoji.name === "👍") {
							votes++
						}
					const newEmbed = new Discord.MessageEmbed(votingEmbed).addField('Votes', `Current votes: ${votes}\nPlease vote using 👍 reaction under this message`)
					embedMessage.edit(newEmbed)
					})
					collector.on('remove', reaction => {
						if(reaction.emoji.name === "👍") {
							votes--
						}
					const newEmbed = new Discord.MessageEmbed(votingEmbed).addField('Votes', `Current votes: ${votes}\nPlease vote using 👍 reaction under this message`)
					embedMessage.edit(newEmbed)
					})
				}))
			.catch(console.error)
    }
}