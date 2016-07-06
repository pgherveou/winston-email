var winston = require('winston');
require('..');

var from = process.env.FROM,
    to = process.env.TO,
    user = process.env.USER,
    pass = process.env.PASS;

if (!(from && to && user && pass))
  throw new Error('missing from, to, user, pass env');

winston.loggers.add('logger', {
  email: {
    from   : from,
    to     : to,
    service: 'Gmail',
    auth   : { user: user, pass: pass},
    tags   : ['your app'] //optional tags for the subject
  }
  // other transports
});

logger = winston.loggers.get('logger');
logger.info("info msg", {title:'optional title'}, function () {
  console.log(arguments);
});
