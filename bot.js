const Discord = require('discord.js');
const client = new Discord.Client();
const dialogflow = require('dialogflow');
const Constants = require('discord.js/src/util/Constants.js');
const uuid = require('uuid');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

Constants.DefaultOptions.ws.properties.$browser = `Discord iOS`;
client.on("ready", () => {
        client.user.setActivity(".heysiri help");

//	here2help();
//	setInterval(here2help, 3600000);
});

function here2help() {
	if(maintenance == false) {
		client.channels.cache.get("297955830106554368").send("Don't forget, I'm always here to help! To get started, type `.heysiri help` in the bot commands channel.");
	} else {
		client.channels.cache.get("710402599509164113").send("Don't forget, I'm always here to help! To get started, type `.heysiri help` in the bot commands channel.");
	}
}

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
				if(message.member.permissions.has('ADMINISTRATOR') || message.member.permissions.has('MANAGE_GUILD')) {
					var server = servers[message.guild.id];
					if(!server.peopleSkipped) {
						server.peopleSkipped = [];
					}
					if(!server.skipCount) {
						server.skipCount = 0;
					}

					if(message.member.voice.channel) {
						if(!servers[message.guild.id]) {
							message.channel.send("The server isn't currently playing any music.");
							return;
						} else if(!server.queue.playedBy[0]) {
							message.channel.send("The server isn't currently playing any music.");
							return;
						}

						server.queue.playedBy.shift();
						server.dispatcher.end();
						server.peopleSkipped = [];
						server.skipCount = 0;
						message.channel.send("Music Skipped");
					} else {
						message.channel.send("You must be in a voice channel to skip music.");
					}
				} else {
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
							server.queue.playedBy.shift();
							server.dispatcher.end();
							server.peopleSkipped = [];
							server.skipCount = 0;
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
									peopleSkipped.push(message.member.id);
								} else {
									server.queue.playedBy.shift();
									server.dispatcher.end();
									server.skipCount = 0;
									server.peopleSkipped = [];
									message.channel.send("Music Skipped");
								}
							} else {
								server.queue.playedBy.shift();
								server.dispatcher.end();
								server.skipCount = 0;
								server.peopleSkipped = [];
								message.channel.send("Music Skipped");
							}
						}
					} else {
						message.channel.send("You must be in a voice channel to skip music.");
					}
				}
			} else if(parse.action == "easteregg.uses") {
				 message.channel.send("Current Features:\n```Get the Weather: .heysiri what's the weather in new york in C?\nTranslate Text: .heysiri translate Hello to Spanish?\nConvert Currencies: .heysiri convert 1 usd to rupees\nSearch the Web: .heysiri google discord.com\nTell a Joke: .heysiri tell me a joke\nPlay Music (experimental): .heysiri play Wonderwall by Oasis\nPause Music (experimental): .heysiri pause music\nSkip Music (experimental): .heysiri skip```");
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
	} else if(command === "play") {
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
	}
});

function play(connection, message) {
	var server = servers[message.guild.id];

	server.dispatcher = connection.play(ytdl(server.queue.song[0], { filter: 'audioonly' }));
	server.queue.song.shift();
	server.dispatcher.on("finish", function() {
		server.queue.playedBy.shift();
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
