/****************************************\
        Loud_Pipes By Tylah Kapa
        <tylahkapa@gmail.com>
\****************************************/
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
var setUrlData = [{setName: null, setUrl: null}];

fs.readFile(`${__dirname}/cardList.json`, (err, data) => {
    if(err) return console.log(err);
    console.log(JSON.parse(data).length);
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
        client.Channels.get('216455483094073344').sendMessage(`You called?`);
        client.User.setGame('Neck Me Buddi');
        console.log(client.Channels);
        console.log(client.Users);
        console.log(client.Guilds)
});

client.Dispatcher.on("MESSAGE_CREATE", sentMessage => {
    if (sentMessage.message.content == "Yo pipes")
        sentMessage.message.channel.sendMessage(`Hello, ${sentMessage.message.author.mention}`);         //Greet user
    if (sentMessage.message.content == "!pickCard") RandomCard(sentMessage);                             //Random a card
    if(sentMessage.message.content.substring(0,9) == '!findCard')   FindCard(sentMessage);               //Find a specific card
    if(sentMessage.message.content.substring(0, 14) == '!buildBooster') BuildBoosterPack(sentMessage);   //Build a booster pack
    if(sentMessage.message.content == "Get over here") JoinVoice(sentMessage);

    //Should only be used if the data is needed again
    if (sentMessage.message.content == "PipesAuth-downloadCardSets")  CompileCards(sentMessage);
    if (sentMessage.message.content == "PipesAuth-saveCardSets")  GenJSON(sentMessage);
    if (sentMessage.message.content == "PipesAuth-scrapeSetData")  CompileSets(sentMessage);
    if (sentMessage.message.content == "PipesAuth-exportSetData")  ExportSets();
});
/*
    FUNCTIONS USED FOR PALYING MUSIC
*/
function JoinVoice(sentMessage){
    const guild = sentMessage.message.channel.guild;
    const channelToJoin = sentMessage.message.author.getVoiceChannel(guild);

    if(!channelToJoin){
        return sentMessage.message.channel.sendMessage(`Sorry, ${sentMessage.message.author.mention}, you need to join a voice channel first!`);
    }

    channelToJoin.join();
}

/*
    FUNCTIONS USED FOR MTG
*/
//Generates a random card from the database
function RandomCard(sentMessage){
  console.log(`We have ${globdata.length} cards`)
  var cardNo = Math.round(Math.random() * globdata.length);
  console.log(`CardNo is ` + cardNo);
  var thisCard = globdata[cardNo];

  EmbedSingleCardData(sentMessage, thisCard);
  sentMessage.message.delete();
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

    sentMessage.message.delete();
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
    sentMessage.message.delete();
}

/*
    FUNCTIONS AVAILABLE FOR EMBEDDING CARDS INTO MESSAGES
*/
//Build an embedded message to display a single card's info
function EmbedSingleCardData(sentMessage, thisCard){
    //Preemptively create the cardEmbed
    //https://leovoel.github.io/embed-visualizer/ card embed sim
    var cardEmbed = {
        author: {
            name: `A card has been retrieved`
        },
        title: `${thisCard.name}`,
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
                name: `${thisCard.originalType}`,
                value: `${thisCard.text}`
            },
            {
                name: `Set:`,
                value: `${thisCard.setName}`
            },
            {
                name: `Rarity:`,
                value: `${thisCard.rarity}`
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

//Build an embedded message for each card in an array
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
                value: `??`
            },
            {
                name: `Set:`,
                value: `${thisCard.setName}`
            },
            {
                name: `Rarity:`,
                value: `${thisCard.rarity}`
            }
        ]
    }

    sentMessage.message.channel.sendMessage('', false, cardEmbed);
}

/*
    FUNCTIONS USED FOR COMPILING A VALID DATABASE OF CARDS
*/
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

//Export all cards to a JSON file
function GenJSON(e) {
    if(globdata.length > 0){
        fs.writeFile(`${__dirname}/cardList.json`, JSON.stringify(globdata, null, 4), (err) => {
            if(err) return console.error(err);
            console.log('Updated the json file');
        });
      console.log('Finished Collecting data');
    }
    e.message.channel.sendMessage('There is no new data, use command !saveCardSets');
  }

//Find all available sets in the current database
function CompileSets(sentMessage){
    console.log(`Finding Sets`);

    for(i = 0; i < globdata.length - 1; ++i){
        console.log(globdata[i].setName);
        var setCheck = globdata[i].setName;
        var foundSet = false;

        for(setIndex = 0; setIndex<setUrlData.length; ++setIndex){
            console.log(setUrlData[setIndex].setName);
            if(setCheck == setUrlData[setIndex].setName){
                foundSet = true;
                console.log('I found a repeating set');
            }

            console.log(foundSet);
        }

        if(!foundSet){
            setUrlData.push({setName: setCheck, setUrl: null});
            console.log(setUrlData);
        }

        console.log(i);
    }
      console.log(`Done making setList`);
  }

//Export all sets found to a JSON file
function ExportSets(){
    if(setUrlData.length > 0){
        fs.writeFile(`${__dirname}/setLogoList.json`, JSON.stringify(setUrlData, null, 4), (err) => {
                if(err) return console.error(err);
                console.log('Updated the json file');
        });
        console.log('Finished Collecting data');
    }
  }
