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
        if (Object.entries(quoteObj).length === 0) {
            return;
        }
        const embed = quoteObj.quote.startsWith(`http`)
            ? new discord.RichEmbed()
                .setColor(`#702050`)
                .setImage(`${quoteObj.quote}`)
                .setFooter(`Saved by ${quoteObj.storedBy} - ${quoteObj.storedAt}`)
            : new discord.RichEmbed()
                .setColor(`#702050`)
                .addField(`${quoteObj.quote}`, `${quoteObj.saidBy ? '~ ' : ''}${quoteObj.saidBy}`)
                .setFooter(`Saved by ${quoteObj.storedBy} - ${quoteObj.storedAt}`)
        message.channel.send(embed);
    }
});

quotables.on('error', async err => {
    console.log(err);
});

quotables.login(auth.token);
