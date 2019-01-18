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
    const num = message.content.match(/[0-9]+/)[0] || 0;
    return readQuote(num);
};

const readQuote = async number => {
    const quotes = fs.readFileSync('quotes', {encoding: 'utf8'}).split(`\n`);

    const random = number <= 0 || number > quotes.length;
    if (random) number = Math.floor(Math.random() * quotes.length);
    else --number;

    const quoteArr = quotes[number].split(`|`);
    const quoteObj = {
        quote: quoteArr[0],
        saidBy: quoteArr[1],
        saidAt: quoteArr[2],
        storedBy: quoteArr[3],
        storedAt: quoteArr[4]
    };
    logger.info(`Retrieved quote #${number} ${random ? 'randomly' : ''}:`);
    logger.info(quotes[number]);
    return quoteObj;
};
