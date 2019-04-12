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
to the server (such as switching and choosing moves). The only Pokemon with a decision tree right now is Scraggy (and even
that tree is very simple), so it will opt to lead with Scraggy. Only when Scraggy is out will the program use decision tree
learning (you'll see console messages saying "using dtl"). Once Scraggy dies, you might as well exit the battle, because all
decisions after that point will be random.
