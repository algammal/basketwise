import type { OcrService, OcrReceiptResult } from './types';

/**
 * Development stand-in for a real OCR provider. Returns clearly-labeled
 * sample data (source: 'mock') so no screen can present it as a genuine
 * recognition result. Replace with a real OcrService implementation once a
 * provider (Google Cloud Vision, AWS Textract, Veryfi, Taggun, …) and
 * credentials are available — no caller code needs to change.
 */
export class MockOcrService implements OcrService {
  async recognizeReceipt(_imageUri: string): Promise<OcrReceiptResult> {
    // Simulate processing latency so the review UI's loading state is exercised.
    await new Promise((resolve) => setTimeout(resolve, 900));

    return {
      source: 'mock',
      supermarketNameGuess: 'Carrefour',
      purchaseDateGuess: new Date().toISOString().slice(0, 10),
      totalAmountGuess: 284.5,
      items: [
        { rawName: 'Olive Oil 1L', quantity: 1, unitPrice: 189.0, discountAmount: 0, confidence: 0.82 },
        { rawName: 'Basmati Rice 2kg', quantity: 1, unitPrice: 95.5, discountAmount: 0, confidence: 0.77 },
      ],
    };
  }
}

export const mockOcrService = new MockOcrService();
