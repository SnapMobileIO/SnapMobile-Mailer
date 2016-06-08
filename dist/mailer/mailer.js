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
  }]);

  return Mailer;
}();

exports.default = Mailer;
