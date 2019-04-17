
const fs = require('fs');
var account = JSON.parse(fs.readFileSync('account.json'));

const sockjs = require('sockjs-client-ws');
const client = sockjs.create('http://sim.smogon.com:8000/showdown');
const request = require('request');

var battleData = null;

var roomId = "";

var dtl = require('./dtl');
var team = require('./team');
var parser = require('./parsing');

function getGameState() {
  var iterAlly = battleData.ally.pokes.values();
  var allyPoke = battleData.ally.pokes.get(battleData.ally.current);
  var enemyPoke = battleData.enemy.pokes.get(battleData.enemy.current);

  var poke1 = iterAlly.next().value;
  var poke2 = iterAlly.next().value;
  var poke3 = iterAlly.next().value;
  var poke4 = iterAlly.next().value;
  var poke5 = iterAlly.next().value;
  var poke6 = iterAlly.next().value;

  action = {
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
      "stealthrock": battleData.enemy.stealthrock,
      "spikes": battleData.enemy.spikes
    }

  }
  return action;
}

function handleData(data) {

  if (data.substr(0,1) === '>') {
    var nlIndex = data.indexOf('\n');
    if (nlIndex < 0) return;
    roomId = data.substr(1,nlIndex-1);
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
          console.log('Sent trn to login');
          client.write('|/utm ' + team.text);
          client.write('|/search lc');
          console.log('searching lc with team\n' + team.text);
        } else {
          console.log("Error logging in");
          process.exit();
        }
      });
      break;
    // reset battle data
    case 'init':
      battleData = parser.createBattleData();
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
            parser.parseEnemyPoke(battleData, newParts[2]);
          }
        }
        console.log(battleData);
      }
      break;
    case 'request':
      if (parts[1] == "") return;
      var req = JSON.parse(parts[1]);
      if (req.teamPreview) {
        parser.parseTeamPreview(battleData, req);
        sendMessage(roomId + '|/choose team 1|' + req.rqid);
      } else if (req.forceSwitch || (req.active && req.active.length > 0)) {
        makeDecision(req);
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
                battleData.turnActions += 1;
              }
              battleData.ally.current = parser.parsePokeName(innerParts[2]);
              battleData.ally.pokes.get(battleData.ally.current).stats = parser.baseStats();
            } else if (id == battleData.enemy.id) {
              battleData.enemy.current = parser.parsePokeName(innerParts[2]);
              
              // hacky solution for cases where the enemy pokemon has multiple forms which change its name
              if (battleData.enemy.pokes.get(battleData.enemy.current) == undefined) {
                var newName = battleData.enemy.current.substr(0, battleData.enemy.current.indexOf("-")+1) + "*";
                battleData.enemy.current = newName;
              }

              battleData.enemy.pokes.get(battleData.enemy.current).stats = parser.baseStats();
            }
            break;
          case 'move':
            var id = innerParts[1].substr(0,2);
            if (id == battleData.ally.id) {
              battleData.turnActions += 1;
            }
            break;
          case 'drag':
            var id = innerParts[1].substr(0,2);
            if (id == battleData.ally.id) {
              battleData.ally.current = parser.parsePokeName(innerParts[2]);
              battleData.ally.pokes.get(battleData.ally.current).stats = parser.baseStats();
            } else if (id == battleData.enemy.id) {
              battleData.enemy.current = parser.parsePokeName(innerParts[2]);
              battleData.enemy.pokes.get(battleData.enemy.current).stats = parser.baseStats();
            }
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
              if (innerParts[2] == "move: Stealth Rock") {
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
            battleData.turnActions = 0;
            battleData.turn += 1;
            break;
        }
      }
      break;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(msg) {
  await sleep(500);
  client.write(msg);
  console.log("sent request to server: " + msg);
}

async function makeDecision(req) {
  await sleep(2000);
  var gamestate = getGameState();
  if (!req.forceSwitch) {
    console.log("using dtl");
    var root = dtl.dtree[battleData.ally.current];
    while(true) {
      if (root.func != null) {
        if (root.func(gamestate)) {
          root = root.left;
        } else {
          root = root.right;
        }
      } else if (root.isFunction) {
        sendMessage(roomId + '|/choose ' + root.action(gamestate) + '|' + req.rqid);
        break;
      } else {
        sendMessage(roomId + '|/choose ' + root.action + '|' + req.rqid);
        break;
      }
    }
  } else {
    sendMessage(roomId + '|/choose ' + dtl.forceSwitch(gamestate) + '|' + req.rqid);
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
