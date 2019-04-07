
const fs = require('fs');
var account = JSON.parse(fs.readFileSync('account.json'));

const sockjs = require('sockjs-client-ws');
const client = sockjs.create('http://sim.smogon.com:8000/showdown');
const request = require('request');

var battleData = null;

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
    weather: null,
    turn: 0
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
        console.log(battleData);
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
              }
              battleData.ally.current = parsePokeName(innerParts[2]);
            } else if (id == battleData.enemy.id) {
              battleData.enemy.current = parsePokeName(innerParts[2]);
            }
            break;
          case 'move':
            var id = innerParts[1].substr(0,2);
            if (id == battleData.ally.id) {
              storeAction('move', innerParts[2]);
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
              poke = battleData.ally.pokes.get(battleData.ally.current)
              poke.health = newHealth;
            } else if (id == battleData.enemy.id) {
              poke = battleData.enemy.pokes.get(battleData.enemy.current)
              poke.health = newHealth;
            }
            break;
          case '-boost':
            // update positive stat boost of that pokemon
          case '-unboost':
            // update negative stat boost of that pokemon
            break;
          case '-weather':
            // update weather
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
            battleData.turn += 1;
            break;
        }
      }
      break;
  }
}

function storeAction(type, value) {
  var iterAlly = battleData.ally.pokes.values();
  var iterEnemy = battleData.enemy.pokes.values();
  action = {
    "type" : type,
    "value": value,
    "gameState": {
      "ally": {
        "current": battleData.ally.current,
        "poke1": iterAlly.next().value,
        "poke2": iterAlly.next().value,
        "poke3": iterAlly.next().value,
        "poke4": iterAlly.next().value,
        "poke5": iterAlly.next().value,
        "poke6": iterAlly.next().value
      },
      "enemy": {
        "current": battleData.enemy.current,
        "poke1": iterEnemy.next().value,
        "poke2": iterEnemy.next().value,
        "poke3": iterEnemy.next().value,
        "poke4": iterEnemy.next().value,
        "poke5": iterEnemy.next().value,
        "poke6": iterEnemy.next().value
      },
      "weather": battleData.weather,
      "turn": battleData.turn
    }
  }
  db.insert(action, function(err, newDoc) {
    if(newDoc) console.log("Saved turn " + battleData.turn + " to db");
    else console.log("Error saving to db");
  });
}

function parseTeamPreview(req) {
  var pokemon = req.side.pokemon;
  for (i = 0; i < pokemon.length; i++) {
    var name = parsePokeName(pokemon[i].details);
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
  var name = parsePokeName(entireName);
  var pkmn = new Pokemon(name, null, null, 100.0, null, null, null, null, null, null);
  if (battleData.enemy.pokes == null) {
    var map = new Map();
    map.set(name, pkmn);
    battleData.enemy.pokes = map;
  } else {
    battleData.enemy.pokes.set(name, pkmn);
  }
}

function parsePokeName(nameWithGender) {
  var index = nameWithGender.indexOf(",");
  return ((index == -1) ? nameWithGender : nameWithGender.substr(0, index));
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
