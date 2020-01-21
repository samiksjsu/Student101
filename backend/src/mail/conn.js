const nodemailer = require('nodemailer')

const createTransporter = async (mailObject) => {
    try {
        let transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: 'intlstudenthelper@gmail.com', // generated ethereal user
              pass: '!Qwerty63!' // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
          });

          // send mail with defined transport object
            let info = await transporter.sendMail({
                from: '"Student101 Team" <intlstudenthelper@gmail.com>', // sender address
                to: mailObject, // list of receivers
                subject: "Ride Confirmed", // Subject line
                text: "Your ride has been confirmed", // plain text body
            });

            console.log("Message sent: %s", info.messageId);

    } catch (e) {
        console.log(e)
    }
}

module.exports = createTransporter