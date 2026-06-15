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

const baseTemplate = (title, content) => `
  <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 28px 24px; text-align: center; border-radius: 16px 16px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 22px; letter-spacing: -0.5px;">StockWise</h1>
    </div>
    <div style="padding: 36px 32px; background: #ffffff; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: 0;">
      <h2 style="margin-top: 0; color: #111827; font-size: 20px;">${title}</h2>
      ${content}
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">StockWise — Gestion de Stock Intelligente</p>
    </div>
  </div>
`;

export const sendWelcomeEmail = async (user) => {
  await sendMail({
    to: user.email,
    subject: "Bienvenue sur StockWise 🎉",
    html: baseTemplate("Bonjour " + user.firstName + " 👋", `
      <p style="line-height: 1.7; color: #374151;">Bienvenue sur StockWise, votre solution intelligente de gestion de stock.</p>
      <p style="line-height: 1.7; color: #374151;">Vous bénéficiez actuellement d'un <strong>essai gratuit de 30 jours</strong> avec toutes les fonctionnalités Pro.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard"
           style="background: #2563eb; color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block;">
          Accéder au tableau de bord →
        </a>
      </div>
    `),
  });
};

export const sendLowStockAlertEmail = async (user, org, product) => {
  await sendMail({
    to: user.email,
    subject: `🔴 Alerte stock : ${product.name}`,
    html: baseTemplate("Alerte Stock — " + product.name, `
      <p style="line-height: 1.7; color: #374151;">Le produit <strong>${product.name}</strong> (SKU: ${product.sku || "N/A"}) dans l'organisation <strong>${org.name}</strong> est en situation critique.</p>
      <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px; font-weight: 600;">Stock actuel : <span style="color: #dc2626; font-size: 20px;">${product.currentStock}</span></p>
        <p style="margin: 0; color: #6b7280;">Seuil minimum : ${product.minimumStock}</p>
      </div>
      <div style="text-align: center;">
        <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/products"
           style="background: #2563eb; color: white; padding: 12px 28px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block;">
          Voir les produits →
        </a>
      </div>
    `),
  });
};

export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/auth/reset/${resetToken}`;
  await sendMail({
    to: user.email,
    subject: "Réinitialisation de mot de passe StockWise",
    html: baseTemplate("Réinitialisation de mot de passe", `
      <p style="line-height: 1.7; color: #374151;">Vous avez demandé la réinitialisation de votre mot de passe StockWise.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}"
           style="background: #2563eb; color: white; padding: 14px 36px; text-decoration: none; border-radius: 10px; font-weight: 600; display: inline-block;">
          Réinitialiser mon mot de passe →
        </a>
      </div>
      <p style="color: #9ca3af; font-size: 14px;">Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `),
  });
};

export const sendDailyReportEmail = async (user, org, stats) => {
  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(n || 0);
  await sendMail({
    to: user.email,
    subject: `📊 Rapport quotidien — ${org.name}`,
    html: baseTemplate("Rapport Quotidien — " + new Date().toLocaleDateString("fr-FR"), `
      <p style="line-height: 1.7; color: #374151;">Voici le résumé de votre activité pour aujourd'hui.</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0;">
        <div style="background: #f0fdf4; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 0;">${fmt(stats.salesCount)}</p>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Ventes</p>
        </div>
        <div style="background: #eff6ff; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #2563eb; margin: 0;">${fmt(stats.revenue)} XAF</p>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Revenu</p>
        </div>
        <div style="background: #fefce8; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #eab308; margin: 0;">${fmt(stats.lowStock)}</p>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Stock faible</p>
        </div>
        <div style="background: #fef2f2; border-radius: 12px; padding: 16px; text-align: center;">
          <p style="font-size: 24px; font-weight: 700; color: #dc2626; margin: 0;">${fmt(stats.outOfStock)}</p>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0;">Ruptures</p>
        </div>
      </div>
    `),
  });
};

