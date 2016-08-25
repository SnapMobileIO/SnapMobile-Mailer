'use strict';

import _ from 'lodash';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import Promise from 'bluebird';
let sendgridHelper = require('sendgrid').mail;
let sendgrid = require('sendgrid')(process.env.SENDGRID_KEY);

class Mailer {

  constructor(mailOptions = {}) {
    this.options = { auth: { api_key: process.env.SENDGRID_KEY } };
    this.mailOptions = mailOptions;
  }

  getHtml(templateContent, data) {
    let compiled = _.template(templateContent, { interpolate: /\{\{(.+?)\}\}/g });
    return compiled(data);
  }

  sendMail(data) {
    if (this.mailOptions.html) {
      this.mailOptions.html = this.getHtml(this.mailOptions.html, data);
    }

    return new Promise((resolve, reject) => {
      var mailer = nodemailer.createTransport(sendgridTransport(this.options));
      mailer.sendMail(this.mailOptions, (err, response) => {
        if (err) { reject(err); }

        if (process.env.NODE_ENV === 'development') {
          console.log('Email sent with options: ' + JSON.stringify(this.mailOptions));
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
  sendMailFromTemplate(options) {

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

    let mail = new sendgridHelper.Mail();
    mail.setFrom(sendgridHelper.Email(options.from, options.fromName));
    mail.setSubject(options.subject);
    mail.setTemplateId(options.templateId);
    let personalization = new sendgridHelper.Personalization();

    if (options.to.constructor === Array) {
      for (var i = options.to.length - 1; i >= 0; i--) {
        if (options.toName.constructor === Array &&
          i < options.toName.length) {
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
        if (options.ccName.constructor === Array &&
          i < options.ccName.length) {
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
        if (options.bccName.constructor === Array &&
          i < options.bccName.length) {
          personalization.addBcc(new sendgridHelper.Email(options.bcc[i], options.bccName[i]));
        } else {
          personalization.addBcc(new sendgridHelper.Email(options.bcc[i]));
        }
      }
    } else if (options.bcc != '') {
      personalization.addBcc(new sendgridHelper.Email(options.bcc, options.bccName));
    }

    for (let key in options.substitions) {
      if (options.substitions.hasOwnProperty(key)) {
        personalization.addSubstitution(new sendgridHelper.Substitution(`%${key}%`,
          options.substitions[key]));
      }
    }

    mail.addPersonalization(personalization);
    let request = sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    return sendgrid.API(request).then((response) => {
      console.log(`Email template sent to ${options.to},
        from ${options.from}, subject ${options.subject}.`);
    }).catch((err) => {
      console.log(err);
    });
  }
}

export default Mailer;
