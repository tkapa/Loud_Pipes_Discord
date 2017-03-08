var Discordie = require("discordie");
var client = new Discordie();
var request = require('request');
var fs = require('fs');
var globdata = [];

fs.readFile('cards.json', (err, data) => {
  if(err) return console.log(err);

  console.log(JSON.parse(data).length);
})

client.connect({ token: "Mjg2NDI3NTk2MDI2MDE5ODQx.C5gmyA.EWk6RRGeTbV6KHSdc-7-y5DXov8" });

client.Dispatcher.on("GATEWAY_READY", e => {
  console.log("Connected as: " + client.User.username);
});

client.Dispatcher.on("MESSAGE_CREATE", e => {
  console.log(`${e.message.author.username} > ${e.message.content}`);
  RetFuckYou(e);

  if(e.message.content.split(' ')[0] == '!request') PullRandomCard(e);
});

function RetFuckYou(e){
  if (e.message.content == "!ping") {
    //e.message.channel.sendMessage(`fuck you ${e.message.author.mention}`);
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
  for(var i = 1; i < 30; i++) {
    GetCards(i).then((data) => {
      console.log(`Got data for iterator: ${i}`);
      for(var card in data.cards) globdata.push(data.cards[card]);

      fs.writeFile('cards.json', JSON.stringify(globdata, null, 4), (err) => {
        if(err) return console.error(err);
        console.log('Fuck off');
      });
    });
  }
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
      return resolve(JSON.parse(body));
    });
  });
}
