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
   * @param  {String} to          the to email
   * @param  {String} from        the from email
   * @param  {String} subject     the email subject
   * @param  {String} templateId  the Sendgrid template ID
   * @param  {Array} substitions  an array of substitions
   * @return {Promise}            a promise of the email.
   */
  sendMailFromTemplate(to, from, subject, templateId, substitions) {
    let mail = new sendgridHelper.Mail();
    mail.setFrom(sendgridHelper.Email(from));
    mail.setSubject(subject);
    mail.setTemplateId(templateId);
    let personalization = new sendgridHelper.Personalization();
    personalization.addTo(new sendgridHelper.Email(to));

    for (let substition of substitions) {
      personalization.addSubstitution(new sendgridHelper.Substitution(`%${substition.name}%`,
        substition.value));
    }

    mail.addPersonalization(personalization);
    let request = sendgrid.emptyRequest({
      method: 'POST',
      path: '/v3/mail/send',
      body: mail.toJSON()
    });

    return sendgrid.API(request).then((response) => {
      console.log(`Email template sent to ${to}, from ${from}, subject ${subject}.`);
    }).catch((err) => {
      console.log(err);
    });
  }
}

export default Mailer;
