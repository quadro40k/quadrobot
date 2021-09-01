# quadrobot

## Introduction

quadrobot is a simple Discord bot that was built for use by several gaming teams, playing CATS (Crash Arena Turbo Stars) game. It has several commands that may be useful for other teams, in same or other games or as a reference for someone trying to set up their own bot with similar functions.

quadrobot is written in JavaScript based on Discord.js.

quadrobot relies on the following to run:

- node.js (v14 or later)
- discord.js (v12, should work just fine with v13 or later but wasn't tested)
- timezone-support npm module
- sequelize npm module

You, obviously, need a discord app set up as described in Discord.js guide (https://discordjs.guide).

## Installation

Copy the folder and file structure to a folder of your choice.

Install node.js, then discord.js and timezone-support.

Edit config.json (this file is not included here, follow Discord.js guide for details) to include your app token and command prefix.

Run the bot using `node index.js` from the folder it's installed in (can also be run in the background using utilities like pm2).

## Overview of Commands

Commands the bot executes are divided into two main categories:
- General - commands not related to any game.
- CATS - commands related to Crash Arena Turbo Stars

### General Commands

- **help** - returns the list of all commands bot responds to or, when used with command name as an argument, help text for specific command.
- **ping** - pings the bot, causes it to reply to the message author (purely for diagnostics, as a quick check the bot is alive).
- **reload** - clears cache and reloads a command from source file. Allows to update commands without restarting the bot.
- **rescan** - similar to reload but instead of reloading one existing command, rescans commands folder and adds all and any new commands.
- **time** - returns UTC time if used with no arguments, takes timezone name as an argument and returns local time then.

### CATS Commands

- **gang** - reads current gang roster for current Discord server from configurable Google sheet and returns it along with role and combined bots strength of each player.
- **gangtime** - returns local time for each of the players in the gang.
- **gangtr** - returns current and average trophy count for each of the players in the gang.
- **updtr** - takes a number as an argument, updates the current trophy count for the whoever used the command if they are present in the team roster.
- **updbot** - takes 3 numeric arguments and updates respective bot's health and damage.
- **tr** - takes a number as an argument (uses 200 if no argument is given) and mentions all players in the gang who are currently below that number of trophies.
- **directions** - takes text and 1 picture as arguments, generates new embed with text in Attack Order field and the picture attached to it. Adds a set of reactions to the embed and then collects those reactions as players hit them, providing bot tracking functionality.
- **logbattle** - adds battle log entry to google sheet. The command only appends the log, any corrections or changes need to be done manually in the sheet.
- **battlestats** - reads the battle log and returns it to the channel. If used without arguments shows general battle stats and last 10 battles. If used with argument, tries to match any part of the agrument to any of the enemy names and returns only matching battles.
- **instant** - calculates the time for instant win given points intake, current points and instant limit.
- **ckfinish** - takes single number as agrument representing hours and minutes left in a round (e.g. 5 hours 10 minutes is 510) then generates new embed with local time for each gang member and reactions that allow check-in for members whether they will be online for battle start or not. 
- **nocheckin** - assigns all gang members 'nocheckin' role (if exists). This command is used by **directions** command.
- **adddir**, **upddir**, **showdir** - creates, updates or shows directions templates.
- **addplayer**, **updplayer**, **delplayer** - adds, updates or removes a player from the gang.


## Main bot code

Main bot code in index.js is almost completely a copy of the reference code in Discord.js guide (https://discordjs.guide). The only alteration to reference code is arguments parser that has been modified to accept multi-word arguments when enclosed in quotes.

The config.json file required in the code is also unaltered version from the guide, containing only prefix definition and bot token. For obvious reasons this config file is not included with the source code.

Only dependencies the main code has is discord.js npm package (if you follow the guide, you'll get it installed as one of the first steps).

If used on its own, main code will get the bot up and able to join servers, with command handler in it but no commands to be used. It'll do essentially nothing.

## Commands code

### General Commands

#### ping, help, reload

Ping, help and reload commands are also unaltered versions of the commands from Discord.js guide. They are very well described there so if really curious, check the guide out. No specific dependencies for these commands.

#### rescan

This command deletes the require cache and then performs rescan of all .js files in ./commands folder, loading up any newly added commands. Without this addition of new commands requires bot restart (which is bad). The command is restricted to be used by admin only, using hard coded discordId (and refusing to execute if author's id doesn't match).

#### time

Time command uses single function getLocalTime to return local time back to the message author. If used without argument, returns UTC time.

Command accepts a timezone as defined in tz database (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) as an argument and returns local time in that timezone.

getLocalTime function is exported from gettime.js script, which in turn requires **timezone-support** npm package to convert current time into desired timezone time. If fed with incorrect timezone argument, throws an error and complains that input is rubbish.

### CATS commands

#### gang, gangtime, gangtr, tr, updtr, updbot, logbattle, battlestats

**section outdated, requires rewrite**

## Usage and feedback

Any of my code from quadrobot is free to use or share, enjoy. If you happen to use it commercially (which I find hard to imagine), put some sort of reference to me in any form you see fit.

Any feedback is welcome. Both in terms of improving the code and new functionality for the bot.
