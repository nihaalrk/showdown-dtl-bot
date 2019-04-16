module.exports = {
	Dwebble: {
		types: ["bug", "rock"],
		moves: [
			{
				name: "stealthrock",
				type: "rock",
				attack: false,
				stab: false,
				boost: false,
				hazard: true
			},
			{
				name: "spikes",
				type: "normal",
				attack: false,
				stab: false,
				boost: false,
				hazard: true
			},
			{
				name: "rockblast",
				type: "rock",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "knockoff",
				type: "dark",
				attack: true,
				stab: false,
				boost: false,
				hazard: false
			}
		]
	}, 
	Scraggy: {
		types: ["fighting", "dark"],
		moves: [
			{
				name: "knockoff",
				type: "dark",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "poisonjab",
				type: "poison",
				attack: true,
				stab: false,
				boost: false,
				hazard: false
			},
			{
				name: "highjumpkick",
				type: "fighting",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "dragondance",
				type: "dragon",
				attack: false,
				stab: false,
				boost: true,
				hazard: false
			}
		]
	}, 
	Vullaby: {
		types: ["dark", "flying"],
		moves: [
			{
				name: "darkpulse",
				type: "dark",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "airslash",
				type: "flying",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "hiddenpowerfighting60",
				type: "fighting",
				attack: true,
				stab: false,
				boost: false,
				hazard: false
			},
			{
				name: "nastyplot",
				type: "dark",
				attack: false,
				stab: false,
				boost: true,
				hazard: false
			}
		]
	}, 
	Pumpkaboo: {
		types: ["grass", "ghost"],
		moves: [
			{
				name: "gigadrain",
				type: "grass",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "willowisp",
				type: "fire",
				attack: false,
				stab: false,
				boost: false,
				hazard: false
			},
			{
				name: "fireblast",
				type: "fire",
				attack: true,
				stab: false,
				boost: false,
				hazard: false
			},
			{
				name: "synthesis",
				type: "grass",
				attack: false,
				stab: false,
				boost: true,
				hazard: false
			}
		]
	}, 
	Pawniard: {
		types: ["dark", "steel"],
		moves: [
			{
				name: "knockoff",
				type: "dark",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "ironhead",
				type: "steel",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "suckerpunch",
				type: "dark",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "thunderwave",
				type: "electric",
				attack: false,
				stab: false,
				boost: false,
				hazard: false
			}
		]
	}, 
	Chinchou: {
		types: ["water", "electric"],
		moves: [
			{
				name: "voltswitch",
				type: "electric",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "scald",
				type: "water",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "thunderbolt",
				type: "electric",
				attack: true,
				stab: true,
				boost: false,
				hazard: false
			},
			{
				name: "hiddenpowerground60",
				type: "ground",
				attack: true,
				stab: false,
				boost: false,
				hazard: false
			}
		]
	},
	text: "Dwebble||eviolite|H|stealthrock,spikes,rockblast,knockoff|impish|116,76,156,0,0,156||||5|]" + 
				"Scraggy||berryjuice|0|knockoff,poisonjab,highjumpkick,dragondance|jolly|36,156,36,0,36,212||||5|]" + 
				"Vullaby||eviolite|H|darkpulse,airslash,hiddenpowerfighting60,nastyplot|modest|116,0,0,160,0,200||||5|]" + 
				"Pumpkaboo||eviolite|1|gigadrain,willowisp,fireblast,synthesis|calm|204,0,196,4,76,28||||5|]" + 
				"Pawniard||eviolite|0|knockoff,ironhead,suckerpunch,thunderwave|jolly|0,156,36,0,116,196||||5|]" + 
				"Chinchou||choicescarf|0|voltswitch,scald,thunderbolt,hiddenpowerground60|timid|0,0,52,232,0,224||||5|" 
}
