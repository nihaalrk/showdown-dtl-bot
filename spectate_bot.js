
const fs = require('fs');
var account = JSON.parse(fs.readFileSync('account.json'));

const sockjs = require('sockjs-client-ws');
const client = sockjs.create('http://sim.smogon.com:8000/showdown');
const request = require('request');

var battleData = null;
var prevBattleData = null;

// datastore for all moves taken with their game state
var Datastore = require('nedb');
var db = new Datastore({ filename: 'moves.db', autoload: true });

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
    this.types = [];
    setTypes(this);
  }
}
module.exports.Pokemon = Pokemon;

function createBattleData() {
  var battleData = {
    ally: {
      id: null,
      current: null,
      pokes: null,
      stealthrock: false,
      spikes: 0,
      toxicspikes: 0
    },
    enemy: {
      id: null,
      current: null,
      pokes: null,
      stealthrock: false,
      spikes: 0,
      toxicspikes: 0
    },
    weather: null,
    turn: 0,
    turnActions: 0 // to see if this is the first action of the turn
  };
  return battleData;
}
module.exports.createBattleData = createBattleData;

function setTypes(pokemon) {
  var arr = [];
  request('https://pokeapi.co/api/v2/pokemon/' + pokemon.name.toLowerCase().replace(" ","-"), function (error, response, body) {
    if (response.body.substr(0,9) == "Not Found") {
      return;
    }
    var parsed = JSON.parse(response.body);
    for (var i = 0; i < parsed.types.length; i++) {
      arr[i] = parsed.types[i].type.name;
    }
    pokemon.types = arr;
  });
}
module.exports.setTypes = setTypes;

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
            parseEnemyPoke(battleData, newParts[2]);
          }
        }
        console.log(battleData);
      }
      break;
    case 'request':
      if (parts[1] == "") return;
      var req = JSON.parse(parts[1]);
      // if request not empty and has teamPreview, parse for ally pokemon
      if (req.teamPreview) {
        parseTeamPreview(battleData, req);
      }
      break;
    case '\n':
      // info on what happened this turn
      parts = data.split("\n");
      for(i = 0; i < parts.length; i++) {
        innerParts = parts[i].split("|");
        innerParts.splice(0,1); // first one always empty
        switch(innerParts[0]) {
          case 'switch':
            var id = innerParts[1].substr(0,2);
            if (id == battleData.ally.id) {
              // ignoring the starting move for now
              if (battleData.turn > 0) {
                storeAction('switch', parsePokeName(innerParts[2]));
                battleData.turnActions += 1;
              }
              battleData.ally.current = parsePokeName(innerParts[2]);
              battleData.ally.pokes.get(battleData.ally.current).stats = baseStats();
            } else if (id == battleData.enemy.id) {
              battleData.enemy.current = parsePokeName(innerParts[2]);
              battleData.enemy.pokes.get(battleData.enemy.current).stats = baseStats();
            }
            break;
          case 'move':
            var id = innerParts[1].substr(0,2);
            if (id == battleData.ally.id) {
              storeAction('move', innerParts[2]);
              battleData.turnActions += 1;
            }
            break;
          case 'drag':
            // set the current pokemon for that team
            break;
          case '-damage':
            // same as heal
          case '-heal':
            var id = innerParts[1].substr(0,2);

            var index = innerParts[2].indexOf("/");
            var newHealth = parseFloat(innerParts[2].substr(0, index));
            var poke = null;

            if (id == battleData.ally.id) {
              poke = battleData.ally.pokes.get(battleData.ally.current);
              poke.health = newHealth;
            } else if (id == battleData.enemy.id) {
              poke = battleData.enemy.pokes.get(battleData.enemy.current);
              poke.health = newHealth;
            }
            break;
          case '-boost':
            var id = innerParts[1].substr(0,2);
            var poke = null;

            if (id == battleData.ally.id) {
              poke = battleData.ally.pokes.get(battleData.ally.current);
            } else if (id == battleData.enemy.id) {
              poke = battleData.enemy.pokes.get(battleData.enemy.current)
            }

            poke.stats[innerParts[2]] += parseInt(innerParts[3]);
            break;
          case '-unboost':
            var id = innerParts[1].substr(0,2);
            var poke = null;

            if (id == battleData.ally.id) {
              poke = battleData.ally.pokes.get(battleData.ally.current);
            } else if (id == battleData.enemy.id) {
              poke = battleData.enemy.pokes.get(battleData.enemy.current)
            }

            poke.stats[innerParts[2]] -= parseInt(innerParts[3]);
            break;
          case '-weather':
            // update weather
            break;
          case '-sidestart':
            var id = innerParts[1].substr(0,2);

            if (id == battleData.enemy.id) {
              if (innerParts[2] == "Stealth Rock") {
                battleData.enemy.stealthrock = true;
              } else if (innerParts[2] == "Spikes") {
                battleData.enemy.spikes += 1;
              } else if (innerParts[2] == "Toxic Spikes") {
                battleData.enemy.toxicspikes += 1;
              } 
            }
            break;
          case 'faint':
            var id = innerParts[1].substr(0,2);

            if (id == battleData.ally.id) {
              poke = battleData.ally.pokes.get(battleData.ally.current)
              poke.health = -1;
            } else if (id == battleData.enemy.id) {
              poke = battleData.enemy.pokes.get(battleData.enemy.current)
              poke.health = -1;
            }
            break;
          case 'turn':
            prevBattleData = battleData;
            battleData.turnActions = 0;
            battleData.turn += 1;
            break;
        }
      }
      break;
  }
}

// use previous battle data because we want game state before the turn
function storeAction(type, value) {
  var iterAlly = prevBattleData.ally.pokes.values();
  var allyPoke = prevBattleData.ally.pokes.get(prevBattleData.ally.current);
  var enemyPoke = prevBattleData.enemy.pokes.get(prevBattleData.enemy.current);

  var poke1 = iterAlly.next().value;
  var poke2 = iterAlly.next().value;
  var poke3 = iterAlly.next().value;
  var poke4 = iterAlly.next().value;
  var poke5 = iterAlly.next().value;
  var poke6 = iterAlly.next().value;
  action = {
    "turn" : (battleData.turnActions > 0) ? "middle" : "start",
    "type" : type,
    "value": value,
    "gameState": {
      "ally": {
        "current": {
          "name": allyPoke.name,
          "health": allyPoke.health,
          "stats": allyPoke.stats,
          "types": allyPoke.types,
          "status": allyPoke.status
        },
        "poke1": {"name": poke1.name, "health": poke1.health, "status": poke1.status},
        "poke2": {"name": poke2.name, "health": poke2.health, "status": poke2.status},
        "poke3": {"name": poke3.name, "health": poke3.health, "status": poke3.status},
        "poke4": {"name": poke4.name, "health": poke4.health, "status": poke4.status},
        "poke5": {"name": poke5.name, "health": poke5.health, "status": poke5.status},
        "poke6": {"name": poke6.name, "health": poke6.health, "status": poke6.status},
      },
      "enemy": {
        "name": enemyPoke.name,
        "health": enemyPoke.health,
        "stats": enemyPoke.stats,
        "types": enemyPoke.types,
        "status": enemyPoke.status,
        "stealthrock": prevBattleData.enemy.stealthrock,
        "spikes": prevBattleData.enemy.spikes
      },
      "weather": prevBattleData.weather,
      "turn": prevBattleData.turn
    }
  }
  db.insert(action, function(err, newDoc) {
    if(newDoc) console.log("Saved turn " + prevBattleData.turn + " to db");
    else console.log("Error saving to db\n" + err);
  });
}

function parseTeamPreview(battleData, req) {
  var pokemon = req.side.pokemon;
  for (i = 0; i < pokemon.length; i++) {
    var name = parsePokeName(pokemon[i].details);
    var ability = pokemon[i].baseAbility;
    // used to show stat boosts, we don't care about actual values
    var stats = baseStats();
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

function parseEnemyPoke(battleData, entireName) {
  var name = parsePokeName(entireName);
  var pkmn = new Pokemon(name, null, baseStats(), 100.0, null, null, null, null, null, null);
  if (battleData.enemy.pokes == null) {
    var map = new Map();
    map.set(name, pkmn);
    battleData.enemy.pokes = map;
  } else {
    battleData.enemy.pokes.set(name, pkmn);
  }
}

function baseStats() {
  return { atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
}

function parsePokeName(nameWithGender) {
  var index = nameWithGender.indexOf(",");
  return ((index == -1) ? nameWithGender : nameWithGender.substr(0, index));
}

module.exports.parseTeamPreview = parseTeamPreview;
module.exports.parseEnemyPoke = parseEnemyPoke;
module.exports.baseStats = baseStats;
module.exports.parsePokeName = parsePokeName;

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