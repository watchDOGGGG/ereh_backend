import nodemailer from 'nodemailer';

export async function sendMail(receiver, link1, link2){
    
    // Create a transport
    const transporter = nodemailer.createTransport({
        host: 'mail.atkas.online',
        port: 465,
        secure: true,
        auth: {
          user: 'headward@atkas.online',
          pass: 'headward@atkas.online'
        }
      });
  
  // Define the email options
  const mailOptions = {
    from: 'headward@atkas.online',
    to: `${receiver}`,
    subject: 'Forgot password',
    text: `click the link to reset your password <br/> ${link1}<br/> ${link2}`
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log(error)
      return false
    } else {
     return true
    }
  });
  
}