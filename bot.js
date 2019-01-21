const discord = require('discord.js');
const auth = require('./auth.json');
const quoter = require('./quoter');

const quotables = new discord.Client();

quotables.on('message', async message => {
    if (message.author.bot) return;
    if (message.channel.type !== 'text') return;

    if (message.content.startsWith(`"`)) quoter.storeQuote(message);

    else if (message.content.startsWith(`>>>`)) message.author.send(await quoter.getAllQuotes(message));

    else if (message.content.startsWith(`>>`)) {
        const quoteObj = await quoter.getQuote(message);
        const embed = new discord.RichEmbed()
            .setColor(`#702050`)
            .addField(`${quoteObj.quote}`, `~ ${quoteObj.saidBy}`)
            .setFooter(`Saved by ${quoteObj.storedBy} - ${quoteObj.storedAt}`);
        message.channel.send(embed);
    }

});

quotables.login(auth.token);
