const Discord = require('discord.js');
const {Sequelize, Op} = require('sequelize');

module.exports = {
	name: 'fight',
	description: 'Pits two players against each other for no apparent reason',
	cooldown: 5,
	guildOnly: true,
	execute: async (message) => {

        const currServer = message.guild.id;
        const targetPlayer = message.author.id;

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

        const Gang = sequelize.define(server.range, {
			name: Sequelize.STRING,
			gamename: {
				type: Sequelize.STRING,
				unique: true,
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
			discordid: Sequelize.STRING
		}, {
			freezeTableName: true
		});

        const player = await Gang.findOne({where: {discordid: targetPlayer}});

        if(!player) {
            return message.channel.send(`Sorry, you don't seem to belong to ${server.gangName} :confused:`);
        };

        const playerName = player.gamename;
        const playerBotH1 = Math.round(player.bot1health / 1000);
        const playerBotD1 = Math.round(player.bot1damage / 1000);
        const playerBotH2 = Math.round(player.bot2health / 1000);
        const playerBotD2 = Math.round(player.bot2damage / 1000);
        const playerBotH3 = Math.round(player.bot3health / 1000);
        const playerBotD3 = Math.round(player.bot3damage / 1000);

        const enemyObj = await Gang.findAll({where: {discordid: {[Op.ne]: targetPlayer}}});

        const enemyList = enemyObj.map(enemy => {
            let enName = enemy.dataValues.name;
            let ebot1h = Math.round(enemy.dataValues.bot1health / 1000);
            let ebot1d = Math.round(enemy.dataValues.bot1damage / 1000);
            let ebot2h = Math.round(enemy.dataValues.bot2health / 1000);
            let ebot2d = Math.round(enemy.dataValues.bot2damage / 1000);
            let ebot3h = Math.round(enemy.dataValues.bot3health / 1000);
            let ebot3d = Math.round(enemy.dataValues.bot3damage / 1000);

            return [enName, ebot1h, ebot1d, ebot2h, ebot2d, ebot3h, ebot3d];
        });

        const enemy = enemyList[Math.round(Math.random() * (enemyList.length - 1))];

        const enemyName = enemy[0].slice(0, 15);
        const enemyBotH1 = enemy[1];
        const enemyBotH2 = enemy[3];
        const enemyBotH3 = enemy[5];
        const enemyBotD1 = enemy[2];
        const enemyBotD2 = enemy[4];
        const enemyBotD3 = enemy[6];

        const playerBonus = Math.round(Math.random()*20)
        const enemyBonus = Math.round(Math.random()*20)

        let playerPoints = 0;
        let enemyPoints = 0;
        let round1 = ''
        let round2 = ''
        let round3 = ''
        let fightResult = ''

        //Round 1
        if((playerBotH1+playerBotD1)* (1+playerBonus/100) >= (enemyBotH1+enemyBotD1)* (1+enemyBonus/100)) {
            playerPoints++;
            round1 = `**${playerName}** Wins!`;
        } else {
            enemyPoints++;
            round1 = `**${enemyName}** Wins!`;
        };
        //Round 2
        if((playerBotH2+playerBotD2)* (1+playerBonus/100) >= (enemyBotH2+enemyBotD2)* (1+enemyBonus/100)) {
            playerPoints++;
            round2 = `**${playerName}** Wins!`;
        } else {
            enemyPoints++;
            round2 = `**${enemyName}** Wins!`;
        };
        //Round 3
        if((playerBotH3+playerBotD3)* (1+playerBonus/100) >= (enemyBotH3+enemyBotD3)* (1+enemyBonus/100)) {
            playerPoints++;
            round3 = `**${playerName}** Wins!`;
        } else {
            enemyPoints++;
            round3 = `**${enemyName}** Wins!`;
        };

        if(playerPoints > enemyPoints) {
            fightResult = `Winner is **${playerName}**`;
        } else {
            fightResult = `Winner is **${enemyName}**`;
        };

        const fightEmbed = new Discord.MessageEmbed()
        .setColor('RANDOM')
        .setThumbnail(server.gangLogo)
        .setTitle(`Fight: ${playerName} ⚔️ ${enemyName}`)
        .setDescription(`${playerName} Bonus: ${playerBonus}%\n${enemyName} Bonus: ${enemyBonus}%`)

        message.channel.send(fightEmbed)
        .then(embed => {
            const round1Embed = new Discord.MessageEmbed(fightEmbed).addField('Round 1:', `${playerBotH1}k/${playerBotD1}k + ${playerBonus}% 💥 ${enemyBotH1}k/${enemyBotD1}k + ${enemyBonus}%: ${round1}`, false);
            setTimeout(function(){
                embed.edit(round1Embed)
            }, 2000);
            const round2Embed = new Discord.MessageEmbed(round1Embed).addField('Round 2:', `${playerBotH2}k/${playerBotD2}k + ${playerBonus}% 💥 ${enemyBotH2}k/${enemyBotD2}k + ${enemyBonus}%: ${round2}`, false);
            setTimeout(function(){
                embed.edit(round2Embed)
            }, 3000);
            const round3Embed = new Discord.MessageEmbed(round2Embed).addField('Round 3:', `${playerBotH3}k/${playerBotD3}k + ${playerBonus}% 💥 ${enemyBotH3}k/${enemyBotD3}k + ${enemyBonus}%: ${round3}`, false);
            setTimeout(function(){
                embed.edit(round3Embed)
            }, 4000);
            const resultEmbed = new Discord.MessageEmbed(round3Embed).addField('Fight result:', `${fightResult}`, false);
            setTimeout(function(){
                embed.edit(resultEmbed)
            }, 4500);
        });
    }
}