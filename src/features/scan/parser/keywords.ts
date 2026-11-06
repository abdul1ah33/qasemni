/**
 * Keyword rules (English + Arabic) used to classify each receipt line.
 * Order matters: the first rule that matches wins.
 */
export type LineKind =
  | 'ignore'
  | 'subtotal'
  | 'total'
  | 'tax'
  | 'service'
  | 'delivery'
  | 'tip'
  | 'discount'
  | 'item';

const rules: Array<[LineKind, RegExp]> = [
  // Payment, metadata & noise lines — never items.
  [
    'ignore',
    /\b(cash|change|visa|master\s*card|mastercard|credit|debit|card|paid|tender(ed)?|tel|phone|mobile|fax|invoice|receipt\s*(no|#)|order\s*(no|#|id)|bill\s*(no|#)|check\s*(no|#)|table|cashier|server|waiter|guest|covers?|thank|www|http|rounding|reg(istration)?\s*(no|#)|tax\s*(id|no|#|reg)|vat\s*(no|#|reg)|cr\s*no|no\s*of\s*items|items?\s*count|total\s*(items?|qty)|qty\s*total)\b|@|كاش|نقد[اًي]?|الباقي|المتبقي|فيزا|بطاقة|هاتف|تليفون|ت\s*:|فاتورة\s*رقم|رقم\s*الفاتورة|رقم\s*الطلب|طاولة|ترابيزة|الكاشير|شكرا|نشكركم|التاريخ|الوقت|السجل\s*التجاري|البطاقة\s*الضريبية|رقم\s*التسجيل|عدد\s*الأصناف/i,
  ],
  // Column headers ("Item  Qty  Price").
  ['ignore', /^(item|description|qty|quantity|price|amount|الصنف|البيان|الكمية|السعر|القيمة)(\s+(item|description|qty|quantity|price|amount|total|الصنف|البيان|الكمية|السعر|القيمة|الإجمالي|الاجمالي))+\s*$/i],
  ['subtotal', /\bsub\s*-?\s*total\b|\bnet\s*amount\b|المجموع\s*الفرعي|قبل\s*الضريبة|الإجمالي\s*الفرعي|الاجمالي\s*الفرعي|^المجموع\b/i],
  ['total', /\b(incl(uding|\.)?|inc\.)\b.*\b(vat|tax)\b|شامل/i],
  ['tax', /\b(vat|tax(es)?|gst)\b|ضريبة|الضريبة|ض\.?\s?ق\.?\s?م|القيمة\s*المضافة/i],
  ['service', /\b(service|svc|srv|serv\.?)\b|خدمة|الخدمة|خدمه/i],
  ['delivery', /\bdeliver(y|ies)?\b|توصيل|التوصيل|شحن/i],
  ['tip', /\b(tips?|gratuity)\b|بقشيش|إكرامية|اكرامية/i],
  ['discount', /\b(discount|disc|promo|offer|coupon|voucher)\b|خصم|الخصم|تخفيض|عرض/i],
  ['total', /\b(grand\s*total|total|net\s*total|amount\s*due|balance\s*due|to\s*pay|net)\b|الإجمالي|الاجمالي|إجمالي|اجمالي|الصافي|المطلوب|الجملة|المجموع\s*الكلي/i],
];

export function classifyLine(line: string): LineKind {
  for (const [kind, re] of rules) if (re.test(line)) return kind;
  return 'item';
}
