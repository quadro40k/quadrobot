const {Sequelize, Op} = require('sequelize');

module.exports = {
	name: 'battlestats',
	description: 'Shows gang\'s battle stats and last 10 battles details.',
	cooldown: 5,
    aliases: ['gangstats'],
	guildOnly: true,
	execute: async (message, args) => {

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
			role: Sequelize.STRING,
			captain: Sequelize.STRING,
			gangLogo: Sequelize.STRING,
		});

        const server = await Servers.findOne({where: {server: currServer}});

        if(!server || !server.logRange) {
			return message.channel.send(`Sorry, I have no data for this server.`);
		};

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

        const outputArray = [];

        let wins = 0;
        let losses = 0;

        let battlesObj = [];

        if(!args.length) {

            battlesObj = await GangLog.findAll({
                limit: 10,
                where: {},
                order: [['createdAt', 'DESC']]
            });

            battlesObj.reverse();

        } else {

            const searchString = args.join(' ');

            battlesObj = await GangLog.findAll({where: {enemyName: {[Op.substring]: searchString}}});
        };

        const sortArray = battlesObj.map(battle => {
            let batDate = battle.dataValues.date.slice(5,10).padEnd(6," ");
            let enemyName = battle.dataValues.enemyName.slice(0, 15).padEnd(15, " ");
            let batResult = battle.dataValues.battleResult;
            let batIns = battle.dataValues.instantWin.padEnd(4, " ");
            if(batResult.toLowerCase() == "win") {
                wins++;
            };
            if(batResult.toLowerCase() == "loss") {
                losses++;
            };
            return [batDate, enemyName, batResult, batIns];
        });
        
        if(!sortArray.length) {
            return message.channel.send(`No battle data found for given parameters.`)
        };

        if(!args.length) {
            wins = await GangLog.count({where: {battleResult: {[Op.substring]: 'win'}}});
            losses = await GangLog.count({where: {battleResult: {[Op.substring]: 'loss'}}});
        };

        for(i = 0; i <= sortArray.length - 1; i++) {
            outputArray.push(`${sortArray[i][0]}${sortArray[i][1]}${sortArray[i][2].padEnd(5, " ")}${sortArray[i][3]}`);
        };
        outputArray.unshift("Date".padEnd(6, " ")  + "Enemy".padEnd(15, " ") + "Win? " + "Inst");
        outputArray.unshift(`Showing last ${sortArray.length} battles:`);
        outputArray.unshift(`Total: ${wins+losses}, Wins: ${wins}, Losses: ${losses}, Ratio: ${Math.round(wins/(wins+losses)*100)}%`);
        return message.channel.send(`\`\`\`${outputArray.join("\n")}\`\`\``);
    }
}