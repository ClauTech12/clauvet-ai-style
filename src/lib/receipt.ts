import { jsPDF } from "jspdf";
import { formatPrice } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/translations";

type OrderItem = {
  product_name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number | string;
};

type ShippingAddress = {
  full_name?: string;
  phone?: string;
  town?: string;
  address?: string;
  notes?: string;
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number | string;
  currency: string;
  shipping_address?: ShippingAddress | null;
};

const GOLD: [number, number, number] = [184, 149, 91];
const INK: [number, number, number] = [20, 20, 22];
const MUTED: [number, number, number] = [110, 110, 115];

export function generateReceiptPdf(order: Order, items: OrderItem[], locale: Locale = "en") {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 56;
  let y = 64;

  const ref = order.id.slice(0, 8).toUpperCase();
  const addr = order.shipping_address ?? {};
  const isFr = locale === "fr";

  // Header — brand
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text("Clauvèra", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text(
    isFr ? "870m D'ALTITUDE — BUEA, CAMEROUN" : "870M ABOVE SEA LEVEL — BUEA, CAMEROON",
    margin,
    y + 16
  );

  // Receipt label + ref, right aligned
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(isFr ? "REÇU DE COMMANDE" : "ORDER RECEIPT", pageWidth - margin, y - 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`#${ref}`, pageWidth - margin, y + 10, { align: "right" });
  doc.text(
    new Date(order.created_at).toLocaleDateString(isFr ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" }),
    pageWidth - margin,
    y + 24,
    { align: "right" }
  );

  y += 48;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 28;

  // Customer & delivery
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(isFr ? "CLIENT & LIVRAISON" : "CUSTOMER & DELIVERY", margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  if (addr.full_name) { doc.text(addr.full_name, margin, y); y += 15; }
  if (addr.phone) { doc.text(addr.phone, margin, y); y += 15; }
  if (addr.town) { doc.text(`${addr.town}${addr.address ? ` — ${addr.address}` : ""}`, margin, y); y += 15; }
  if (!addr.full_name && !addr.phone && !addr.town) {
    doc.setTextColor(...MUTED);
    doc.text(isFr ? "Aucun détail de livraison fourni." : "No delivery details provided.", margin, y);
    y += 15;
  }
  y += 14;

  // Status pill
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text((isFr ? "STATUT: " : "STATUS: ") + order.status.toUpperCase(), margin, y);
  y += 28;

  // Items table header
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);
  y += 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(isFr ? "ARTICLE" : "ITEM", margin, y);
  doc.text(isFr ? "QTÉ" : "QTY", pageWidth - margin - 140, y, { align: "right" });
  doc.text(isFr ? "TOTAL" : "TOTAL", pageWidth - margin, y, { align: "right" });
  y += 12;
  doc.setDrawColor(230, 230, 230);
  doc.line(margin, y, pageWidth - margin, y);
  y += 20;

  // Items rows
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  for (const item of items) {
    doc.setTextColor(...INK);
    const variant = [item.size, item.color].filter(Boolean).join(" · ");
    const nameLine = variant ? `${item.product_name} (${variant})` : item.product_name;
    const nameLines = doc.splitTextToSize(nameLine, pageWidth - margin * 2 - 170);
    doc.text(nameLines, margin, y);
    doc.text(String(item.quantity), pageWidth - margin - 140, y, { align: "right" });
    doc.text(formatPrice(Number(item.price) * item.quantity, locale, order.currency), pageWidth - margin, y, { align: "right" });
    y += 16 * nameLines.length + 6;
  }

  y += 10;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(margin, y, pageWidth - margin, y);
  y += 26;

  // Total
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(isFr ? "TOTAL" : "TOTAL", margin, y);
  doc.text(formatPrice(Number(order.total), locale, order.currency), pageWidth - margin, y, { align: "right" });
  y += 44;

  // Footer note — proof of purchase
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const note = isFr
    ? "Présentez ce reçu (avec une pièce d'identité) à la livraison ou au retrait de votre commande."
    : "Present this receipt (with ID) at delivery or pickup to confirm your order.";
  const noteLines = doc.splitTextToSize(note, pageWidth - margin * 2);
  doc.text(noteLines, margin, y);

  doc.save(`Clauvera-Receipt-${ref}.pdf`);
}
