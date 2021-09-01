const Sequelize = require('sequelize');

module.exports = {
	name: 'updplayer',
	description: `Updates player data in the database.
Use !updplayer <name or @mention> <one or more fields to update>.
**Important**: there should be no space between field and the value.
**Available fields:**
role: or r:
location: or l:
prestige: or p:
timezone: or t:
subrole: or s:
**Example:** !updplayer quadro role:Alpha p:11 l:Mordor t:Europe/Moscow
If role is updated, the bot will assign respective server role to the player if it exists.
Timezone must conform to the list at https://en.wikipedia.org/wiki/List_of_tz_database_time_zones`,
	cooldown: 5,
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

		const authorMem = await message.guild.members.fetch(message.author.id);

		if(!authorMem.roles.cache.some(role => role.id === server.captain)) {
			return message.channel.send(`Sorry, this command is restricted to <@&${server.captain}> role.`);
		};

        if(args.length < 2) {
			return message.channel.send('You need to @ mention Discord member or use in-game name and specify at least one property to update.');
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

        let target = args[0];
        let lookup = 'gamename';
        let player = undefined;

        if(message.mentions.members.keys().next().value) {
			target = message.mentions.members.keys().next().value;
            lookup = 'discordid';
		};

        if(lookup == 'gamename') {
            player = await Gang.findOne({where: {gamename: target}});
        } else {
            player = await Gang.findOne({where: {discordid: target}});
        };

        if(!player) {
            return message.channel.send(`Sorry, I can\'t find this player.`)
        };

        const toUpdate = player.gamename;

        //let plGamename = '';
        let plPrestige = '';
        let plLocation = '';
        let plTimezone = '';
        let plRole = '';
        let plSubrole = '';
        let updatedFields = [];

        for(i = 1; i <= args.length - 1; i++) {
            /*if(/\bname:[\w+]/i.test(args[i])) {
                plGamename = args[i].slice(5);
            };
            if(/\bn:[\w+]/i.test(args[i])) {
                plGamename = args[i].slice(2);
            };*/
            if(/\bprestige:[\d\d?]/i.test(args[i])) {
                plPrestige = args[i].slice(9);
            };
            if(/\bp:[\d\d?]/i.test(args[i])) {
                plPrestige = args[i].slice(2);
            };
            if(/\blocation:[\w+]/i.test(args[i])) {
                plLocation = args[i].slice(9);
            };
            if(/\bl:[\w+]/i.test(args[i])) {
                plLocation = args[i].slice(2);
            };
            if(/\btimezone:[\w+]/i.test(args[i])) {
                plTimezone = args[i].slice(9);
            };
            if(/\bt:[\w+]/i.test(args[i])) {
                plTimezone = args[i].slice(2);
            };
            if(/\brole:[\w+]/i.test(args[i])) {
                plRole = args[i].slice(5);
            };
            if(/\br:[\w+]/i.test(args[i])) {
                plRole = args[i].slice(2);
            };
            if(/\bsubrole:[\w+]/i.test(args[i])) {
                plSubrole = args[i].slice(8);
            };
            if(/\bs:[\w+]/i.test(args[i])) {
                plSubrole = args[i].slice(2);
            };
        };

        if(plPrestige !== '') {
            const updPrestige = await Gang.update({
                prestige: plPrestige
            }, {
                where: {
                    gamename: toUpdate
                }
            });
            updatedFields.push(`Prestige: ${plPrestige}`);
        };
        if(plLocation !== '') {
            const updLocation = await Gang.update({
                location: plLocation
            }, {
                where: {
                    gamename: toUpdate
                }
            });
            updatedFields.push(`Location: ${plLocation}`);
        };
        if(plTimezone !== '') {
            const updTimezone = await Gang.update({
                timezone: plTimezone
            }, {
                where: {
                    gamename: toUpdate
                }
            });
            updatedFields.push(`Timezone: ${plTimezone}`);
        };
        if(plRole !== '') {
            const updRole = await Gang.update({
                role: plRole
            }, {
                where: {
                    gamename: toUpdate
                }
            });
            updatedFields.push(`Role: ${plRole}`);
            const addRole = message.guild.roles.cache.find(role => role.name.toLowerCase().includes(plRole.toLowerCase()));
            if(addRole) {
                const toAddRole = message.guild.members.cache.get(player.discordid)
                toAddRole.roles.add(addRole)
                .catch(e => console.log(e));
            };
        };
        if(plSubrole !== '') {
            const updSubrole = await Gang.update({
                subrole: plSubrole
            }, {
                where: {
                    gamename: toUpdate
                }
            });
            updatedFields.push(`Subrole: ${plSubrole}`);
        };

        if(!updatedFields.length) {
            return message.channel.send(`Nothing was updated for **${player.gamename}** as none of the arguments were valid.`);
        };

        return message.channel.send(`I have updated the following details for **${player.gamename}**: \`\`\`${updatedFields.join('\n')} \`\`\``);
    }
}