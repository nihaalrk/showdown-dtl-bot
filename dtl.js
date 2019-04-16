var features = require("./features");
var Datastore = require('nedb');
var db = new Datastore({ filename: 'moves.db'});

class DecisionTreeNode {

	constructor(func, left, right) {
		this.func = func;
		this.left = left;
		this.right = right;
	}

}

class DecisionTreeLeaf {

	constructor(action, isFunc) {
		this.action = action;
		this.isFunction = isFunc;
	}

}

function decisionTreeNode(examples) {
	var bestDecision = null;
	var bestEntropy = 1000000;
	var bestDecisionIndex = null;

	var yesMajority = null;
	var noMajority = null;

	for (var i = 0; i < features.possibleDecisions.length; i++) {
		var yes = [];
		var yesCount = 0;
		var yesMap = new Map();
		var no = [];
		var noCount = 0;
		var noMap = new Map();

		for (var j = 0; j < examples.length; j++) {
			var idString = examples[j].type + ' ' + examples[j].value;
			// treat all switches the same
			if (examples[j].type == "switch") {
				idString = examples[j].type;
			}
			if (features.possibleDecisions[i](examples[j].gameState)) {
				yes[yesCount] = examples[j];
				yesCount++;

				if (yesMap.has(idString)) {
					yesMap.set(idString, yesMap.get(idString)+1);
				} else {
					yesMap.set(idString, 1);
				}
			} else {
				no[noCount] = examples[j];
				noCount++;

				if (noMap.has(idString)) {
					noMap.set(idString, noMap.get(idString)+1);
				} else {
					noMap.set(idString, 1);
				}
			}
		}

		var entropyYes = 0;
		var iterator1 = yesMap.entries();
		while(true) {
			var next = iterator1.next();
			if (next.done) {
				break;
			}
			var p = next.value[1] / yesCount;
			if (p >= 0.75) {
				yesMajority = next.value[0];
			}
			entropyYes += -1 * p * Math.log2(p);
		}

		var entropyNo = 0;
		var iterator2 = noMap.entries();
		while(true) {
			var next = iterator2.next();
			if (next.done) {
				break;
			}
			var p = next.value[1] / noCount;
			if (p >= 0.75) {
				noMajority = next.value[0];
			}
			entropyNo += -1 * p * Math.log2(p);
		}

		var expectedEntropy = (yesCount / examples.length) * entropyYes + (noCount / examples.length) * entropyNo;
		if (expectedEntropy < bestEntropy) {
			bestDecision = features.possibleDecisions[i];
			bestDecisionIndex = i;
			bestEntropy = expectedEntropy;
		}
	}

	var leftNode = null;
	if (bestDecisionIndex < features.possibleActions.length) {
		leftNode = new DecisionTreeLeaf(features.possibleActions[bestDecisionIndex], true);
	} else if (yesMajority != null && yesMajority == "switch") {
		// use the default action for switching
		leftNode = new DecisionTreeLeaf(features.switch, true);
	} else if (yesMajority != null) {
		leftNode = new DecisionTreeLeaf(yesMajority, false);
	} else {
		leftNode = decisionTreeNode(yes);
	}
	var rightNode = null;
	if (noMajority != null && noMajority == "switch") {
		// use the default action for switching
		rightNode = new DecisionTreeLeaf(features.switch, true);
	} else if (noMajority != null) {
		rightNode = new DecisionTreeLeaf(noMajority, false);
	} else {
		rightNode = decisionTreeNode(no);
	}
	var tree = new DecisionTreeNode(bestDecision, leftNode, rightNode);
	return tree;
}
db.loadDatabase();

db.find({turn: 'start', "gameState.ally.current.name": 'Scraggy'}, function (err, docs) {
	module.exports.dtreeScraggy = decisionTreeNode(docs);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function logDTL() {
  await sleep(500);
  console.log(module.exports.dtreeScraggy);
}

logDTL();