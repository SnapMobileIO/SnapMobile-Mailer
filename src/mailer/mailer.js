'use strict';

import _ from 'lodash';
import nodemailer from 'nodemailer';
import sendgridTransport from 'nodemailer-sendgrid-transport';
import Promise from 'bluebird';

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
}

export default Mailer;
