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

    // this array represents [ quote, saidBy, storedBy, storedAt ]
    const storableQuote = [ quote, afterQuote, message.author.username, now ].join(`|`) + `\n`;

    fs.appendFile('quotes', storableQuote, {encoding: 'utf8'}, err => {
        if (err) throw err;
        logger.info(`Stored new quote: ${storableQuote}`);
    });
};

module.exports.getQuote = async message => {
    const number = (message.content.match(/[0-9]+/) || [])[0] || 0;
    const searchTerm = message.content.substring(2).trim().toLowerCase();
    const quotes = fs.readFileSync('quotes', {encoding: 'utf8'}).split(`\n`);

    let quote;
    if (number && number <= quotes.length) {
        quote = quotes[number - 1];
    } else if (searchTerm) {
        const matchingQuotes = quotes.filter(q => q.toLowerCase().includes(searchTerm));
        if (matchingQuotes.length === 0) {
            logger.info(`Could not find quote matching search term [${searchTerm}]`);
            return {};
        }
        quote = matchingQuotes[Math.floor(Math.random() * matchingQuotes.length)];
    } else {
        quote = quotes[Math.floor(Math.random() * quotes.length)];
    }
    logger.info(`Retrieved quote: ${quote}`);

    const quoteArr = quote.split(`|`);
    const quoteObj = {
        quote: quoteArr[0],
        saidBy: quoteArr[1],
        storedBy: quoteArr[2],
        storedAt: quoteArr[3]
    };
    return quoteObj;
};

module.exports.getAllQuotes = async message => {
    logger.info(`Getting all quotes for ${message.author.username}`);
    const quotes = fs.readFileSync('quotes', {encoding: 'utf8'}).split(`\n`);

    // remove empty line at eof
    quotes.pop();

    return quotes.map(q => {
        const quoteArr = q.split('|');
        return `"${quoteArr[0]}" ~ ${quoteArr[1]}`;
    }).join(`\n`);
};
