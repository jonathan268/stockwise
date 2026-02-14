const nodemailer = require('nodemailer');

/**
 * Configuration transporter email
 */
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: utiliser service email réel
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Développement: utiliser Mailtrap ou console
    console.log('Mode développement: emails affichés en console');
    return null;
  }
};

/**
 * Templates email
 */
const emailTemplates = {
  emailVerification: (data) => ({
    subject: 'Vérifiez votre email',
    html: `
      <h2>Bonjour ${data.name},</h2>
      <p>Merci de vous être inscrit ! Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
      <a href="${data.verificationUrl}" style="display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">
        Vérifier mon email
      </a>
      <p>Ce lien expire dans 24 heures.</p>
      <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `
  }),
  
  passwordReset: (data) => ({
    subject: 'Réinitialisation de mot de passe',
    html: `
      <h2>Bonjour ${data.name},</h2>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous :</p>
      <a href="${data.resetUrl}" style="display: inline-block; padding: 10px 20px; background: #EF4444; color: white; text-decoration: none; border-radius: 5px;">
        Réinitialiser mon mot de passe
      </a>
      <p>Ce lien expire dans ${data.expiresIn}.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `
  }),
  
  welcome: (data) => ({
    subject: `Bienvenue ${data.name} !`,
    html: `
      <h2>Bienvenue ${data.name} ! 🎉</h2>
      <p>Votre compte a été créé avec succès.</p>
      <p>Commencez dès maintenant à gérer votre stock intelligemment avec notre IA.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard">Accéder au tableau de bord</a>
    `
  })
};

/**
 * Envoyer email
 */
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();
    
    // Si mode dev, juste logger
    if (!transporter) {
      console.log('📧 EMAIL (DEV MODE):');
      console.log('To:', to);
      console.log('Subject:', subject || emailTemplates[template](data).subject);
      console.log('Data:', data);
      return;
    }
    
    // Préparer contenu
    let emailContent;
    
    if (template && emailTemplates[template]) {
      emailContent = emailTemplates[template](data);
    } else {
      emailContent = { subject, html, text };
    }
    
    // Envoyer
    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'StockManager'} <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });
    
    console.log(` Email envoyé à ${to}`);
    
  } catch (error) {
    console.error(' Erreur envoi email:', error);
    throw error;
  }
};

module.exports = { sendEmail };