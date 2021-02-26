/* eslint-disable no-unused-expressions */
import nodeMailer, { Transporter } from 'nodemailer';
import handleBars from 'handlebars';
import fs from 'fs';

class SendEmailService {
  private client: Transporter

  constructor() {
    nodeMailer.createTestAccount()
      .then((account) => {
        const transporter = nodeMailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });

        this.client = transporter;
      })
      .catch((err) => console.log(err));
  }

  async execute(to:string, subject:string, variables:object, path:string) {
    const fileContent = fs.readFileSync(path).toString('utf-8');

    const mailTemplateParse = handleBars.compile(fileContent);

    const html = mailTemplateParse(variables);

    const message = await this.client.sendMail({
      to,
      subject,
      html,
      from: 'NPS <noreplay@nps.com.br>',
    });

    console.log('Message sent: %s', message.messageId);
    console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(message));
  }
}

export default new SendEmailService();
