import { CanonicalDpiPayload, ParticipantId, Transaction } from '../types/dpi';
import { validateAgainstCanonicalDpiSchema } from '../schema-engine/validator';
import { EdgeInjector } from '../agents/edge-injector/EdgeInjector';

// Realistic sample VPAs and entities
const PARTICIPANT_VPAS: Record<ParticipantId, string[]> = {
  'RuralBank-X': ['farmer.raj@ruralbank', 'coop.mandi@ruralbank', 'kisan.ram@ruralbank', 'krishi.kendra@ruralbank'],
  'CoopBank-A': ['dairy.society@coopbank', 'sugar.mill@coopbank', 'weaver.guild@coopbank'],
  'FinTechPay': ['merchant.store@fintech', 'user.arjun@fintech', 'pay.quick@fintech'],
  'RegionalBank-01': ['distributor.delhi@regbank', 'retail.noida@regbank', 'trader.punjab@regbank'],
};

export class TransactionEngine {
  private transactions: Transaction[] = [];
  private maxHistory = 100;
  private seq = 100000;

  constructor(private edgeInjector: EdgeInjector) {}

  public generateHealthyPayload(participant: ParticipantId, amount: string = '450.00'): CanonicalDpiPayload {
    const vpas = PARTICIPANT_VPAS[participant];
    const payer_vpa = vpas[Math.floor(Math.random() * vpas.length)];
    const auth_ref = `TXN_${Math.floor(100000 + Math.random() * 900000)}`;
    const timestamp = new Date().toISOString();

    return {
      payer_vpa,
      amount,
      currency: 'INR',
      auth_ref,
      timestamp,
    };
  }

  public processIncomingRequest(
    participant: ParticipantId,
    rawPayload: Record<string, any>,
    isRetry: boolean = false
  ): Transaction {
    this.seq++;
    const txnId = `TXN-${this.seq}`;
    const startTime = performance.now();

    // Step 1: Gateway edge filter interception
    const { transformed, payload: effectivePayload, adapterId } = this.edgeInjector.interceptAndTransform(
      participant,
      rawPayload
    );

    // Step 2: Canonical schema validation
    const validation = validateAgainstCanonicalDpiSchema(effectivePayload);
    const latencyMs = Math.round(performance.now() - startTime + (Math.random() * 8 + 12));

    const status = validation.valid
      ? isRetry
        ? 'RETRIED'
        : 'SUCCESS'
      : transformed
      ? 'HEALING'
      : 'FAILED';

    const transaction: Transaction = {
      id: txnId,
      participant,
      amount: effectivePayload.amount || rawPayload.amount || rawPayload.txn_amount || '450.00',
      currency: effectivePayload.currency || rawPayload.currency || 'INR',
      schemaVersion: transformed ? 'v1.0 (Adapted)' : validation.valid ? 'v1.0 (Canonical)' : 'Malformed',
      status,
      httpStatus: validation.valid ? 200 : 422,
      latencyMs,
      timestamp: new Date().toISOString(),
      rawPayload,
      transformedPayload: transformed ? effectivePayload : undefined,
      errorReason: validation.valid ? undefined : validation.errors.join('; '),
      adapterUsed: adapterId,
    };

    this.transactions.unshift(transaction);
    if (this.transactions.length > this.maxHistory) {
      this.transactions.pop();
    }

    return transaction;
  }

  public getTransactions(): Transaction[] {
    return this.transactions;
  }

  public clearTransactions() {
    this.transactions = [];
  }
}
