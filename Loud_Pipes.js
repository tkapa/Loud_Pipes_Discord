var Discordie = require("discordie");
var client = new Discordie();
var request = require('request');
var fs = require('fs');
var globdata = [];
var async = require('async');
const mtg = require('mtgsdk');

fs.readFile(`${__dirname}/cardList.json`, (err, data) => {
    if(err) return console.log(err);
    console.log(JSON.parse(data).length);
    console.log(JSON.parse(data)[2].name);
    globdata = JSON.parse(data);
});

client.connect({ token: "Mjg2NDI3NTk2MDI2MDE5ODQx.C5gmyA.EWk6RRGeTbV6KHSdc-7-y5DXov8" });

    client.Dispatcher.on("GATEWAY_READY", e => {
        client.Channels.get('216455483094073344').sendMessage('***CLANK***');
        client.Channels.get('216455483094073344').sendMessage(`you called?`);
        client.User.setGame('r for card');
});

client.Dispatcher.on("MESSAGE_CREATE", sentMessage => {
    if (sentMessage.message.content == "Yo pipes")
        sentMessage.message.channel.sendMessage(`Hello, ${sentMessage.message.author}`);
    if (sentMessage.message.content == "r") RandomCard(sentMessage);
    if(sentMessage.message.content.substring(0,5) == '!find') FindCard(sentMessage);
    if(sentMessage.message.content.substring(0, 14) == '!buildBooster') BuildBoosterPack(sentMessage);

    //Should only be used if the data is needed again
    if (sentMessage.message.content == "!downloadCardSets")  CompileCards(sentMessage);
    if (sentMessage.message.content == "!saveCardSets")  GenJSON(sentMessage);
});

//Generates a random card from the database
function RandomCard(sentMessage){
  console.log(`We have ${globdata.length} cards`)
  var cardNo = Math.round(Math.random() * globdata.length);
  console.log(`CardNo is ` + cardNo);
  var thisCard = globdata[cardNo];

  EmbedCardData(sentMessage, thisCard);
}

//Search for a specific cardEmbed
function FindCard(sentMessage){
    var foundCard;
    //var messageArr = sentMessage.message.content.split('_');
    var messageArr = sentMessage.message.content.slice(6, sentMessage.message.content.length);
    console.log(messageArr);

    for(i = 0; i < globdata.length - 1; ++i){
        if(globdata[i].name == messageArr){
            foundCard = globdata[i];
            break;
        }
    }

    if(foundCard)
        EmbedSingleCardData(sentMessage, foundCard);
    else {
        sentMessage.message.channel.sendMessage(`Sorry, ${sentMessage.message.author.mention}, I couldn't find that card`);
    }
}

//Build a bootser pack from a specified setName
function BuildBoosterPack(sentMessage){
    //Build a booster pack from a specificed set
}

//Build an embedded message to display a single card's info
function EmbedSingleCardData(sentMessage, thisCard){
    //Preemptively create the cardEmbed
    //https://leovoel.github.io/embed-visualizer/ card embed sim
    var cardEmbed = {
        author: {
            name: `A card has been retrieved`
        },
        title: `${thisCard.name} ${thisCard.manaCost}`,
        description: `*No flavour text available*`,
        timestamp: new Date(),
        image: {
            url: `${thisCard.imageUrl}`
        },
        color: 0xd3d3d3,
        footer: {
            text: `Card art by ${thisCard.artist}`
        },
        fields: [
            {
                name: `${thisCard.type}`,
                value: `??`,
            },
            {
                name: `Set:`,
                value: `${thisCard.setName}`,
            },
            {
                name: `Rarity:`,
                value: `${thisCard.rarity}`,
            }
        ]
        }

        if(thisCard.flavor) cardEmbed.description = `*${thisCard.flavor}*`;
        if(thisCard.originalText) cardEmbed.fields[0].value = `${thisCard.originalText}`;

        //Change the color of the embed depending on the card color. the default card color is grey
        if(thisCard.colors) if(thisCard.colors.length > 0){
            switch (thisCard.colors[0]) {
              case 'Blue':
                      cardEmbed.color = 0xadd8e6;
                  break;

              case 'Green':
                      cardEmbed.color = 0x00ff00;
                  break;

              case 'Red':
                      cardEmbed.color = 0xff0000;
                  break;

              case 'Black':
                      cardEmbed.color = 0x000000;
                  break;

              case 'White':
                      cardEmbed.color = 0xffffff;
                  break;

              default:
                      cardEmbed.color = 0xd3d3d3;
                  break;
            }
        }

    //If the message sent is !ping send an embed containing this info
    sentMessage.message.channel.sendMessage('', false, cardEmbed);
}

function EmbedMultipleCards(sentMessage, cardArr){
    //
}

//FUNCTIONS REQUIRED FOR COMPILING MTG CARDS FROM AN EXTERNAL API
function CompileCards(e){
  // Get all cards
  var i = 0;
  mtg.card.all() //If you want to search just 1 page -> mtg.card.all({pageSize: 1 })
  .on('data', function (card) {
    globdata.push(card);
    i++;
    console.log("Card Number: ", i);
    });
    if(i == globdata.length + 1 )
      console.log('Done');
  }

  function GenJSON(e)
  {
    if(globdata.length > 0){
      fs.writeFile(`${__dirname}/cardList.json`, JSON.stringify(globdata, null, 4), (err) => {
              if(err) return console.error(err);
              console.log('Updated the json file');
          });
      console.log('Finished Collecting data');
    }
    e.message.channel.sendMessage('There is no new data, use command !saveCardSets');
  }
