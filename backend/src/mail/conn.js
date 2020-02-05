const nodemailer = require('nodemailer')

const createTransporter = async (mailObject) => {
    try {
        let transporter = await nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: 'intlstudenthelper@gmail.com', // generated ethereal user
              pass: process.env.EMAIL_PASSWORD // generated ethereal password
            },
            tls: {
                rejectUnauthorized: false
            }
          });

        var message = ''

        if(mailObject.type === 'Student') {
            message = 'Hi ' + mailObject.studentName + ',\n' + 'Your ride is now confirmed. Please find the ride details below:\n\n' + 
                            'From: ' + mailObject.from + '\n' + 'To: ' + mailObject.to +  '\n' +
                            'On: ' + mailObject.date + '\n' +
                            'At: ' + mailObject.time + '\n' +
                            'Seats Booked: ' + mailObject.seats + '\n' +
                            'Ride Provider: ' + mailObject.rideProviderName + '\n' +
                            'Ride Provider Email: ' + mailObject.rideProviderEmail + '\n' +
                            'Ride Provider Phone: ' + mailObject.rideProviderPhone + '\n\n' +
                            'Please contact the ride provider in advance.' + '\n\n' +
                            'Wish you a happy and safe ride.' +'\n\n' +
                            'Regards,' + '\n' + 'Student101 Team'
                            
        } else {
            message = 'Hi ' + mailObject.rideProviderName + ',\n' + 'A new student has booked your ride. Please find the ride details below:\n\n' + 
                            'From: ' + mailObject.from + '\n' + 'To: ' + mailObject.to +  '\n' +
                            'On: ' + mailObject.date + '\n' +
                            'At: ' + mailObject.time + '\n' +
                            'Student: ' + mailObject.studentName + '\n' +
                            'Seats Booked: ' + mailObject.seats + '\n' +
                            'Student Email: ' + mailObject.studentEmail + '\n' +
                            'Student Phone: ' + mailObject.studentPhone + '\n\n' +
                            'Please contact the student in advance.' + '\n\n' +
                            'Wish you a happy and safe ride.' +'\n\n' +
                            'Regards,' + '\n' + 'Student101 Team'

        }


        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"Student101 Team" <intlstudenthelper@gmail.com>', // sender address
            to: mailObject.toEmail, // list of receivers
            subject: "Ride Confirmed", // Subject line
            text: message, // plain text body
        });

        console.log("Message sent: %s", info.messageId);

    } catch (e) {
        console.log(e)
    }
}

module.exports = createTransporter