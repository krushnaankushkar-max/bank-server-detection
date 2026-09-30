import { CanonicalDpiPayload } from '../types/dpi';

export interface FieldDefinition {
  name: keyof CanonicalDpiPayload;
  type: 'string' | 'decimal_string' | 'alphanumeric' | 'iso_timestamp';
  required: boolean;
  description: string;
  example: string;
  validationRegex?: RegExp;
}

export const CANONICAL_DPI_SCHEMA: Record<keyof CanonicalDpiPayload, FieldDefinition> = {
  payer_vpa: {
    name: 'payer_vpa',
    type: 'string',
    required: true,
    description: 'Virtual Payment Address of the initiating payer',
    example: 'farmer@bank',
    validationRegex: /^[\w.-]+@[\w.-]+$/,
  },
  amount: {
    name: 'amount',
    type: 'decimal_string',
    required: true,
    description: 'Transaction monetary value formatted as decimal string',
    example: '450.00',
    validationRegex: /^\d+(\.\d{2})?$/,
  },
  currency: {
    name: 'currency',
    type: 'string',
    required: true,
    description: 'Three-letter ISO currency code (strictly INR for DPI switch)',
    example: 'INR',
    validationRegex: /^INR$/,
  },
  auth_ref: {
    name: 'auth_ref',
    type: 'alphanumeric',
    required: true,
    description: 'Cryptographic authorization idempotency reference',
    example: 'TXN_991823',
    validationRegex: /^TXN_[A-Za-z0-9_-]{4,20}$/,
  },
  timestamp: {
    name: 'timestamp',
    type: 'iso_timestamp',
    required: true,
    description: 'ISO-8601 UTC timestamp',
    example: '2026-10-01T12:30:00Z',
    validationRegex: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/,
  },
};

export const EXPECTED_CANONICAL_KEYS = Object.keys(CANONICAL_DPI_SCHEMA) as (keyof CanonicalDpiPayload)[];
