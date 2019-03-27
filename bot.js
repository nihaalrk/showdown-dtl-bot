
const fs = require('fs');
var account = JSON.parse(fs.readFileSync('account.json'));

const sockjs = require('sockjs-client-ws');
const client = sockjs.create('http://sim.smogon.com:8000/showdown');
const request = require('request');

var battleData;

function handleData(data) {
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
		// reset battle data
		case 'init':
			battleData = null;
		case 'switch':
			// set the current pokemon for that team
		case 'drag':
			// set the current pokemon for that team
		case '-damage':
			// update health of that pokemon
		case '-heal':
			// update health of that pokemon
		case '-weather':
			// update health of that pokemon
	}
}

if(client) {
	client.on('connection', function() {
		console.log('Connected to server.');
	});

	client.on('data', function(msg) {
		console.log(msg);
		handleData(msg);
	});

	client.on('error', function(e) {
		console.log(e);
	});
}
