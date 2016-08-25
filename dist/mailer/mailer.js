'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _nodemailerSendgridTransport = require('nodemailer-sendgrid-transport');

var _nodemailerSendgridTransport2 = _interopRequireDefault(_nodemailerSendgridTransport);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var sendgridHelper = require('sendgrid').mail;
var sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);

var Mailer = function () {
  function Mailer() {
    var mailOptions = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Mailer);

    this.options = { auth: { api_key: process.env.SENDGRID_KEY } };
    this.mailOptions = mailOptions;
  }

  _createClass(Mailer, [{
    key: 'getHtml',
    value: function getHtml(templateContent, data) {
      var compiled = _lodash2.default.template(templateContent, { interpolate: /\{\{(.+?)\}\}/g });
      return compiled(data);
    }
  }, {
    key: 'sendMail',
    value: function sendMail(data) {
      var _this = this;

      if (this.mailOptions.html) {
        this.mailOptions.html = this.getHtml(this.mailOptions.html, data);
      }

      return new _bluebird2.default(function (resolve, reject) {
        var mailer = _nodemailer2.default.createTransport((0, _nodemailerSendgridTransport2.default)(_this.options));
        mailer.sendMail(_this.mailOptions, function (err, response) {
          if (err) {
            reject(err);
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('Email sent with options: ' + JSON.stringify(_this.mailOptions));
          }

          resolve(response);
        });
      });
    }

    /**
     * Sends a Sendgrid email with the Template ID
     * Defaults to process.env.FROM_EMAIL
     * @param  {Options} options the options for the email
     * @return {Promise} a promise of the email.
     */

  }, {
    key: 'sendMailFromTemplate',
    value: function sendMailFromTemplate(options) {

      if (!options || !options.templateId || !options.to) {
        return;
      }

      options.substitions = options.substitions || {};
      options.subject = options.subject || '';
      options.from = options.from || process.env.FROM_EMAIL;
      options.fromName = options.fromName || '';
      options.cc = options.cc || '';
      options.ccName = options.ccName || '';
      options.bcc = options.bcc || '';
      options.bccName = options.bccName || '';
      options.toName = options.toName || '';

      var mail = new sendgridHelper.Mail();
      mail.setFrom(sendgridHelper.Email(options.from, options.fromName));
      mail.setSubject(options.subject);
      mail.setTemplateId(options.templateId);
      var personalization = new sendgridHelper.Personalization();

      if (options.to.constructor === Array) {
        for (var i = options.to.length - 1; i >= 0; i--) {
          if (options.toName.constructor === Array && i < options.toName.length) {
            personalization.addTo(new sendgridHelper.Email(options.to[i], options.toName[i]));
          } else {
            personalization.addTo(new sendgridHelper.Email(options.to[i]));
          }
        }
      } else {
        personalization.addTo(new sendgridHelper.Email(options.to, options.toName));
      }

      if (options.cc.constructor === Array) {
        for (var i = options.cc.length - 1; i >= 0; i--) {
          if (options.ccName.constructor === Array && i < options.ccName.length) {
            personalization.addCc(new sendgridHelper.Email(options.cc[i], options.ccName[i]));
          } else {
            personalization.addCc(new sendgridHelper.Email(options.cc[i]));
          }
        }
      } else if (options.cc != '') {
        personalization.addCc(new sendgridHelper.Email(options.cc, options.ccName));
      }

      if (options.bcc.constructor === Array) {
        for (var i = options.bcc.length - 1; i >= 0; i--) {
          if (options.bccName.constructor === Array && i < options.bccName.length) {
            personalization.addBcc(new sendgridHelper.Email(options.bcc[i], options.bccName[i]));
          } else {
            personalization.addBcc(new sendgridHelper.Email(options.bcc[i]));
          }
        }
      } else if (options.bcc != '') {
        personalization.addBcc(new sendgridHelper.Email(options.bcc, options.bccName));
      }

      for (var key in options.substitions) {
        if (options.substitions.hasOwnProperty(key)) {
          personalization.addSubstitution(new sendgridHelper.Substitution('%' + key + '%', options.substitions[key]));
        }
      }

      mail.addPersonalization(personalization);
      var request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
      });

      return sendgrid.API(request).then(function (response) {
        console.log('Email template sent to ' + options.to + ',\n        from ' + options.from + ', subject ' + options.subject + '.');
      }).catch(function (err) {
        console.log(err);
      });
    }
  }]);

  return Mailer;
}();

exports.default = Mailer;