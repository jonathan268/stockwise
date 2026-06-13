import Sale from "../models/Sale.js";
import Organization from "../models/Organization.js";
import { getExchangeRates } from "./exchange.service.js";

export const generateInvoiceData = async (saleId, organizationId) => {
  const sale = await Sale.findOne({ _id: saleId, organizationId })
    .populate("items.product", "sku costPrice")
    .populate("soldBy", "firstName lastName")
    .lean();

  if (!sale) return null;

  const org = await Organization.findById(organizationId).lean();
  const rates = await getExchangeRates();
  const currency = org?.settings?.currency || "XAF";

  const items = sale.items.map((item) => ({
    ...item,
    vatRate: item.vatRate || 0,
    vatAmount: item.totalPrice * ((item.vatRate || 0) / 100),
    totalWithVAT: item.totalPrice * (1 + (item.vatRate || 0) / 100),
  }));

  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const totalVAT = items.reduce((s, i) => s + i.vatAmount, 0);

  return {
    invoiceNumber: `INV-${sale.saleNumber}`,
    saleNumber: sale.saleNumber,
    date: sale.createdAt,
    organization: {
      name: org.name,
      slug: org.slug,
      currency: org.settings?.currency,
      vatNumber: org.settings?.vatNumber || "",
    },
    customerName: sale.customerName || "Client",
    items,
    subtotal,
    vatRate: items[0]?.vatRate || 0,
    totalVAT,
    totalAmount: sale.totalAmount,
    totalWithVAT: subtotal + totalVAT,
    paymentMethod: sale.paymentMethod,
    soldBy: sale.soldBy ? `${sale.soldBy.firstName} ${sale.soldBy.lastName}` : "",
    currency,
    exchangeRates: rates,
  };
};

export const generateInvoiceHTML = async (saleId, organizationId) => {
  const data = await generateInvoiceData(saleId, organizationId);
  if (!data) return null;

  const fmt = (n) => new Intl.NumberFormat("fr-FR").format(Math.round(n));

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Facture ${data.invoiceNumber}</title>
<style>
  body { font-family: 'Inter', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #111; }
  .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
  .invoice-title { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
  table { width: 100%; border-collapse: collapse; margin: 24px 0; }
  th { background: #f3f4f6; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
  td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
  .totals { text-align: right; margin-top: 20px; }
  .totals p { margin: 4px 0; }
  .total-final { font-size: 20px; font-weight: 700; color: #2563eb; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; text-align: center; }
</style></head><body>
  <div class="header">
    <div><h1>StockWise</h1><p class="invoice-title">Facture</p></div>
    <div style="text-align: right;">
      <p style="font-weight: 700; font-size: 18px;">${data.invoiceNumber}</p>
      <p style="color: #6b7280; font-size: 14px;">${new Date(data.date).toLocaleDateString("fr-FR")}</p>
    </div>
  </div>
  <div style="margin-bottom: 24px;">
    <p><strong>Client :</strong> ${data.customerName}</p>
    <p><strong>Vendu par :</strong> ${data.soldBy}</p>
    <p><strong>Paiement :</strong> ${data.paymentMethod}</p>
  </div>
  <table>
    <thead><tr><th>Produit</th><th>Qté</th><th>PU</th><th>Total HT</th></tr></thead>
    <tbody>
      ${data.items.map((i) => `<tr><td>${i.productName}</td><td>${i.quantity}</td><td>${fmt(i.unitPrice)}</td><td>${fmt(i.totalPrice)}</td></tr>`).join("")}
    </tbody>
  </table>
  <div class="totals">
    <p>Sous-total HT : <strong>${fmt(data.subtotal)} XAF</strong></p>
    ${data.totalVAT > 0 ? `<p>TVA (${data.vatRate}%) : <strong>${fmt(data.totalVAT)} XAF</strong></p>` : ""}
    <p class="total-final">Total TTC : ${fmt(data.totalWithVAT || data.totalAmount)} XAF</p>
  </div>
  <div class="footer">
    <p>StockWise — Gestion de Stock Intelligente</p>
    <p>${data.organization.name} — ${data.organization.vatNumber ? `N° TVA: ${data.organization.vatNumber}` : ""}</p>
  </div>
</body></html>`;
};
