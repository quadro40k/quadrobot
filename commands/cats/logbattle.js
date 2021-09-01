const Sequelize = require('sequelize');

module.exports = {
	name: 'logbattle',
	description: 'Logs battle results into spreadsheet. Usage: !logbattle <Enemy_Name> [Win/Loss] [Instant: Yes/No]',
    cooldown: 5,
	guildOnly: true,
	execute: async (message, args) => {

        if(args.length == 0) {
			return message.channel.send('You need to specify the enemy and result')
		};

        if(args[1] == undefined) {
			args[1] = 'Win'
		};

		if(args[2] == undefined) {
			args[2] = 'No'
		};

		let result = "";
		let instant = "";
		let enemy = "";

        args.forEach(arg => {
			if(arg.toLowerCase() == "win" || arg.toLowerCase() == "loss") {
				result = arg;
			} else {
				if(arg.toLowerCase() == "yes" || arg.toLowerCase() == "no") {
					instant = arg;
				} else {
					enemy = arg;
				}
			}
		});

        let imgUrl = '';

        let currServer = message.guild.id;

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

        if(!server || server.logRange == undefined) {
            return message.channel.send(`Sorry, I have no data for this server`);
        };

        if(message.attachments.first()) {
			imgUrl = message.attachments.first().url;
		} else {
            imgUrl = server.gangLogo;
        };

        const authorMem = await message.guild.members.fetch(message.author.id);

		if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return message.channel.send(`Sorry, this command is restricted to <@&${server.captain}> role.`);
		};

        const today = new Date().toISOString().slice(0,10);

        const GangLog = sequelize.define(server.logRange, {
            date: Sequelize.STRING,
            gangName: Sequelize.STRING,
            enemyName: Sequelize.STRING,
            battleResult: Sequelize.STRING,
            instantWin: Sequelize.STRING,
            image: {
                type: Sequelize.STRING,
                defaultValue: server.gangLogo
            },
        }, {
            freezeTableName: true
        });

        await GangLog.sync();

        const logBattle = GangLog.create({
            date: today,
            gangName: server.gangTag,
            enemyName: enemy,
            battleResult: result,
            instantWin: instant,
            image: imgUrl,
        });

        const Battles = sequelize.define('battles', {
            date: Sequelize.STRING,
            gangName: Sequelize.STRING,
            enemyName: Sequelize.STRING,
            battleResult: Sequelize.STRING,
            instantWin: Sequelize.STRING
            
        });

        await Battles.sync();

        const addBattle = Battles.create({
            date: today,
            gangName: server.gangTag,
            enemyName: enemy,
            battleResult: result,
            instantWin: instant,
        });

        return message.channel.send(`Thanks, your battle data has been logged! :crossed_swords:`);
    }
}