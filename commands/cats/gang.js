const Sequelize = require('sequelize');

module.exports = {
	name: 'gang',
	description: 'Outputs current gang roster',
	cooldown: 5,
    guildOnly: true,
	execute: async (message) => {

        const currServer = message.guild.id;
        const currChannel = message.channel.id;

        const sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: './data/servers.sqlite'
		});

		const Servers = sequelize.define('servers', {
			server: Sequelize.STRING,
			gangName: Sequelize.STRING,
			gangTag: Sequelize.STRING,
			range: Sequelize.STRING,
			channel: Sequelize.STRING,
			dirChannel: Sequelize.STRING,
			role: Sequelize.STRING,
			captain: Sequelize.STRING,
			gangLogo: Sequelize.STRING,
		});

		await Servers.sync();

		const server = await Servers.findOne({where: {server: currServer}});

		if(!server) {
			return message.channel.send(`Sorry, I have no data for this server.`);
		};

        if(server.channel !== currChannel) {
            return message.channel.send(`Wrong channel, use this command in <#${server.channel}>`);
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
			bot1health: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			bot1damage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			bot2health: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			bot2damage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			bot3health: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			bot3damage: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
		}, {
			freezeTableName: true
		});

        const gangObj = await Gang.findAll();

        const battleArray = gangObj.map(member => {
            let plName = member.dataValues.gamename;
            let plRole = member.dataValues.role;
            let bot1 = Math.round(member.dataValues.bot1health / 1000) + Math.round(member.dataValues.bot1damage / 1000);
            let bot2 = Math.round(member.dataValues.bot2health / 1000) + Math.round(member.dataValues.bot2damage / 1000);
            let bot3 = Math.round(member.dataValues.bot3health / 1000) + Math.round(member.dataValues.bot3damage / 1000);
            let plBot = bot1 + bot2 + bot3;
            
            let plArray = [plName, plRole, plBot];
            return plArray;
        });

        battleArray.sort((a, b) => {
            return b[2] - a[2];
        });

        const outputArray = [];

        battleArray.forEach(player => {
            outputArray.push(player[0].slice(0, 14).padEnd(15, " ") + player[1].slice(0, 9).padEnd(7, " ") + player[2])
        });

        outputArray.unshift("Name".padEnd(15)  + "Role   " + "Bots");
        return message.channel.send(`Gang roster for **${server.gangName}**\n\`\`\`${outputArray.join("\n")}\`\`\``);
    }
}