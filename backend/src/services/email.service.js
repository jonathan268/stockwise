import nodemailer from "nodemailer";
import logger from "../utils/logger.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;

  if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
    logger.warn("Email non configuré — les emails ne seront pas envoyés");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT) || 587,
    secure: Number(MAIL_PORT) === 465,
    auth: { user: MAIL_USER, pass: MAIL_PASS },
  });

  return transporter;
};

const sendMail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  if (!transport) return;

  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM || "StockWise <noreply@stockwise.app>",
      to,
      subject,
      html,
    });
    logger.info(`Email envoyé à ${to} — ${subject}`);
  } catch (error) {
    logger.error(`Échec envoi email à ${to}: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (user) => {
  await sendMail({
    to: user.email,
    subject: "Bienvenue sur StockWise 🎉",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">StockWise</h1>
        </div>
        <div style="padding: 32px; background: #f9fafb; border-radius: 0 0 12px 12px;">
          <h2 style="margin-top: 0;">Bonjour ${user.firstName} 👋</h2>
          <p style="line-height: 1.6; color: #374151;">Bienvenue sur StockWise, votre solution intelligente de gestion de stock.</p>
          <p style="line-height: 1.6; color: #374151;">Vous bénéficiez actuellement d'un <strong>essai gratuit de 30 jours</strong> avec toutes les fonctionnalités Pro.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
               style="background: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Accéder au tableau de bord
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">L'équipe StockWise</p>
        </div>
      </div>
    `,
  });
};
