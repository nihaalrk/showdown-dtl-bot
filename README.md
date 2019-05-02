# Pokemon Showdown DTL Bot
A bot for battling on Pokemon Showdown that uses Decision Tree Learning

## How it works
There are two parts to the AI - the spectating bot and the battling bot. The spectating bot is used to watch and record 
human gameplay so that it can learn what actions to take in various scenarios. To reduce complexity, it is trained to
work with one specific team. Once the spectating bot has acquired enough data, this data can be turned into a decision
tree for the battling bot to use when it battles.

## Usage
If you want to watch the bot take actions, login to the Pokemon Showdown server (play.pokemonshowdown.com) with the credentials 
in the account.json file, and then use the command `node battle_bot.js`. If done correctly, you will soon see the screen
change as you are sent into a battle.
Currently everything is preloaded to work - once this command is run, the bot will login to the specified account, and
automatically search for a battle with the team it has been trained on. Once in battle, it will automatically send actions
to the server (such as switching and choosing moves). Each Pokemon on the team has their own decision tree that determines what
move to make based on the current game state. Generally you can just run the command and watch the AI complete battles on its own,
but occassionally it has trouble selecting a valid move (most commonly when the opponent disables some of our moves), and you may 
have to choose a random move for it to get the battle to progress.
