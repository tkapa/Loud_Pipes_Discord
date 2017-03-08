var Discordie = require("discordie");
var client = new Discordie();

client.connect({ token: "Mjg2NDI3NTk2MDI2MDE5ODQx.C5gmyA.EWk6RRGeTbV6KHSdc-7-y5DXov8" });

client.Dispatcher.on("GATEWAY_READY", e => {
  console.log("Connected as: " + client.User.username);
});

client.Dispatcher.on("MESSAGE_CREATE", e => {
  //console.log(`${e.message.author.username)}> ${e.message.content}`);
  RetFuckYou(e);
});

function RetFuckYou(e){
  if (e.message.content == "!ping") {
    //e.message.channel.sendMessage(`fuck you ${e.message.author.mention}`);
    e.message.channel.sendMessage('', false, {
      title: 'ABUNAI',
      description: 'You said !ping',
      color: 0x990000,
      footer: { text: 'That guy said !ping' },
      fields: [
        { name: 'Yeah boi', value: ':OHGOD:' }
      ]
    });
  }
}

function PullRandomCard(e){

}
