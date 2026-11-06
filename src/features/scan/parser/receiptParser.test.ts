import { describe, expect, it } from 'vitest';
import { parseItemLine, parseReceiptText } from './receiptParser';
import { SAMPLE_RECEIPT_TEXT } from '../sampleReceipt';

describe('parseItemLine', () => {
  it('reads "qty x name price"', () => {
    expect(parseItemLine('2 x Koshari Bowl 150.00')).toEqual({ name: 'Koshari Bowl', quantity: 2, price: 15000 });
  });
  it('reads "name qty unit total" columns', () => {
    expect(parseItemLine('Mango Juice 2 45.00 90.00')).toEqual({ name: 'Mango Juice', quantity: 2, price: 9000 });
  });
  it('keeps numbers glued to letters as part of the name', () => {
    expect(parseItemLine('Pepsi 330ml 15.00 EGP')?.name).toBe('Pepsi 330ml');
  });
  it('handles Arabic text and Arabic-Indic digits', () => {
    expect(parseItemLine('كشري كبير ٧٥٫٥٠')).toEqual({ name: 'كشري كبير', quantity: 1, price: 7550 });
  });
  it('rejects lines without a name', () => {
    expect(parseItemLine('150.00')).toBeNull();
  });
});

describe('parseReceiptText', () => {
  it('parses the sample receipt', () => {
    const r = parseReceiptText(SAMPLE_RECEIPT_TEXT);
    expect(r.merchant).toBe('ZOOBA KITCHEN');
    expect(r.items.map((i) => i.name)).toEqual([
      'Koshari Bowl',
      'Taameya Sandwich',
      'Fiteer Meshaltet',
      'Hawawshi',
      'Fresh Mango Juice',
      'Om Ali',
    ]);
    expect(r.items.reduce((a, i) => a + i.price, 0)).toBe(70000);
    expect(r.subtotal).toBe(70000);
    expect(r.extras).toEqual([
      { kind: 'service', label: 'Service', amount: 8400 },
      { kind: 'tax', label: 'VAT', amount: 10976 },
    ]);
    expect(r.total).toBe(89376);
  });

  it('parses an Arabic receipt', () => {
    const r = parseReceiptText(`مطعم أبو طارق
فول بالزيت ٣٥٫٠٠
طعمية ٢ × ٢٠٫٠٠
خدمة ١٢٪ ٩٫٠٠
ضريبة القيمة المضافة ١١٫٧٦
الإجمالي ٩٥٫٧٦`);
    expect(r.merchant).toBe('مطعم أبو طارق');
    expect(r.items).toEqual([
      { name: 'فول بالزيت', quantity: 1, price: 3500 },
      { name: 'طعمية', quantity: 2, price: 4000 },
    ]);
    expect(r.extras.map((e) => e.kind)).toEqual(['service', 'tax']);
    expect(r.total).toBe(9576);
  });
});
