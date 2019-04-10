var teamData = require("./team");


const superEffectiveness = [
	[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 0.0, 1.0, 1.0, 0.5, 1.0 ],
	[ 1.0, 0.5, 0.5, 1.0, 2.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 0.5, 1.0, 0.5, 1.0, 2.0, 1.0 ],
	[ 1.0, 2.0, 0.5, 1.0, 0.5, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.5, 1.0, 1.0, 1.0 ],
	[ 1.0, 1.0, 2.0, 0.5, 0.5, 1.0, 1.0, 1.0, 0.0, 2.0, 1.0, 1.0, 1.0, 1.0, 0.5, 1.0, 1.0, 1.0 ],
	[ 1.0, 0.5, 2.0, 1.0, 0.5, 1.0, 1.0, 0.5, 2.0, 0.5, 1.0, 0.5, 2.0, 1.0, 0.5, 1.0, 0.5, 1.0 ],
	[ 1.0, 0.5, 0.5, 1.0, 2.0, 0.5, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.5, 1.0 ],
	[ 2.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.5, 1.0, 0.5, 0.5, 0.5, 2.0, 0.0, 1.0, 2.0, 2.0, 0.5 ],
	[ 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 1.0, 0.5, 0.5, 1.0, 1.0, 0.0, 2.0 ],
	[ 1.0, 2.0, 1.0, 2.0, 0.5, 1.0, 1.0, 2.0, 1.0, 0.0, 1.0, 0.5, 2.0, 1.0, 1.0, 1.0, 2.0, 1.0 ],
	[ 1.0, 1.0, 1.0, 0.5, 2.0, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 2.0, 0.5, 1.0, 1.0, 1.0, 0.5, 1.0 ],
	[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 1.0, 1.0, 0.5, 1.0, 1.0, 1.0, 1.0, 0.0, 0.5, 1.0 ],
	[ 1.0, 0.5, 1.0, 1.0, 2.0, 1.0, 0.5, 0.5, 1.0, 0.5, 2.0, 1.0, 1.0, 0.5, 1.0, 2.0, 0.5, 0.5 ],
	[ 1.0, 2.0, 1.0, 1.0, 1.0, 2.0, 0.5, 1.0, 0.5, 2.0, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 0.5, 1.0 ],
	[ 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 2.0, 1.0, 0.5, 1.0, 1.0 ],
	[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 0.5, 0.0 ],
	[ 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 2.0, 1.0, 0.5, 1.0, 0.5 ],
	[ 1.0, 0.5, 0.5, 0.5, 1.0, 2.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 1.0, 1.0, 1.0, 0.5, 2.0 ],
	[ 1.0, 0.5, 1.0, 1.0, 1.0, 1.0, 2.0, 0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2.0, 2.0, 0.5, 1.0 ]];

const types = [
  "normal",   "fire",   "water",  "electric", "grass",   "ice",
  "fighting", "poison", "ground", "flying",   "psychic", "bug",
  "rock",     "ghost",  "dragon", "dark",     "steel",   "fairy"
];

function haveSuperEffectiveMove(gameState) {
	var ally = gameState.ally.current.name;
	var enemyTypes = gameState.enemy.types;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		var move = teamData[ally].moves[j].type;
		var effectiveness = 1.0;
		for (var i = 0; i < enemyTypes.length; i++) {
			effectiveness *= superEffectiveness[types.indexOf(move)][types.indexOf(enemyTypes[i])];
		}
		if (effectiveness > 1.0) {
			return true;
		}
	}
	return false;
}

function haveEffectiveStabMove(gameState) {
	var ally = gameState.ally.current.name;
	var enemyTypes = gameState.enemy.types;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].stab) {
			var move = teamData[ally].moves[j].type;
			var effectiveness = 1.0;
			for (var i = 0; i < enemyTypes.length; i++) {
				effectiveness *= superEffectiveness[types.indexOf(move)][types.indexOf(enemyTypes[i])];
			}
			if (effectiveness >= 1.0) {
				return true;
			}
		}
	}
	return false;
}

function haveBoostingMove(gameState) {
	var ally = gameState.ally.current.name;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].boost) {
			return true;
		}
	}
	return false;
}

module.exports.possibleDecisions = [
	haveSuperEffectiveMove,
	haveEffectiveStabMove,
	haveBoostingMove
]




