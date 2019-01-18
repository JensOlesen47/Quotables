const fs = require('fs');
const moment = require('moment');

const logger = require('winston');
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, { colorize: true });
logger.level = 'debug';

module.exports.storeQuote = async message => {
    const content = message.content;
    const endOfQuote = content.indexOf(`"`, 2);
    const quote = content.substring(1, endOfQuote).replace(/|/g, '');
    logger.info(`Deduced quote: ${quote}`);

    const afterQuote = content.substring(endOfQuote + 1).replace(/[-~]/, '').replace(/[0-9/|]/g, '').trim();
    logger.info(`Accreditation: ${afterQuote}`);

    const now = moment().format(`MMM Do YYYY h:mm a`);
    logger.info(`Stored by ${message.author.username} on ${now}`);

    // this array represents [ quote, saidBy, saidAt, storedBy, storedAt ]
    const storableQuote = [ quote, afterQuote, now, message.author.username, now ].join(`|`) + `\n`;

    fs.appendFile('quotes', storableQuote, {encoding: 'utf8'}, err => {
        if (err) throw err;
        logger.info(`Stored new quote: ${storableQuote}`);
    });
};

module.exports.getQuote = async message => {
    const num = (message.content.match(/[0-9]+/) || [])[0] || 0;
    const searchTerm = message.content.substring(2).trim();
    return await readQuote(num, searchTerm);
};

const readQuote = async (number, searchTerm) => {
    const quotes = fs.readFileSync('quotes', {encoding: 'utf8'}).split(`\n`);

    let quote;
    if (number && number <= quotes.length) {
        quote = quotes[number - 1];
    } else if (searchTerm) {
        const matchingQuotes = quotes.filter(q => q.includes(searchTerm));
        quote = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
    } else {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    logger.info(`Retrieved quote: ${quote}`);

    const quoteArr = quote.split(`|`);
    const quoteObj = {
        quote: quoteArr[0],
        saidBy: quoteArr[1],
        saidAt: quoteArr[2],
        storedBy: quoteArr[3],
        storedAt: quoteArr[4]
    };
    return quoteObj;
};
