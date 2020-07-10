const Discord = require('discord.js');
const client = new Discord.Client();
const dialogflow = require('dialogflow');
const Constants = require('discord.js/src/util/Constants.js');
const uuid = require('uuid');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const https = require('https');

Constants.DefaultOptions.ws.properties.$browser = `Discord iOS`;
client.on("ready", () => {
        client.user.setActivity(".heysiri help");

});

var servers = [];

var maintenance = false;

client.on('message', message => {
        var prefix = ".";
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).split(/ +/);
        const command = args.shift().toLowerCase();
	console.log(command);
        if (command === 'heysiri') {
		if(maintenance == true && message.guild.id != "709543189643526237") {
			message.channel.send("The bot is currently in maintenance mode. All commands are unavailable.");
			return;
		}
		let message2process = message.content.split(' ').splice(1).join(' ');
		let userid = message.member.id;
		runSample(message2process, userid).then(result => {
			let parse = JSON.parse(result);
			if(parse.action == "weather" || parse.action == "weather.temperature" || parse.action == "weather.condition" || parse.action == "weather.activity" || parse.action == "weather.outfit") {
				if(parse.success == true) {
					message.channel.send("Here's the weather for " + parse.city + ", " + parse.country + " in " + parse.unit + "\n```Weather: " + parse.weather + "\nSunrise: " + parse.sunrise + "\nSunset: " + parse.sunset + "\nTemperature: " + parse.temperature + "\nTemperature Low: " + parse.temp_min + "\nTemperature High: " + parse.temp_max + "```");
				} else {
					message.channel.send(`${parse.message}`);
				}
			} else if(parse.action == "translate.text") {
				if(parse.success == true) {
					message.channel.send("**" + parse.original + " in " + parse.detected_lang_name + " is " + parse.translated + " in " + parse.to_lang_name + "**");
				} else {
					message.channel.send(`${parse.message}`);
				}
			} else if(parse.action == "currency.convert") {
				if(parse.success == true) {
					message.channel.send("**" + parse.from_amount + " in " + parse.from + " is " + parse.to_amount + " in " + parse.to + "**");
				} else {
					message.channel.send(`${parse.message}`);
				}
			} else if(parse.action == "web.search") {
				if(parse.success == true) {
					message.channel.send(parse.url);
				} else {
					message.channel.send(`${parse.message}`);
				}
			} else if(parse.action == "jokes.get") {
				if(parse.success == true) {
					message.channel.send(parse.joke);
				}
			} else if(parse.action == "easteregg.fox_sounds" || parse.action == "easteregg.meaning_of_life" || parse.action == "easteregg.why_chicken_cross_road" || parse.action == "easteregg.woodchuck" || parse.action == "easteregg.owner") {
				if(parse.success == true) {
                                        message.channel.send(parse.answer);
                                }
			} else if(parse.action == "input.unknown") {
				message.channel.send(parse.message);
			} else if(parse.action == "music_player_control.pause") {
				if(message.member.permissions.has('ADMINISTRATOR') || message.member.permissions.has('MANAGE_GUILD')) {
					var server = servers[message.guild.id];


					if(message.member.voice.channel) {
						if(!servers[message.guild.id]) {
							message.channel.send("The server isn't currently playing any music.");
							return;
						} else if(!server.dispatcher) {
							message.channel.send("The server isn't currently playing any music.");
							return;
						}

						server.dispatcher.pause();
						message.channel.send("Music Paused");
					} else {
						message.channel.send("You must be in a voice channel to pause music.");
					}
				} else {
					message.channel.send("You must have manage server permissions to perform this.");
				}
			} else if(parse.action == "music_player_control.play" || parse.action == "music_player_control.resume") {
				if(message.member.permissions.has('ADMINISTRATOR') || message.member.permissions.has('MANAGE_GUILD')) {
					var server = servers[message.guild.id];

					if(message.member.voice.channel) {
						if(!servers[message.guild.id]) {
							message.channel.send("The server isn't currently playing any music.");
							return;
						} else if(!server.dispatcher) {
							message.channel.send("The server isn't currently playing any music.");
							return;
						}

						server.dispatcher.resume();
						message.channel.send("Music Resumed");
					} else {
						message.channel.send("You must be in a voice channel to play music.");
					}
				} else {
					message.channel.send("You must have manage server permissions to perform this.");
				}
			} else if(parse.action == "music_player_control.skip_forward") {
				if(message.member.voice.channel) {
					var size = message.member.voice.channel.members.filter(x => !x.bot).size;
					var server = servers[message.guild.id];
					if(!server.peopleSkipped) {
						server.peopleSkipped = [];
					}
					if(!server.skipCount) {
						server.skipCount = 0;
					}
					if(!servers[message.guild.id]) {
						message.channel.send("The server isn't currently playing any music.");
						return;
					} else if(!server.queue.playedBy[0]) {
						message.channel.send("The server isn't currently playing any music.");
						return;
					}
					if(message.member.id == server.queue.playedBy[0]) {
						server.dispatcher.end();
						message.channel.send("Music Skipped");
					} else {
						if(size >= 3) {
							if(server.peopleSkipped.includes(message.member.id)) {
								message.channel.send("You already voted to skip.");
								return;
							}
							let skipsRequired = Math.round(size / 2);
							server.skipCount++;
							if(skipsRequired != server.skipCount) {
								message.channel.send(server.skipCount + "/" + skipsRequired + " skips needed.");
								server.peopleSkipped.push(message.member.id);
							} else {
								server.dispatcher.end();
								message.channel.send("Music Skipped");
							}
						} else {
							server.dispatcher.end();
							message.channel.send("Music Skipped");
						}
					}
				} else {
					message.channel.send("You must be in a voice channel to skip music.");
				}
			} else if(parse.action == "easteregg.uses") {
				 message.channel.send("Current Features:\n```Get the Weather: .heysiri what's the weather in new york in C?\nTranslate Text: .heysiri translate Hello to Spanish?\nConvert Currencies: .heysiri convert 1 usd to rupees\nSearch the Web: .heysiri google discord.com\nTell a Joke: .heysiri tell me a joke\nPlay Music: .play Wonderwall by Oasis\nPause Music: .heysiri pause music\nSkip Music: .skip\nForce Skip: .forceskip\nShow the music queue: .queue\nGet Coronavirus cases by country: .corona\nMake a suggestion: .suggest\nDad Joke: .dadjoke```");
			} else if(parse.action == "easteregg.wwdccountdown") {
				if(message.channel.id == 551487463625850882) {
					message.channel.send("You're asking the wrong person!");
					message.channel.send("!countdown");
				} else {
					message.channel.send("You must be in #bot-commands to use this command.");
				}
			}
		});
	} else if(command === "announce") {
		let message2process = message.content.split(' ').splice(1).join(' ');
		var firstWords = [];
		for (var i=0;i<message2process.length;i++)
		{
		  var words = message2process.split(" ");
		  firstWords.push(words[0]);
		}
		let id = firstWords[0];
		let stringArr = message.content;
		let text = stringArr.split(' ').splice(2).join(' ');
		if(message.guild.id == "709543189643526237") {
			let targetChannel = client.channels.cache.get(id);
			if(targetChannel) targetChannel.send(text);
		}
	} else if(command === "play" || command === "p") {
		let message2process = message.content.split(' ').splice(1).join(' ');
		if(message.member.voice.channel) {
			if(!servers[message.guild.id]) {
				servers[message.guild.id] = { queue: [] };
				servers[message.guild.id].queue = { song: [], playedBy: [] };
			}

			var server = servers[message.guild.id];

			let filter;

			ytsr.getFilters(message2process, function(err, filters) {
			  if(err) { message.channel.send("Error Playing Song"); return; }
				filter = filters.get('Type').find(o => o.name === 'Video');
			  ytsr.getFilters(filter.ref, function(err, filters) {
				if(err) { message.channel.send("Error Playing Song"); return; }
				  var options = {
					  limit: 5,
					  nextpageRef: filter.ref,
				  }
				  ytsr(null, options, function(err, searchResults) {
					  if(err) { message.channel.send("Error Playing Song"); return; }

					let jsonString = JSON.stringify(searchResults);
					let jsonVideo = JSON.parse(jsonString);

					/*var songlength = jsonVideo.items[0].duration;

					if(songlength.split(":").length - 1 == 2) {
						songlength = songlength.substring(0, songlength.lastIndexOf(":"));
						let time = songlength.split(':');
						songlength = 0;
						for(i=0; i < time[0]; i++) {
							songlength += 60;
						}
						songlength += parseInt(time[1]);
					} else {
						songlength = songlength.substring(0, songlength.indexOf(':'));
					}

					console.log(songlength);

					if(songlength > 20) {
						message.channel.send("Song can't be longer than 20 minutes.");
						return;
					}*/

					if(!server.voiceConnection) {
						server.voiceConnection = 0;
					} else if(server.voiceConnection != message.member.voice.channel.id && message.guild.voice.channel) {
						if(server.voiceConnection != message.guild.voice.channel.id) {
							server.voiceConnection = message.guild.voice.channel.id;
						} else {
							message.channel.send("I'm already in a voice channel in this server.");
							return;
						}
					} else if(!message.guild.voice.channel) {
						server.voiceConnection = 0;
						server.queue.song = [];
						server.queue.playedBy = [];
					}

					server.queue.song.push(jsonVideo.items[0].link);
					server.queue.playedBy.push(message.member.id);
													console.log(server.queue);

					console.log(server.voiceConnection);
					if(server.voiceConnection != message.member.voice.channel.id) message.member.voice.channel.join().then(function(connection) {
						server.voiceConnection = message.member.voice.channel.id;
						play(connection, message);
					});

					message.channel.send("Added " + jsonVideo.items[0].title + " to queue");
				});
			  });
			});
		} else {
			message.channel.send("You must be in a voice channel to play music.");
		}
	} else if(command === "reboot") {
		if(message.member.permissions.has('ADMINISTRATOR') || message.member.permissions.has('MANAGE_MESSAGES') || message.author.id == 706744803483975751) {
			resetBot(message.channel);
		} else {
			message.channel.send("You must be a modmin to perform this.");
		}
	} else if(command === "queue" || command === "q") {
		var server = servers[message.guild.id];
		if(!servers[message.guild.id]) {
			message.channel.send("The server isn't currently playing any music.");
			return;
                } else if(!server.queue.playedBy[0]) {
			message.channel.send("The server isn't currently playing any music.");
			return;
                }

		var message2send = "";
		for(var i=0;i<server.queue.playedBy.length;i++) {
			let guild = client.guilds.cache.get(message.guild.id);
			let member = guild.member(server.queue.playedBy[i]);
			let nickname = member ? member.displayName : null;
			if(i == 0) {
				message2send = "Current song played by " + nickname + "\n";
			} else {
				message2send = message2send + i + '. <' + server.queue.song[i - 1] + '> requested by ' + nickname + "\n";
			}
		}
		message.channel.send(message2send);
	} else if(command === "corona") {
		let message2send = message.content.split(' ').splice(1).join(' ');

		if(message2send == "") {
			message.channel.send("Usage: .corona countries | .corona US");
			return;
		}
		if(message2send == "countries") {
	      https.get('https://covid2019-api.herokuapp.com/v2/current', (resp) => {
        	let data = '';

	        resp.on('data', (chunk) => {
        	  data += chunk;
	        });

			resp.on('end', () => {
			var parse = JSON.parse(data);
			var msgg = "Available Countries\n";
			for(location in parse.data) {
				msgg += parse.data[location].location + "\n";
			}
			message.author.send(msgg);
			message.channel.send("DMed you the list of valid countries.");
			});

			}).on("error", (err) => {
				messagel.channel.send("Error getting country list for Coronavirus cases.");
			});
		} else {
      		let encodedName = encodeURIComponent(message2send);
			https.get('https://covid2019-api.herokuapp.com/v2/country/' + encodedName, (resp) => {
			let data = '';

				// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});

				// The whole response has been received. Print out the result.
			resp.on('end', () => {
				var parse = JSON.parse(data);
				var msgg = "";
			if(!parse.data[0]) {
				msgg = parse.data.location + "\nConfirmed Cases: " + numberWithCommas(parse.data.confirmed) + "\nDeath Count: " + numberWithCommas(parse.data.deaths) + "\nRecovered: " + numberWithCommas(parse.data.recovered) + "\nActive Cases: " + numberWithCommas(parse.data.active);
			} else {
				msgg = "Must supply a valid country. Use `.corona countries` to get a list of valid countries.";
			}
				message.channel.send(msgg);
			});

			}).on("error", (err) => {
				messagel.channel.send("Error getting country for Coronavirus cases.");
			});
    	}
	} else if(command === "suggest") {
		let message2send = message.content.split(' ').splice(1).join(' ');
		if(message2send == "") {
			message.channel.send("Usage: `.suggest pizza` (replace pizza with a suggestion)");
			return;
		}

		user = message.member.user.username;
		colorrole = message.member.displayColor;

		const embed = new Discord.MessageEmbed()
			                        .setColor(colorrole)
						.setTitle(user)
						.setThumbnail(message.author.avatarURL())
						.addField('Suggestion', message2send, true)
						.setTimestamp()
//		message.delete();
		client.channels.cache.get("725407518054154261").send(embed);
		message.channel.send("Thank you. Your suggestion has been submitted.");
	} else if(command === "forceskip" || command === "fs") {
		if(message.member.permissions.has('ADMINISTRATOR') || message.member.permissions.has('MANAGE_MESSAGES') || message.author.id == 706744803483975751) {
			var server = servers[message.guild.id];

			if(message.member.voice.channel) {
				if(!server.peopleSkipped) {
					server.peopleSkipped = [];
				}
				if(!server.skipCount) {
					server.skipCount = 0;
				}

				if(!servers[message.guild.id]) {
					message.channel.send("The server isn't currently playing any music.");
					return;
				} else if(!server.queue.playedBy[0]) {
					message.channel.send("The server isn't currently playing any music.");
					return;
				} else {
					server.dispatcher.end();
					message.channel.send("Music Skipped");
				}
			} else {
				message.channel.send("You must be in a voice channel to skip music.");
			}
		} else {
			message.channel.send("You must be a modmin to perform this.");
		}
	} else if(command === "skip" || command === "s") {
		if(message.member.voice.channel) {
			var size = message.member.voice.channel.members.filter(x => !x.bot).size;
			var server = servers[message.guild.id];
			if(!server.peopleSkipped) {
				server.peopleSkipped = [];
			}
			if(!server.skipCount) {
				server.skipCount = 0;
			}
			if(!servers[message.guild.id]) {
				message.channel.send("The server isn't currently playing any music.");
				return;
			} else if(!server.queue.playedBy[0]) {
				message.channel.send("The server isn't currently playing any music.");
				return;
			}
			if(message.member.id == server.queue.playedBy[0]) {
				server.dispatcher.end();
				message.channel.send("Music Skipped");
			} else {
				if(size >= 3) {
					if(server.peopleSkipped.includes(message.member.id)) {
						message.channel.send("You already voted to skip.");
						return;
					}
					let skipsRequired = Math.round(size / 2);
					server.skipCount++;
					if(skipsRequired != server.skipCount) {
						message.channel.send(server.skipCount + "/" + skipsRequired + " skips needed.");
						server.peopleSkipped.push(message.member.id);
					} else {
						server.dispatcher.end();
						message.channel.send("Music Skipped");
					}
				} else {
					server.dispatcher.end();
					message.channel.send("Music Skipped");
				}
			}
		} else {
			message.channel.send("You must be in a voice channel to skip music.");
		}
	} else if (command === 'dadjoke') {
                var post_options = {
                      host: 'icanhazdadjoke.com',
                      port: '443',
                      path: '/',
                      method: 'GET',
                      headers: {
                          'Accept': 'application/json'
                      }
                  };
                  var post_req = https.request(post_options, function(res) {
                      res.on('data', function (chunk) {
                          var parse = JSON.parse(chunk);
                          if(parse.status == 200) {
                                message.channel.send(parse.joke);
                          } else {
                                message.channel.send("Error getting dadjoke.");
                          }
                      });
                  });

                post_req.end();
        }/* else if(command === 'pickupline') {
                 var post_options = {
                      host: 'pebble-pickup.herokuapp.com',
                      port: '443',
                      path: '/tweets/random',
                      method: 'GET',
                      headers: {
                          'Accept': 'application/json'
                      }
                  };
                  var post_req = https.request(post_options, function(res) {
                      res.on('data', function (chunk) {
                          var parse = JSON.parse(chunk);
			  message.channel.send(parse.tweet);
                      });
                  });

                post_req.end();
        }*/
});

function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function resetBot(channel) {
    channel.send('Restarting bot...')
    .then(msg => client.destroy())
    .then(() => client.login(''));
}

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.play(ytdl(server.queue.song[0], { filter: 'audioonly' }));
	server.queue.song.shift();
	server.dispatcher.on("finish", function() {
		server.queue.playedBy.shift();
		server.skipCount = 0;
		server.peopleSkipped = [];

		if(server.queue.song[0]) {
			console.log("Next song");
			play(connection, message);
		} else {
			console.log("Disconnect");
			server.voiceConnection = 0;
			message.guild.voice.channel.leave();
		}
	});
}

async function runSample(text, userid, projectId = 'api2-213204') {
  // A unique identifier for the given session
  const sessionId = uuid.v4();

  // Create a new session
  const sessionClient = new dialogflow.SessionsClient();
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        // The query to send to the dialogflow agent
        text: text,
        // The language used by the client (en-US)
        languageCode: 'en-US',
      },
    },
    queryParams: {
      payload: {
        data: {
           userid: userid,
        }
      }
    }
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  console.log(responses);
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  return result.fulfillmentText;
}

client.login('');
