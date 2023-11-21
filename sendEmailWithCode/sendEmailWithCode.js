const nodemailer = require('nodemailer');

function generateUniqueCode(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const email = 'mindwellnesspro@gmail.com';
const password = 'suuq zwnd iiiy wtam';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass: password,
  },
});

function sendEmailWithCode(userEmail) {
  return new Promise((resolve, reject) => {
    const uniqueCode = generateUniqueCode(10);
    const mailOptions = {
      from: email,
      to: userEmail,
      subject: 'Your Test Report Code',
      text: `Hello,\n\nYour unique code to download the report is: ${uniqueCode}\n\nRegards,\nMindWellnessPro team`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        console.log('Email sent: ' + info.response);
        resolve({ code: uniqueCode, response: info.response }); // Resolve with both code and email response
      }
    });
  });
}

module.exports = sendEmailWithCode;
