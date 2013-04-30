winston-email
=============

email transport logging for winston
using [nodemailer] [1]


install
------

```
$ npm install winston-email
```

usage
-----
add an email option to your logger

```javascript

var winston = require('winston');
require('winston-email');

winston.loggers.add('logger', {
  email: {
    from   : 'xxx',
    to     : 'xxx',
    service: 'Gmail',
    auth   : { user: 'xxx', pass: 'xxx'},
    tags   : ['your app'] //optional tags for the subject
  }
  // other transports
});

logger = winston.loggers.get('logger');
logger.info("info msg", {title:'optional title'});

```

test
----

```
FROM=<youremail> TO=<youremail> USER=<youremail> PASS=<your pwd> node test
```

[1]: https://github.com/andris9/nodemailer   "nodemailer"

