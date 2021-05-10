const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
	name: 'ptg2votes',
	description: 'UNDER CONSTRUCTION',
	cooldown: 5,
    guildOnly: true,
	aliases: ['2voteadd'],
	execute(message, args) {
		
		let imgUrl = "";
        let voteContent = args.join(" ");
		let imgName = "";

		let votes = -1;
		let downvotes = -1;
		const sumVotes = function(a, b) {
			if ((a + b) == 0) {
				return 1;
			} else {
				return a + b;
			}
		}

		const filter = (reaction) => {
			if(reaction.emoji.name === "👍" || reaction.emoji.name === "👎") {
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
			.setTitle('New Poll')
			.setThumbnail('https://cdn.discordapp.com/attachments/711200274638831696/759060114321309736/image0.png')
			.attachFiles([imgUrl])
			.setImage(`attachment://${imgName}`)
			.addField('Poll details:', voteContent, true)
		
		message.delete()
			.then(msg => message.channel.send(votingEmbed)
				.then(embedMessage => {
					embedMessage.react("👍");
					embedMessage.react("👎");
					const collector = embedMessage.createReactionCollector(filter, {dispose: true});
					collector.on('collect', reaction => {
						if(reaction.emoji.name === "👍") {
							votes++
						}
						if(reaction.emoji.name === "👎") {
							downvotes++
						}
					const newEmbed = new Discord.MessageEmbed(votingEmbed).addField('Current votes', `Upvotes: ${votes}, ${Math.round(votes / sumVotes(votes, downvotes) * 100)}%\nDownvotes: ${downvotes}, ${Math.round(downvotes / sumVotes(votes, downvotes) * 100)}%`)
					embedMessage.edit(newEmbed)
					})
					collector.on('remove', reaction => {
						if(reaction.emoji.name === "👍") {
							votes--
						}
						if(reaction.emoji.name === "👎") {
							downvotes--
						}
					const newEmbed = new Discord.MessageEmbed(votingEmbed).addField('Current votes', `Upvotes: ${votes}, ${Math.round(votes / sumVotes(votes, downvotes) * 100)}%\nDownvotes: ${downvotes}, ${Math.round(downvotes / sumVotes(votes, downvotes) * 100)}%`)
					embedMessage.edit(newEmbed)
					})
				}))
			.catch(console.error)
    }
}