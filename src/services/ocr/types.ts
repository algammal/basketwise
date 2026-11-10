export interface OcrExtractedItem {
  rawName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  confidence: number; // 0..1
}

export interface OcrReceiptResult {
  supermarketNameGuess: string | null;
  purchaseDateGuess: string | null; // ISO date
  items: OcrExtractedItem[];
  totalAmountGuess: number | null;
  /** Whether this came from a real OCR provider or the dev mock. Surfaced in the UI so results are never silently treated as real recognition. */
  source: 'mock' | 'provider';
  providerName?: string;
}

/**
 * Integration boundary for receipt OCR. Swap MockOcrService for a real
 * implementation (Google Cloud Vision, AWS Textract, Veryfi, Taggun, …)
 * without touching any caller.
 */
export interface OcrService {
  recognizeReceipt(imageUri: string): Promise<OcrReceiptResult>;
}
