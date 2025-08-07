import nodemailer from 'nodemailer';
// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async function (email, subject, message) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD
        },
    });

    //SEND MAIL WITH DEFINED TRANSPORT OBJECT 

    await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL,//sender email
        to: email,//user email
        subject, // subject line
        html: message //html body
    });

};

export default sendEmail