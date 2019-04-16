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
		if (!teamData[ally].moves.attack) {
			continue;
		}
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

// selects move with highest effectiveness
function useSuperEffectiveMove(gameState) {
	var ally = gameState.ally.current.name;
	var enemyTypes = gameState.enemy.types;
	var highestEffectiveness = 1.0;
	var bestMove = "";
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (!teamData[ally].moves.attack) {
			continue;
		}
		var move = teamData[ally].moves[j].type;
		var effectiveness = 1.0;
		for (var i = 0; i < enemyTypes.length; i++) {
			effectiveness *= superEffectiveness[types.indexOf(move)][types.indexOf(enemyTypes[i])];
		}
		if (effectiveness > highestEffectiveness) {
			highestEffectiveness = effectiveness;
			bestMove = teamData[ally].moves[j].name;
		}
	}
	return "move " + bestMove;
}

function haveEffectiveStabMove(gameState) {
	var ally = gameState.ally.current.name;
	var enemyTypes = gameState.enemy.types;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].stab && teamData[ally].moves[j].attack) {
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

// selects stab move with highest effectiveness
function useEffectiveStabMove(gameState) {
	var ally = gameState.ally.current.name;
	var enemyTypes = gameState.enemy.types;
	var highestEffectiveness = 1.0;
	var bestMove = "";
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].stab && teamData[ally].moves[j].attack) {
			var move = teamData[ally].moves[j].type;
			var effectiveness = 1.0;
			for (var i = 0; i < enemyTypes.length; i++) {
				effectiveness *= superEffectiveness[types.indexOf(move)][types.indexOf(enemyTypes[i])];
			}
			if (effectiveness > highestEffectiveness) {
				highestEffectiveness = effectiveness;
				bestMove = teamData[ally].moves[j].name;
			}
		}
	}
	return "move " + bestMove;
}

function haveBoostingMoveAndNotBoosted(gameState) {
	var ally = gameState.ally.current.name;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].boost) {
			return gameState.ally.current.stats.atk <= 0 && gameState.ally.current.stats.spa <= 0;
		}
	}
	return false;
}

function useBoostingMove(gameState) {
	var ally = gameState.ally.current.name;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].boost) {
			return "move " + teamData[ally].moves[j].name;
		}
	}
	return "";
}

function haveUsableHazardsMove(gameState) {
	var ally = gameState.ally.current.name;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].hazard && canUseHazardsMove(teamData[ally].moves[j].name, gameState)) {
			return true;
		}
	}
	return false;
}

function useUsableHazardsMove(gameState) {
	var ally = gameState.ally.current.name;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (teamData[ally].moves[j].hazard && canUseHazardsMove(teamData[ally].moves[j].name, gameState)) {
			return "move " + teamData[ally].moves[j].name;
		}
	}
	return "";
}

function canUseHazardsMove(move, gameState) {
	if (move == "stealthrock") {
		return !gameState.enemy.stealthrock;
	} else if (move == "spikes") {
		return gameState.enemy.spikes < 3;
	} else {
		return gameState.enemy.toxicspikes < 2;
	}
}

function belowHalfHealth(gameState) {
	return gameState.ally.current.health < 50;
}

function below30Percent(gameState) {
	return gameState.ally.current.health < 30;
}

// whenever switching, find the best ally with this formula
function switchToBestAlly(gameState) {
	var bestVal = 0;
	var bestSwitch = "";
	var enemyTypes = gameState.enemy.types;
	for (var i = 1; i < 6; i++) {
		var curr = gameState.ally["poke" + i];
		// only consider if alive and not the current pokemon
		if (curr.name != gameState.ally.current.name && curr.health > 0) {
			// first calculate effectiveness of our best move on them
			var highestEffectiveness = 0;
			var allyTypes = teamData[curr.name].types;
			for (var j = 0; j < teamData[curr.name].moves.length; j++) {
				if (!teamData[curr.name].moves.attack) {
					continue;
				}
				var move = teamData[curr.name].moves[j].type;
				var effectiveness = 1.0;
				for (var k = 0; k < enemyTypes.length; k++) {
					effectiveness *= superEffectiveness[types.indexOf(move)][types.indexOf(enemyTypes[k])];
				}
				if (effectiveness > highestEffectiveness) {
					highestEffectiveness = effectiveness;
				}
			}
			// then calculate effectiveness of their best type on us
			var theirEffectiveness = 0;
			for (var l = 0; l < enemyTypes.length; l++) {
				var effectiveness = 1;
				for (var m = 0; m < allyTypes.length; m++) {
					effectiveness *= superEffectiveness[types.indexOf(enemyTypes[l])][types.indexOf(allyTypes[m])];
				}
				if (effectiveness > theirEffectiveness) {
					theirEffectiveness = effectiveness;
				}
			}
			// overall value = divide our effectiveness by their effectiveness, and multiply by 1-1.5 based on current health

			// (this is just a random formula for finding the best switch. since it's too difficult for the AI to learn this
			// through DTL I've decided to hardcode it in. The problem of finding the best switch can generally be boiled down
			// to these few factors anyways, and it would be too hard for it to come up with a formula like this on its own)
			var currHealthMultiplier = 1 + (curr.health / 200);
			var currVal = currHealthMultiplier * highestEffectiveness / theirEffectiveness
			if (currVal > bestVal) {
				bestVal = currVal;
				bestSwitch = curr.name;
			}
		}
	}

	if (bestSwitch != "") {
		return "switch " + bestSwitch;
	} else {
		// shouldn't end up here, but if we somehow do, then we must be forced to use some move
		var action = useEffectiveStabMove(gameState);
		if (action.length() == 5) {
			return "move 1";
		} else {
			return action;
		}
	}
}

function inTypeDisadvantage(gameState) {
	var ally = gameState.ally.current.name;
	var highestEffectiveness = 0;
	var allyTypes = teamData[ally].types;
	var enemyTypes = gameState.enemy.types;
	for (var j = 0; j < teamData[ally].moves.length; j++) {
		if (!teamData[ally].moves.attack) {
			continue;
		}
		var move = teamData[curr.name].moves[j].type;
		var effectiveness = 1.0;
		for (var k = 0; k < enemyTypes.length; k++) {
			effectiveness *= superEffectiveness[types.indexOf(move)][types.indexOf(enemyTypes[k])];
		}
		if (effectiveness > highestEffectiveness) {
			highestEffectiveness = effectiveness;
		}
	}

	var theirEffectiveness = 0;
	for (var l = 0; l < enemyTypes.length; l++) {
		var effectiveness = 1;
		for (var m = 0; m < allyTypes.length; m++) {
			effectiveness *= superEffectiveness[types.indexOf(enemyTypes[l])][types.indexOf(allyTypes[m])];
		}
		if (effectiveness > theirEffectiveness) {
			theirEffectiveness = effectiveness;
		}
	}

	return highestEffectiveness / theirEffectiveness < 1;
}


module.exports.possibleDecisions = [
	haveSuperEffectiveMove,
	haveEffectiveStabMove,
	haveBoostingMoveAndNotBoosted,
	haveUsableHazardsMove,
	inTypeDisadvantage,
	belowHalfHealth,
	below30Percent
]

module.exports.possibleActions = [
	useSuperEffectiveMove,
	useEffectiveStabMove,
	useBoostingMove,
	useUsableHazardsMove,
	switchToBestAlly
]

module.exports.switch = switchToBestAlly;