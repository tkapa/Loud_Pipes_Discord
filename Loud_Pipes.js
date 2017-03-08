var Discordie = require("discordie");
var client = new Discordie();
var request = require('request');
var fs = require('fs');
var globdata = [];
var async = require('async');

fs.readFile(`${__dirname}/cards.json`, (err, data) => {
    if(err) return console.log(err);
    console.log(JSON.parse(data).length);
    globdata = JSON.parse(data);
});

client.connect({ token: "Mjg2NDI3NTk2MDI2MDE5ODQx.C5gmyA.EWk6RRGeTbV6KHSdc-7-y5DXov8" });

client.Dispatcher.on("GATEWAY_READY", e => {
  console.log("Connected as: " + client.User.username);
  client.Channels.get('216455483094073344').sendMessage('Suh dude, I\'m back again boiz');
});

client.Dispatcher.on("MESSAGE_CREATE", e => {
  console.log(`${e.message.author.username} > ${e.message.content}`);
  RetEmbed(e);

  if(e.message.content.split(' ')[0] == '!request') PullRandomCard(e);
});

function RetEmbed(e){
  //If the message sent is !ping send an embed containing this info
  if (e.message.content == "!ping") {
    e.message.channel.sendMessage('', false, {
      title: 'ABUNAI',
      description: `${e.message.author.username} wanted this done`,
      timestamp: new Date(),
      thumbnail: { url: 'http://i.imgur.com/BmgB6h6.png' },
      color: 0x990000,
      footer: { text: 'That guy said !ping' },
      fields: [
        { name: 'Yeah boi', value: '<:OHGOD:284670299092549632>' }
      ]
    });
  }
}

function PullRandomCard(e) {
    var promises = [];
    for(var i = 1; i < 5; ++i) {
      console.log(i);
        promises.push(function(callback) {
            GetCards(i).then((data) => {
                console.log(`Data from page ${data[1]}`);
                for(var card in data[0].cards) globdata.push(data[0].cards[card]);

                callback();
            });
        });
    }

    async.parallel(promises, (err) => {
        fs.writeFile(`${__dirname}/cards.json`, JSON.stringify(globdata, null, 4), (err) => {
            if(err) return console.error(err);
            console.log('Updated the json file');
        });
    });
}

function GetCards(page) {
  return new Promise((resolve, reject) => {
    console.log(`https://api.magicthegathering.io/v1/cards?page=${page}`);
    request(`https://api.magicthegathering.io/v1/cards?page=${page}`, (err, resp, body) => {
      if(err) {
        console.log(err);
        return reject();
      }

      if(resp.statusCode != 200) {
        console.log(resp.statusCode);
        return reject();
      }

      //The data is good
      return resolve([JSON.parse(body), page]);
    });
  });
}
