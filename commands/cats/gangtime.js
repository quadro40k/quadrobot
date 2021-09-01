const Sequelize = require('sequelize');
const { getLocalTime } = require('../../scripts/gettime.js');

module.exports = {
	name: 'gangtime',
	description: 'Outputs local time for each gang member',
	cooldown: 5,
    guildOnly: true,
	execute: async (message) => {

        const currServer = message.guild.id;

        const sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: './data/servers.sqlite'
		});

		const Servers = sequelize.define('servers', {
			server: Sequelize.STRING,
			gangName: Sequelize.STRING,
			gangTag: Sequelize.STRING,
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

		await Servers.sync();

		const server = await Servers.findOne({where: {server: currServer}});

		if(!server) {
			return message.channel.send(`Sorry, I have no data for this server.`);
		};

        const Gang = sequelize.define(server.range, {
			name: Sequelize.STRING,
			gamename: {
				type: Sequelize.STRING,
				unique: true,
			},
			prestige: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			role: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
			subrole: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
			location: {
                type: Sequelize.STRING,
                defaultValue: 'none'
            },
			timezone: {
                type: Sequelize.STRING,
                defaultValue: 'Etc/UTC'
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
			trophies: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
			discordid: Sequelize.STRING
		}, {
			freezeTableName: true
		});

		await Gang.sync();

        const gangObj = await Gang.findAll();

        const battleArray = gangObj.map(member => {
            let plName = member.dataValues.gamename;
            let plLocation = member.dataValues.location;
            let plTime = getLocalTime(member.dataValues.timezone).slice(0, 5);;
            
            let plArray = [plName, plTime, plLocation];
            return plArray;
        });

        battleArray.sort((a, b) => {
            if (a[1] < b[1]) {
                return -1;
            }
            if (a[1] > b[1]) {
                return 1;
            }
                return 0;
            });

        const outputArray = [];

        battleArray.forEach(player => {
            outputArray.push(player[0].slice(0, 14).padEnd(15, " ") + player[1].slice(0, 9).padEnd(7, " ") + player[2])
        });

        outputArray.unshift("Name".padEnd(15)  + "Time   " + "Location");
        return message.channel.send(`Gang time for **${server.gangName}**\n\`\`\`${outputArray.join("\n")}\`\`\``);
    }
}