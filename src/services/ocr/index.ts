import { mockOcrService } from './mockOcrService';
import type { OcrService } from './types';

export * from './types';

/**
 * Single resolution point for which OcrService implementation is active.
 * Currently always the mock — swap this line when a real provider is wired
 * in, so every caller picks it up automatically.
 */
export const ocrService: OcrService = mockOcrService;
