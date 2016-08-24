# SnapMobile-Mailer

# Usage

Include this private module by adding the following under `dependencies` in `package.json`, and run `npm install`.

    "snapmobile-mailer": "git+ssh://@github.com/SnapMobileIO/SnapMobile-Mailer.git",

To configure, add the following when using the module:

	import fs from 'fs';
	import path from 'path';
    import 'snapmobile-mailer';
    
	let mailOptions = {
        to: "example@example.com",
        subject: 'Example',
        html: fs.readFileSync(path.resolve(__dirname, './views/example.html'), 'UTF-8'),
      };

      let data = {
        req: req,
        user: user,
      };

      let mailer = new Mailer(mailOptions);

      return mailer.sendMail(data)
        .then(response => {
          return res.status(200).json({
            message: 'Success.'
          });
        })
        .catch(utils.handleError(next));
        
### Sending from SendGrid templates

To send from a SendGrid template:

```
let mailer = new Mailer();
  mailer.sendMailFromTemplate('to@gmail.com', 'from@example.com',
    'Subject', 'template_id', [{
      name: 'substitution1', /* in template as %substitution1% */
      value: 'Referral Complete',
    }, ...
    ]);
```

# Updating

Make any changes in `/src`.

Once changes are completed, run `gulp dist` to process JavaScript files and add to `/dist`.
