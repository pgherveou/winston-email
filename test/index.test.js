"use strict";

var _ = require("lodash")
  , chai = require("chai")
  , expect = chai.expect
  , sinon = require("sinon")
  , winston = require("winston")
  , nodemailer = require('nodemailer')
  , stubTransport = require("nodemailer-stub-transport");

chai.use(require("chai-as-promised"));
chai.use(require("sinon-chai"));

require("../lib/index.js");

describe("winston-email", function () {
  var options, logger, mockMeta, mockEmailTransport, spy;

  before(function () {
    spy = sinon.spy(nodemailer, "createTransport");
  });

  beforeEach(function () {
    spy.reset();
    options = {
      to: "sender@example.com",
      from: "recipient@example.com"
    };

    setupLogger();

    mockMeta = {
      number: 123
    };
  });

  it("Should send an info message as email", function () {
    return expect(log("info", "My test info message", mockMeta))
      .to.eventually.be.fulfilled
      .and.then(function () {
        expect(nodemailer.createTransport).to.have.been.called;
        expect(mockEmailTransport.send).to.have.been.called;
      });
  });

  it("Should send an error as email", function () {
    var errorToBeLogged = new Error("test");
    return expect(log("error", errorToBeLogged, {error: errorToBeLogged}))
      .to.eventually.be.fulfilled
      .and.then(function () {
        expect(nodemailer.createTransport).to.have.been.called;
        expect(mockEmailTransport.send).to.have.been.called;
      });
  });

  it("should fail on email errors", function () {
    setupLogger(undefined, {
      error: new Error('Some email error')
    });
    return expect(log("info", "My test info message", mockMeta))
      .to.be.rejected
      .and.then(function () {
        expect(nodemailer.createTransport).to.have.been.called;
        expect(mockEmailTransport.send).to.have.been.called;
      });
  });

  // Fix https://github.com/pgherveou/winston-email/issues/5
  describe("#5 Only 'service' and 'auth' options were forwarded to nodemailer", function() {
    it("should pass service and auth options to nodemailer", function() {
      setupLogger({
        service: "Gmail",
        auth   : { user: "me", pass: "superSecretPassword" }
      });

      return expect(log("info", "My test info message"))
        .to.eventually.be.fulfilled
        .and.then(function () {
          expect(nodemailer.createTransport).to.have.been.calledWithMatch({
            service: "Gmail",
            auth   : { user: "me", pass: "superSecretPassword" }
          });
        });
    });

    it("should pass host and port options to nodemailer", function() {
      setupLogger({
        host: "mail.example.com",
        port: 123,
        auth   : { user: "me again", pass: "superSecretPassword" }
      });

      return expect(log("info", "My test info message"))
        .to.eventually.be.fulfilled
        .and.then(function () {
          expect(nodemailer.createTransport).to.have.been.calledWithMatch({
            host: "mail.example.com",
            port: 123,
            auth   : { user: "me again", pass: "superSecretPassword" }
          });
        });
    });
  });


  function setupLogger(extraOptions, transportOptions) {
    mockEmailTransport = stubTransport(transportOptions);
    sinon.spy(mockEmailTransport, "send");
    logger = new (winston.Logger)({
      level: "info",
      transports: [
        new (winston.transports.Email)(_.assign(mockEmailTransport, options, extraOptions))
      ]
    });
  }

  function log(level, message, meta) {
    return new Promise(function (resolve, reject) {
      logger.log(level, message, meta, function (err /*, level, msg, meta*/) {
        if (err) reject(err);
        resolve(Array.prototype.slice.call(arguments, 1));
      });
    })
  }
});
