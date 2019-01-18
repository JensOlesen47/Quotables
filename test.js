const quoter = require('./quoter');

const message = {
    content: `"Why were they attacking such a.... face?!?!" -Dallas 2019`,
    author: { username: `Micof` }
};
quoter.storeQuote(message);

quoter.getQuote(message);