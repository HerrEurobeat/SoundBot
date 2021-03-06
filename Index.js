const Discord = require("discord.js")
const config = require('./config.json')
const fs = require('fs')
const https = require('https');

var bot = new Discord.Client()

/* -------------- Functions: -------------- */
function LoadLogin() {
  if (config.token == '') bot.login(require("../token.json").token); 
    else bot.login(config.token) }

var playFile = function playFile(sound, channelid) { //exported function that allows to play a sound from other files (webserver)
  if(bot.voice.connections.find(c => c.channel.id == String(channelid)) == undefined) bot.voice.joinChannel(bot.channels.cache.get(String(channelid)));
     bot.voice.connections.find(c => c.channel.id == String(channelid)).play("./Sounds/" + loadedSounds[sound] + ".mp3");  } //find the channelid's corresponding voice connection
  


/* -------------- Events: -------------- */
bot.on("ready", async function() {
  console.log("Bot launched. Running Version: "+ config.version)

  fs.readdir('./Sounds', (err, files) => { 
    if(err) console.log('error: ' + err)

    loadedSounds = files.filter(f => f.split('.').pop() === 'mp3')
    loadedSounds.forEach((e, i) => {
      loadedSounds[i] = e.replace(".mp3", "") })

    module.exports.loadedSounds = loadedSounds
    console.log(loadedSounds.length + ' Sound(s) loaded.')

    if (config.usewebserver) require("./webserver.js").run(loadedSounds, playFile) //Webserver is enabled? Run it.
   })
})


bot.on('message', async function(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(config.prefix)) return;
  var args = message.content.substring(config.prefix.length).split(/\s+/);
  function AutoJoin() {
     if (message.member.voice.channel == null) { //Check if the user is in a voice channel
       message.channel.send("Please join a voice channel first!")
       return; } 
     if(!bot.guilds.cache.get(message.guild.id).voice || bot.guilds.cache.get(message.guild.id).voice.channelID == null) message.member.voice.channel.join() }

  switch(args[0].toLowerCase()) {
  case 'ping':
    message.channel.send('Pong.');
    break;

  case 'stop':
    message.channel.send('Goodbye!').then(m => {
    bot.destroy() });
    break;

  /*case 'restart':
    message.channel.send('Restarting...');
    bot.destroy();
    //setTimeout(() => {
      LoadLogin();
    //}, 1000);
    break; */

  case 'help':
    message.channel.send('Bot-Commands:\n//ping\n//stop\n//join\n//leave\n//sound (Type sound for more help))') ////restart (This Command doesn´t load new Content)\n
    break;

  case 'join':
    if(message.member.voice.channel == null) {
      message.channel.send('please join a Channel first!')
    return; }

    message.member.voice.channel.join();
    console.log(`Joined ${message.member.voice.channel.name}.`)
    message.channel.send("Joined `" + message.member.voice.channel.name + "`.")
    break;

  case 'leave':
    if(!bot.guilds.cache.get(message.guild.id).voice || bot.guilds.cache.get(message.guild.id).voice.channelID == null) return message.channel.send('I am not connected to any voice channel!\nIf I am still in a voice channel please wait or disconnect me manually.')
    console.log(`Left ${message.guild.voice.connection.channel.name}.`)
    message.channel.send("Left `" + message.guild.voice.connection.channel.name + "`.")
    message.guild.voice.connection.disconnect()
    break;

  case 'sound':
    if(args[1] === 'add') {
       
    var dest = "./Sounds/"+message.attachments.array()[0]["name"];

    if(loadedSounds.includes(message.attachments.array()[0]["name"].replace(".mp3", "")) ) return message.channel.send('Sound does already exist.') ;

    https.get(message.attachments.array()[0]["attachment"], function(response) {
      response.pipe(fs.createWriteStream(dest));
      fs.createWriteStream(dest).on('finish', function() {
        console.log("File download completed.") });
      }).on('error', function(err) { console.log("An error occurred downloading the file: " + err) }) 

      message.channel.send('Adding Sound to the Board'); 
      loadedSounds.push(message.attachments.array()[0]["name"].replace(".mp3", ""));
    }
    else if(args[1] === 'delete') {
      if(!fs.existsSync("./Sounds/" + args[2] + '.mp3')) return message.channel.send('Sound doesn´t exist.');
      fs.unlinkSync("./Sounds/" + args[2] + '.mp3' );
      loadedSounds.splice(loadedSounds.indexOf(args[2]), 1)
      message.channel.send('Sound has been deleted.') }

    else if(args[1] === 'list') message.channel.send(loadedSounds) 
    else if(args[1] === 'dplay') {
      if (message.member.voice.channel == null) { //Check if the user is in a voice channel
        message.channel.send("Please join a voice channel first!")
        return; } 
      AutoJoin()
      message.channel.send('Playing Sound')
      message.member.guild.voice.connection.play(message.attachments.array()[0]["attachment"])}
    else if(args[1] === 'play') {
      if (message.member.voice.channel == null) { //Check if the user is in a voice channel
        message.channel.send("Please join a voice channel first!")
        return; } 
      AutoJoin()
      message.channel.send('Playing Sound: ' + args[2])
      message.member.guild.voice.connection.play('./Sounds/'+ args[2]+'.mp3')}
    else message.channel.send('Please use //sound [play/delete/list] [title], \nsend a mp3 with the Comment "//sound dplay" or \nadd a Sound to the Folder')
    break;

  }
});

module.exports={
  playFile
}

LoadLogin();