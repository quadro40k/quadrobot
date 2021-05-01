const { getLocalTime } = require('../../scripts/gettime.js');

module.exports = {
	name: 'time',
	description: 'Get local time for Timezone. If used without timezone, returns UTC. Timzones list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones',
	cooldown: 5,
	execute(message, args) {
        if(args.length == 0) {args = "Etc/UTC"};
		message.reply(`Time is: ${getLocalTime(args)}`);
	},
};