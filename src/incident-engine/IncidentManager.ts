import { Incident, IncidentStatus, ParticipantId, SystemLog } from '../types/dpi';

export class IncidentManager {
  private incidents: Incident[] = [];

  public createIncident(incident: Incident, onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void): Incident {
    const existing = this.incidents.find(
      (inc) => inc.participant === incident.participant && inc.status !== 'RESOLVED'
    );
    if (existing) {
      existing.affectedTransactions += incident.affectedTransactions;
      return existing;
    }

    this.incidents.unshift(incident);
    return incident;
  }

  public updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    adapterId?: string,
    onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void
  ): Incident | undefined {
    const incident = this.incidents.find((i) => i.id === incidentId);
    if (!incident) return undefined;

    incident.status = status;
    if (adapterId) incident.adapterId = adapterId;

    if (status === 'MITIGATED') {
      incident.mitigatedAt = new Date().toISOString();
      const detectedTime = new Date(incident.detectedAt).getTime();
      const mitigatedTime = new Date(incident.mitigatedAt).getTime();
      incident.mttrSeconds = Math.max(1, Math.round((mitigatedTime - detectedTime) / 1000) || 4);

      onLog?.({
        agent: 'SYSTEM',
        severity: 'SUCCESS',
        message: `Incident [${incident.id}] for ${incident.participant} MITIGATED in ~${incident.mttrSeconds}s via Adapter [${adapterId || 'N/A'}]`,
        metadata: { incidentId, mttrSeconds: incident.mttrSeconds },
      });
    } else if (status === 'RESOLVED') {
      incident.resolvedAt = new Date().toISOString();
      incident.severity = 'RESOLVED';

      onLog?.({
        agent: 'SYSTEM',
        severity: 'SUCCESS',
        message: `Incident [${incident.id}] for ${incident.participant} fully RESOLVED and closed. Upstream API schema nominal.`,
        metadata: { incidentId },
      });
    }

    return incident;
  }

  public getIncidents(): Incident[] {
    return this.incidents;
  }

  public getActiveIncident(): Incident | undefined {
    return this.incidents.find((i) => i.status !== 'RESOLVED');
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  public calculateAverageMttr(): number {
    const resolvedOrMitigated = this.incidents.filter((i) => i.mttrSeconds !== undefined);
    if (resolvedOrMitigated.length === 0) return 4.2; // default simulation baseline
    const total = resolvedOrMitigated.reduce((acc, curr) => acc + (curr.mttrSeconds || 4), 0);
    return parseFloat((total / resolvedOrMitigated.length).toFixed(1));
  }
}
