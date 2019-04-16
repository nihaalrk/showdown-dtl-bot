// All of the shared functionality for parsing teams and Pokemon between the two bots

const request = require('request');

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

module.exports.Pokemon = Pokemon;
module.exports.createBattleData = createBattleData;
module.exports.setTypes = setTypes;
module.exports.parseTeamPreview = parseTeamPreview;
module.exports.parseEnemyPoke = parseEnemyPoke;
module.exports.baseStats = baseStats;
module.exports.parsePokeName = parsePokeName;