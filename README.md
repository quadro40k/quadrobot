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
time - returns UTC time if used with no arguments, takes timezone name as an argument and returns local time then.

### CATS Commands

- gang - reads current gang roster for current Discord server from configurable Google sheet and returns it along with role and combined bots strength of each player.
- gangtime - returns local time for each of the players in the gang.
- gangtr - returns current and average trophy count for each of the players in the gang.
- updtr - takes a number as an argument, update the current trophy count for the whoever used the command if they are present in the team roster.
- tr - takes a number as an argument (uses 200 if no argument is given) and mentions all players in the gang who are currently below that number of trophies.

### Forza Commands

- fh4cars - takes up to 4 arguments and then returns list of cars in Forza Horizon 4 matching provided arguments.
- fm7cars - same as above but for Forza Motorsport 7.
- jamie - takes up to 4 arguments and then returns list of tunes for Forza Horizon 4 cars by PTG Jamie matching provided arguments.
- ptg - returns current PTG Team roster.
- ptgpainter - returns painters from PTG Team roster.
- ptgracer - returns racers from PTG Team roster.
- ptgtuner - returns tuners from PTG Team roster.
- ptgphot - returns photographers from PTG Team roster.

