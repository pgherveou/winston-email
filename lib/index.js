var util = require('util')
  , winston = require('winston')
  , nodemailer = require('nodemailer');

/**
 * module exports
 */

module.exports = winston.transports.Email = Email;

/**
 * Email transport constructor
 */

function Email(options) {
  winston.Transport.apply(this, arguments);

  if (!options) options = {};
  this.to = options.to;
  this.from = options.from;

  if (!(this.to && this.from)) {
    throw new Error("Winston-email Specify to and from");
  }

  if (options.tags) {
    this.tags = options.tags.map(function(tag) {
      return "[" + tag + "] ";
    }).join('');
  }

  this.smtpTransport = nodemailer.createTransport('SMTP', {
    service: options.service,
    auth: {
      user: options.auth.user,
      pass: options.auth.pass
    }
  });
}

/**
 * inherit winston transport
 */

util.inherits(Email, winston.Transport);


/**
 * transport name
 */

Email.prototype.name = 'email';

/**
 * log data
 *
 * @param  {String}   level [description]
 * @param  {String}   msg   [description]
 * @param  {Object}   meta  [description]
 * @param  {Function} cb    [description]
 *
 * @api public
 */

Email.prototype.log = function(level, msg, meta, cb) {
  if (this.silent) return cb(null, true);
  if (!msg) msg = '';

  var text = msg.toString()
    , subject = "" + (this.tags || '') + "[" + level + "] " + text.slice(0, 51);

  if (meta) text += "\n---\n" + util.inspect(meta);

  this.smtpTransport.sendMail({
    from: this.from,
    to: this.to,
    subject: subject,
    text: text
  }, cb);
};
