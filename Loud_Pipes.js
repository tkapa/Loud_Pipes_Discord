var Discordie = require("discordie");
var client = new Discordie();
var request = require('request');
var fs = require('fs');
var globdata = [];
var async = require('async');
const mtg = require('mtgsdk');

var commonCards = [];
var uncommonCards = [];
var rareCards = [];
var mythicRareCards = [];

fs.readFile(`${__dirname}/cardList.json`, (err, data) => {
    if(err) return console.log(err);
    console.log(JSON.parse(data).length);
    console.log(JSON.parse(data)[2].name);
    globdata = JSON.parse(data);
});

client.connect({ token: require(`${__dirname}/auth.json`).token });

client.Dispatcher.on("GATEWAY_READY", e => {

        for(i = 0; i < globdata.length - 1; ++i){
            switch(globdata[i].rarity){
                case 'Common':
                if(globdata[i].types[0] != 'Land')
                        commonCards.push(globdata[i]);
                    break;

                case 'Uncommon':
                        uncommonCards.push(globdata[i]);
                    break;

                case 'Rare':
                        rareCards.push(globdata[i]);
                    break;

                case 'Mythic Rare':
                        mythicRareCards.push(globdata[i]);
                    break;
            }
        }

        client.Channels.get('216455483094073344').sendMessage('***CLANK***');
        client.Channels.get('216455483094073344').sendMessage(`you called?`);
        client.User.setGame('r for card');
});

client.Dispatcher.on("MESSAGE_CREATE", sentMessage => {
    if (sentMessage.message.content == "Yo pipes")
        sentMessage.message.channel.sendMessage(`Hello, ${sentMessage.message.author.mention}`);
    if (sentMessage.message.content == "!pickCard") {
        RandomCard(sentMessage);
        sentMessage.message.delete();
    }
    if(sentMessage.message.content.substring(0,9) == '!findCard'){
        FindCard(sentMessage);
        sentMessage.message.delete();
    }
    if(sentMessage.message.content.substring(0, 14) == '!buildBooster'){
        BuildBoosterPack(sentMessage);
        sentMessage.message.delete();
    }

    //Should only be used if the data is needed again
    if (sentMessage.message.content == "PipesAuth-downloadCardSets")  CompileCards(sentMessage);
    if (sentMessage.message.content == "PipesAuth-saveCardSets")  GenJSON(sentMessage);
});

//Generates a random card from the database
function RandomCard(sentMessage){
  console.log(`We have ${globdata.length} cards`)
  var cardNo = Math.round(Math.random() * globdata.length);
  console.log(`CardNo is ` + cardNo);
  var thisCard = globdata[cardNo];

  EmbedSingleCardData(sentMessage, thisCard);
}

//Search for a specific cardEmbed
function FindCard(sentMessage){
    var foundCard;
    var query;
    var messageArr = sentMessage.message.content.split(' ');

    messageArr.splice(0, 1);

    for(var ele in messageArr) {
        if(messageArr[ele] == '') messageArr.splice(ele, 1);
    }

    query = messageArr.join(' ');

    for(i = 0; i < globdata.length - 1; ++i){
        if(globdata[i].name == query){
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
    //var setWanted = sentMessage.message.content.slice(15, sentMessage.message.content.length);
    var boosterString;
    var boosterArray = [];
    var cardNo;
    for(i = 0; i<14; ++i){
        if(i <= 9){
            cardNo = commonCards[Math.round(Math.random() * commonCards.length)];
        }
        else if(i > 9 && i <= 12){
            cardNo = uncommonCards[Math.round(Math.random() * uncommonCards.length)];
        }
        else{
            if(Math.random() < 0.05){
                cardNo = mythicRareCards[Math.round(Math.random() * mythicRareCards.length)];
            }
            else {
                cardNo = rareCards[Math.round(Math.random() * rareCards.length)];
            }
        }
        console.log(cardNo.name);
        boosterArray.push(`**${cardNo.name}** - ${cardNo.rarity}`);
    }
    console.log(boosterArray);
    boosterString = boosterArray.join('\n');
    //Preemptively create the cardEmbed
    //https://leovoel.github.io/embed-visualizer/ card embed sim
    var multiCardEmbed = {
        author: {
            name: `New booster has been popped`
        },
        title: `${sentMessage.message.author.username} opened a new booster pack`,
        description: `${boosterString}`,
        timestamp: new Date(),
        color: 0xd3d3d3,
        footer: {
            icon_url: `${sentMessage.message.author.avatarURL}`,
            text: `Booster requested by ${sentMessage.message.author.username}`
        },
    }

    //If the message sent is !ping send an embed containing this info
    sentMessage.message.channel.sendMessage('', false, multiCardEmbed);
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
            url: `*No image available*`
        },
        color: 0xd3d3d3,
        footer: {
            icon_url: `${sentMessage.message.author.avatarURL}`,
            text: `Card art by Anonymous`
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

        if(thisCard.imageUrl) cardEmbed.image.url = `${thisCard.imageUrl}`;
        if(thisCard.flavor) cardEmbed.description = `*${thisCard.flavor}*`;
        if(thisCard.artist) cardEmbed.footer.text = `Card art by ${thisCard.artist}`;
        if(thisCard.originalText){
            cardEmbed.fields[0].value = `${thisCard.originalText}`;
        }
        else{
            cardEmbed.fields[0].value = `${thisCard.text}`;
        }

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
    try{
        sentMessage.message.channel.sendMessage('', false, cardEmbed);
    } catch(e){
        sentMessage.message.channel.sendMessage(`Tell Kapa to fix it`);
        console.log(cardEmbed);
        console.log(e);
    }
}

function EmbedMultipleCards(sentMessage, cardArr){

    var cardEmbed = {
        author: {
            name: `A card has been retrieved`
        },
        title: `??`,
        description: `*No flavour text available*`,
        timestamp: new Date(),
        color: 0xd3d3d3,
        footer: {
            icon_url: `${sentMessage.message.author.avatarURL}`,
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

    sentMessage.message.channel.sendMessage('', false, cardEmbed);
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
