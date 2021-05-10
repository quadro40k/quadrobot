# quadrobot

## Introduction

quadrobot is a simple Discord bot that was built for use by several gaming teams, playing CATS (Crash Arena Turbo Stars) and Forza games. It has several commands that may be useful for other teams, in same or other games or as a reference for someone trying to set up their own bot with similar functions.

quadrobot is written in JavaScript based on Discord.js.

## Overview of Commands

Commands the bot executes are divided into three main categories:
- General - commands not related to any game.
- CATS - commands related to Crash Arena Turbo Stars
- Forza - commands related to Forza and PTG Forza team.

### General Commands

- help - returns the list of all commands bot responds to or, when used with command name as an argument, help text for specific command.
- ping - pings the bot, causes it to reply to the message author (purely for diagnostics, as a quick check the bot is alive).
- reload - clears cache and reloads a command from source file. Allows to update commands without restarting the bot.
- rescan - similar to reload but instead of reloading one existing command, rescans commands folder and adds all and any new commands.
- time - returns UTC time if used with no arguments, takes timezone name as an argument and returns local time then.

### CATS Commands

- gang - reads current gang roster for current Discord server from configurable Google sheet and returns it along with role and combined bots strength of each player.
- gangtime - returns local time for each of the players in the gang.
- gangtr - returns current and average trophy count for each of the players in the gang.
- updtr - takes a number as an argument, updates the current trophy count for the whoever used the command if they are present in the team roster.
- updbot - takes 3 numeric arguments and updates respective bot's health and damage.
- tr - takes a number as an argument (uses 200 if no argument is given) and mentions all players in the gang who are currently below that number of trophies.
- directions - takes text and 1 picture as arguments, generates new embed with text in Attack Order field and the picture attached to it. Adds a set of reactions to the embed and then collects those reactions as players hit them, providing bot tracking functionality.

### Forza Commands

- fh4cars - takes up to 4 arguments and then returns list of cars in Forza Horizon 4 matching provided arguments.
- fm7cars - same as above but for Forza Motorsport 7.
- jamie - takes up to 4 arguments and then returns list of tunes for Forza Horizon 4 cars by PTG Jamie matching provided arguments.
- ptg - returns current PTG Team roster.
- ptgpainter - returns painters from PTG Team roster.
- ptgracer - returns racers from PTG Team roster.
- ptgtuner - returns tuners from PTG Team roster.
- ptgphot - returns photographers from PTG Team roster.
- ptgvoteadd - generates new embed with PTG logo and one picture, sets 👍 reaction to it and then collects reactions to provide voting functionality.

## Main bot code

Main bot code in index.js is almost completely a copy of the reference code in Discord.js guide (https://discordjs.guide). The only alteration to reference code is arguments parser that has been modified to accept multi-word arguments when enclosed in quotes.

The config.json file required in the code is also unaltered version from the guide, containing only prefix definition and bot token. For obvious reasons this config file is not included with the source code.

Only dependencies the main code has is discord.js npm package (if you follow the guide, you'll get it installed as one of the first steps).

If used on its own, main code will get the bot up and able to join servers, with command handler in it but no commands to be used. It'll do essentially nothing.

## Commands code

### General Commands

#### ping, help, reload

Ping, help and reload commands are also unaltered versions of the commands from Discord.js guide. They are very well described there so if really curious, check the guide out. No specific dependencies for these commands.

#### time

Time command uses single function getLocalTime to return local time back to the message author. If used without argument, returns UTC time.

Command accepts a timezone as defined in tz database (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) as an argument and returns local time in that timezone.

getLocalTime function is exported from gettime.js script, which in turn requires **timezone-support** npm package to convert current time into desired timezone time. If fed with incorrect timezone argument, throws an error and complains that input is rubbish.

### CATS commands

All CATS commands rely on **googleapis** npm package to read from a googlesheet.

To authenticate with Google, a service account is used (has to be done from Google Cloud Console) with the key stored in serviceacc.json. Authentication code is very well described in this article: https://isd-soft.com/tech_blog/accessing-google-apis-using-service-account-node-js/ (which is where I copied the code from).

Sheet configuration is defined in spreadsheet.json which defines a single object **servers** as follows:
```
{
    "servers": {
        "<numeric id of gang discord server>": {
            "range": "<named range in google sheet>",
            "channel": "<numeric id of the channel where bot will operate>",
            "spreadsheetid": "<id of googlesheet with data>"}
    } 
}
```
This is done to allow different gangs in the game to use the bot on their servers without having to share same spreadsheet and maintaining confidentiality from each other.

The bot expects the table with following structure in the datasheet:
| Name |	Prestige |	Stage	Role |	Location	| Timezone| 	Health1| 	Damage1| 	Health2| 	Damage2| 	Health3| 	Damage3| 	CurCycle| 	Cycle2| 	Cycle3| 	Cycle4| 	DiscordID|	Filler_do not remove|
| --- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |--- |

The order of columns doesn't matter as long as Name is the first and Filler is the last. If column labels do not match however, the command code will need to be modified as the bot uses column labels to obtain indexes of the column to read from/write to.

Here is an example of this from **gangtime** command:
```
const loc = rows[0].indexOf("Location");
const tz = rows[0].indexOf("Timezone");
```
This is done to avoid hard references to columns positions and allow for inserting additional columns for further use or new commands.

**gangtime** command also relies on getLocalTime function so inherits dependency on **timezone-support** package.

After data is read from the spreadsheet, each command slices and/or pads values into table-like output, feeds it into array and then sends to the discord channel.

If command is used outside of the channel defined in spreadsheet.json, the bot will direct the user to correct channel and won't execute any queries.
If command is used on the server that is not present in spreadsheet.json, the bot will apologize it doesn't have data for this server.

### Forza Commands

Forza-related commands follow the same principle as CATS commands above, in the sense that they rely on googleapis to parse shared spreadsheet and provide the output.

**fh4cars** and **fm7cars** rely on Forza cars database maintained by Manteomax (https://wwww.manteomax.com).

Both take up to 4 arguments as input and try to match each of them to cell values in the spreadsheet. Only details for cars that match ALL arguments are returned. The output is limited to a maximum of 20 results to meet Discord message size limitation and avoid multi-screen spam.

PTG team related commands simply read the team roster spreadsheet and return respective values in a single array, not different to previously described commands.

## Usage and feedback

Any of my code from quadrobot is free to use or share, enjoy. If you happen to use it commercially (which I find hard to imagine), put some sort of reference to me in any form you see fit.

Any feedback is welcome. Both in terms of improving the code and new functionality for the bot.
