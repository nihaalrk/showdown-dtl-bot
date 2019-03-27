
const fs = require('fs');
var account = JSON.parse(fs.readFileSync('account.json'));

const sockjs = require('sockjs-client-ws');
const client = sockjs.create('http://sim.smogon.com:8000/showdown');
const request = require('request');

var battleData = null;

class Pokemon {
	constructor(name, ability, stats, health, move1, move2, move3, move4, item, status) {
		this.name = name;
		this.ability = ability;
		this.stats = stats;
		this.health = health;
		this.move1 = move1;
		this.move2 = move2;
		this.move3 = move3;
		this.move4 = move4;
		this.item = item;
		this.status = status;
	}
}

function createBattleData() {
	var battleData = {
		ally: {
			id: null,
			current: null,
			pokes: null
		},
		enemy: {
			id: null,
			current: null,
			pokes: null
		},
		weather: null
	};
	return battleData;
}

function handleData(data) {

	if (data.substr(0,1) === '>') {
	  var nlIndex = data.indexOf('\n');
		if (nlIndex < 0) return;
		data = data.substr(nlIndex+1);
	}

	var parts;
	if(data.charAt(0) === '|') {
		parts = data.substr(1).split('|');
	} else {
		parts = [];
	}

	switch(parts[0]) {
		// for logging in
		case 'challstr':
			const key_id = parseInt(parts[1], 10);
			const chall_str = parts[2];

			request.post({
				url : 'http://play.pokemonshowdown.com/action.php',
				formData : {
					act: 'login',
					name: account.username,
					pass: account.password,
					challengekeyid: key_id,
					challenge: chall_str
				}
			},
			function (err, response, body) {
				var data = JSON.parse(body.substr(1));
				if(data && data.curuser && data.curuser.loggedin) {
					client.write('|/trn ' + account.username + ',0,' + data.assertion);
					console.log('Sent trn to login')
					//client.write('/search unratedrandombattle')
				} else {
					console.log("Error logging in");
					process.exit();
				}
			});
			break;
		// reset battle data
		case 'init':
			battleData = createBattleData();
			break;
		case 'player':
			// set player ids if not set yet
			if (battleData.ally.id == null) {
				if (parts[2] == account.username) {
					battleData.ally.id = parts[1];
					battleData.enemy.id = (parts[1] == "p1") ? "p2" : "p1";
				} else {
					battleData.enemy.id = parts[1];
					battleData.ally.id = (parts[1] == "p1") ? "p2" : "p1";
				}
			} else {
				// if ids set, parse input for enemy pokemon
				parts = data.split("\n");
				for(i = 0; i < parts.length; i++) {
					if (parts[i].substr(0, 4) == "|pok" && parts[i].substr(0, 8) == "|poke|" + battleData.enemy.id) {
						var newParts = parts[i].substr(1).split("|");
						parseEnemyPoke(newParts[2]);
					}
				}
			}
			break;
		case 'request':
			if (parts[1] == "") return;
			var req = JSON.parse(parts[1]);
			// if request not empty and has teamPreview, parse for ally pokemon
			if (req.teamPreview) {
				parseTeamPreview(req);
			}
			break;
		case 'switch':
			// set the current pokemon for that team
		case 'drag':
			// set the current pokemon for that team
		case '-damage':
			// update health of that pokemon
		case '-heal':
			// update health of that pokemon
		case '-weather':
			// update weather
	}
}

function parseTeamPreview(req) {
	var pokemon = req.side.pokemon;
	for (i = 0; i < pokemon.length; i++) {
		var index = pokemon[i].details.indexOf(",");
		var name = (index == -1) ? pokemon[i].details : pokemon[i].details.substr(0, index);
		var ability = pokemon[i].baseAbility;
		var stats = pokemon[i].stats
		var health = 100.0;
		var move1 = pokemon[i].moves[0];
		var move2 = pokemon[i].moves[1];
		var move3 = pokemon[i].moves[2];
		var move4 = pokemon[i].moves[3];
		var item = pokemon[i].item;
		var status = null;
		var pkmn = new Pokemon(name, ability, stats, health, move1, move2, move3, move4, item, status);
		if (battleData.ally.pokes == null) {
			var map = new Map();
			map.set(name, pkmn);
			battleData.ally.pokes = map;
		} else {
			battleData.ally.pokes.set(name, pkmn);
		}
	}
}

function parseEnemyPoke(entireName) {
	var index = entireName.indexOf(",");
	var name = (index == -1) ? entireName : entireName.substr(0, index);
	var pkmn = new Pokemon(name, null, null, 100.0, null, null, null, null, null, null);
	if (battleData.enemy.pokes == null) {
		var map = new Map();
		map.set(name, pkmn);
		battleData.enemy.pokes = map;
	} else {
		battleData.enemy.pokes.set(name, pkmn);
	}
}

if(client) {
	client.on('connection', function() {
		console.log('Connected to server.');
	});

	client.on('data', function(msg) {
		console.log(msg + "~~~~~");
		handleData(msg);
	});

	client.on('error', function(e) {
		console.log(e);
	});
}
