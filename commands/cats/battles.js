const {Sequelize, Op} = require('sequelize');

module.exports = {
	name: 'battles',
	description: 'Shows battle stats and last 10 battles details across all participating gangs.',
	cooldown: 5,
	guildOnly: true,
	execute: async (message, args) => {
        
        const currServer = message.guild.id;

        const sequelize = new Sequelize({
			dialect: 'sqlite',
			storage: './data/servers.sqlite'
		});

        const Battles = sequelize.define('battles', {
            date: Sequelize.STRING,
            gangName: Sequelize.STRING,
            enemyName: Sequelize.STRING,
            battleResult: Sequelize.STRING,
            instantWin: Sequelize.STRING
            
        });

        let battlesObj = [];

        if(!args.length) {

            battlesObj = await Battles.findAll({
                limit: 10,
                where: {},
                order: [['createdAt', 'DESC']]
            });

            battlesObj.reverse();

        } else {

            const searchString = args.join(' ');

            battlesObj = await Battles.findAll({where: {enemyName: {[Op.substring]: searchString}}});
        };

        const battleArray = battlesObj.map(battle => {
            let tempDate = battle.dataValues.date.slice(5,10).padEnd(6," ")
            let tempGang = battle.dataValues.gangName.slice(0, 5).padEnd(5, " ");
            let tempEnemy = battle.dataValues.enemyName.slice(0, 15).padEnd(16, " ");
            let tempResult = battle.dataValues.battleResult.slice(0, 1).padEnd(2, " ")
            let tempInst = battle.dataValues.instantWin.slice(0, 1)

            let battleString = tempDate + tempGang + tempEnemy + tempResult + tempInst; 

            return battleString
        });

        battleArray.unshift("Date".padEnd(6, " ") + "Gang".padEnd(5, " ") + "Enemy".padEnd(16, " ") + "R " + "I");

        if(!args.length) {
            return message.channel.send(`Showing last 10 battles:\n\`\`\`${battleArray.join('\n')}\`\`\``);
        };
        return message.channel.send(`Showing battles matching **${args.join(' ')}**\n\`\`\`${battleArray.join('\n')}\`\`\``);
    }
}