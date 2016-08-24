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
     * @param  {String} to          the to email
     * @param  {String} from        the from email
     * @param  {String} subject     the email subject
     * @param  {String} templateId  the Sendgrid template ID
     * @param  {Array} substitions  an array of substitions
     * @return {Promise}            a promise of the email.
     */

  }, {
    key: 'sendMailFromTemplate',
    value: function sendMailFromTemplate(to, from, subject, templateId, substitions) {
      var mail = new sendgridHelper.Mail();
      mail.setFrom(sendgridHelper.Email(from));
      mail.setSubject(subject);
      mail.setTemplateId(templateId);
      var personalization = new sendgridHelper.Personalization();
      personalization.addTo(new sendgridHelper.Email(to));

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = substitions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var substition = _step.value;

          personalization.addSubstitution(new sendgridHelper.Substitution('%' + substition.name + '%', substition.value));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      mail.addPersonalization(personalization);
      var request = sendgrid.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: mail.toJSON()
      });

      return sendgrid.API(request).then(function (response) {
        console.log('Email template sent to ' + to + ', from ' + from + ', subject ' + subject + '.');
      }).catch(function (err) {
        console.log(err);
      });
    }
  }]);

  return Mailer;
}();

exports.default = Mailer;
