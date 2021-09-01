const {Sequelize, Op} = require('sequelize');
const Discord = require('discord.js');

module.exports = {
	name: 'red',
	description: 'Calls CODE RED and DMs all players in given role (alpha if no role provided)',
    cooldown: 5,
    guildOnly: true,
	execute: async (message, args) => {

        let currServer = message.guild.id;

        const sequelize = new Sequelize({
            dialect: 'sqlite',
            storage: './data/servers.sqlite'
          });
      
        const Servers = sequelize.define('servers', {
        server: Sequelize.STRING,
        gangName: Sequelize.STRING,
        range: Sequelize.STRING,
        logRange: Sequelize.STRING,
        channel: Sequelize.STRING,
        dirChannel: Sequelize.STRING,
        spreadsheetid: Sequelize.STRING,
        role: Sequelize.STRING,
        captain: Sequelize.STRING,
        dmEnabled: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
        },
        gangLogo: Sequelize.STRING,
        redBanner: Sequelize.STRING
        });

        const server = await Servers.findOne({where: {server: currServer}});

        if(!server || !server.dmEnabled) {
			return message.channel.send(`Sorry, this command is not allowed on this server`);
		};

        const authorMem = await message.guild.members.fetch(message.author.id);

        if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return message.channel.send(`Sorry, this command is restricted to <@&${server.captain}> role.`);
		};

        if(!args.length) {
            args[0] = `%`;
        };

        const Gang = sequelize.define(server.range, {
			name: Sequelize.STRING,
			gamename: {
				type: Sequelize.STRING,
				unique: true,
			},
			role: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
            discordid: Sequelize.STRING,
		}, {
			freezeTableName: true
		});

        const roleObj = await Gang.findAll({where: {role: {[Op.substring]: args[0]}}});

        const sortArray = roleObj.map(player => {
            return player.dataValues.discordid;
        })

        if(!sortArray.length) {
            return message.channel.send(`Nobody found with role that includes **${args[0]}**.`);
        };

        const alerter = authorMem.displayName;

        const imgUrl = server.redBanner;
        const imgName = imgUrl.match(/\b\/[\w-.]+\.\w\w\w?\w\b/).join().slice(1);

        const file = new Discord.MessageAttachment(imgUrl);

        const redEmbed = new Discord.MessageEmbed()
        .setColor('RED')
        .setTitle(`Code RED called by ${alerter}`)
        .setThumbnail(server.gangLogo)
        .attachFiles([imgUrl])
        .setImage(`attachment://${imgName}`)
        .addField('ALERT', '**Code RED Activated!** Report with free bots!', false)

        sortArray.forEach(player => {
            message.client.users.fetch(player)
            .then(target => {
                target.send(redEmbed)
                .catch(e => console.log(e));
            });
        });

        let recepient = args[0];

        if(args[0] == '%') {
            recepient = server.gangName;
        };

        return message.channel.send(`Code RED Alert sent to all **${recepient}**`);
    }
}