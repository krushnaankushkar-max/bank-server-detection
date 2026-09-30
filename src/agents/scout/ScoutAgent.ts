import { Incident, ParticipantId, SystemLog, Transaction } from '../../types/dpi';

export interface ScoutMetrics {
  windowSize: number;
  totalSeen: number;
  failedCount: number;
  failureRate: number;
  recent422Clusters: { participant: ParticipantId; count: number; lastError: string }[];
}

export class ScoutAgent {
  private windowTransactions: Transaction[] = [];
  private readonly windowLimit = 50;
  private readonly failureThresholdPercentage = 30; // Threshold to trigger incident
  private clusterCounts: Record<ParticipantId, number> = {
    'RuralBank-X': 0,
    'CoopBank-A': 0,
    'FinTechPay': 0,
    'RegionalBank-01': 0,
  };

  public processTransaction(
    txn: Transaction,
    onIncidentDetected?: (incident: Incident) => void,
    onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void
  ): Incident | null {
    this.windowTransactions.unshift(txn);
    if (this.windowTransactions.length > this.windowLimit) {
      this.windowTransactions.pop();
    }

    if (txn.status === 'FAILED' && txn.httpStatus === 422) {
      this.clusterCounts[txn.participant] = (this.clusterCounts[txn.participant] || 0) + 1;

      onLog?.({
        agent: 'SCOUT',
        severity: 'WARN',
        message: `HTTP 422 Schema Contract violation detected for participant [${txn.participant}] (Cluster count: ${this.clusterCounts[txn.participant]})`,
        metadata: { txnId: txn.id, error: txn.errorReason },
      });

      // Calculate recent failure rate for this participant
      const participantTxns = this.windowTransactions.filter((t) => t.participant === txn.participant);
      const participantFails = participantTxns.filter((t) => t.status === 'FAILED');
      const failRate = Math.round((participantFails.length / Math.max(1, participantTxns.length)) * 100);

      // Trigger incident if cluster count >= 2 or failRate >= threshold
      if (this.clusterCounts[txn.participant] >= 2 || failRate >= this.failureThresholdPercentage) {
        const incidentId = `INC-${Math.floor(1000 + Math.random() * 9000)}`;

        const newIncident: Incident = {
          id: incidentId,
          participant: txn.participant,
          title: `Schema Contract Violation — ${txn.participant}`,
          scenario: 'key_rename', // default, refined by Diagnostic Agent
          severity: 'CRITICAL',
          status: 'OPEN',
          failureRate: Math.max(failRate, 100),
          affectedTransactions: this.clusterCounts[txn.participant],
          detectedAt: new Date().toISOString(),
          samplePayload: txn.rawPayload,
        };

        onLog?.({
          agent: 'SCOUT',
          severity: 'ERROR',
          message: `🚨 Critical failure cluster detected! Failure rate: ${newIncident.failureRate}%. Created Incident ${incidentId} for ${txn.participant}`,
          metadata: { incidentId, failureRate: newIncident.failureRate },
        });

        onIncidentDetected?.(newIncident);
        return newIncident;
      }
    } else if (txn.status === 'SUCCESS') {
      // Decay cluster count on healthy transactions
      if (this.clusterCounts[txn.participant] > 0) {
        this.clusterCounts[txn.participant] = Math.max(0, this.clusterCounts[txn.participant] - 1);
      }
    }

    return null;
  }

  public resetCluster(participant: ParticipantId) {
    this.clusterCounts[participant] = 0;
  }

  public getMetrics(): ScoutMetrics {
    const totalSeen = this.windowTransactions.length;
    const failedCount = this.windowTransactions.filter((t) => t.status === 'FAILED').length;
    const failureRate = totalSeen === 0 ? 0 : Math.round((failedCount / totalSeen) * 100);

    const recent422Clusters = (Object.keys(this.clusterCounts) as ParticipantId[])
      .filter((p) => this.clusterCounts[p] > 0)
      .map((p) => ({
        participant: p,
        count: this.clusterCounts[p],
        lastError: 'HTTP 422 Schema Contract Violation',
      }));

    return {
      windowSize: totalSeen,
      totalSeen,
      failedCount,
      failureRate,
      recent422Clusters,
    };
  }
}
