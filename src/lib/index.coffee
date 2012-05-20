util       = require 'util'
winston    = require 'winston'
nodemailer = require 'nodemailer'


class winston.transports.Email extends winston.Transport

  name: 'email'

  constructor: (options = {}) ->
    super
    {@to, @from} = options
    throw new Error "Winston-email Specify to and from" unless @to and @from

    @smtpTransport = nodemailer.createTransport 'SMTP',
        service: options.service
        auth:
            user: options.auth.user
            pass: options.auth.pass


  log: (level, msg = '', meta, cb) ->

    cb null, true if @silent
    subject = "[#{level}] #{msg[0..50]}"
    text    = msg
    msg    += "---\n#{util.inspect meta, null, 5}" if meta

    @smtpTransport.sendMail {@from, @to, subject, text}, cb
