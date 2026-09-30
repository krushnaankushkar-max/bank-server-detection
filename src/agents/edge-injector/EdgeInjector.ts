import { Adapter, ParticipantId, SystemLog } from '../../types/dpi';
import { SynthesizerAgent } from '../synthesizer/SynthesizerAgent';

export class EdgeInjector {
  private activeAdapters: Map<ParticipantId, Adapter> = new Map();
  private adapterHistory: Adapter[] = [];
  private synthesizer = new SynthesizerAgent();

  public deployAdapter(
    adapter: Adapter,
    onStatusChange?: (adapter: Adapter) => void,
    onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void
  ): Promise<Adapter> {
    return new Promise((resolve) => {
      onLog?.({
        agent: 'EDGE',
        severity: 'INFO',
        message: `Edge Injector: Preparing zero-downtime hot-patch route for participant [${adapter.participant}]...`,
      });

      adapter.status = 'DEPLOYING';
      onStatusChange?.({ ...adapter });

      // Simulate micro-stage atomic edge filter hookup without gateway restart
      setTimeout(() => {
        adapter.status = 'ACTIVE';
        adapter.isTemporary = true;
        this.activeAdapters.set(adapter.participant, adapter);

        // Track in history
        const existingIdx = this.adapterHistory.findIndex((a) => a.id === adapter.id);
        if (existingIdx >= 0) {
          this.adapterHistory[existingIdx] = adapter;
        } else {
          this.adapterHistory.unshift(adapter);
        }

        onLog?.({
          agent: 'EDGE',
          severity: 'SUCCESS',
          message: `⚡ Adapter [${adapter.id}] is now ACTIVE at API Gateway edge filter! Zero downtime, 0 gateway restarts.`,
          metadata: { adapterId: adapter.id, participant: adapter.participant },
        });

        onStatusChange?.({ ...adapter });
        resolve(adapter);
      }, 400);
    });
  }

  public getActiveAdapterFor(participant: ParticipantId): Adapter | undefined {
    return this.activeAdapters.get(participant);
  }

  public getAllAdapters(): Adapter[] {
    return Array.from(this.activeAdapters.values());
  }

  public getAdapterHistory(): Adapter[] {
    return this.adapterHistory;
  }

  public interceptAndTransform(
    participant: ParticipantId,
    rawPayload: Record<string, any>
  ): { transformed: boolean; payload: Record<string, any>; adapterId?: string } {
    const adapter = this.activeAdapters.get(participant);
    if (!adapter || adapter.status !== 'ACTIVE') {
      return { transformed: false, payload: rawPayload };
    }

    adapter.transactionsProcessed++;
    const transformedPayload = this.synthesizer.executeTransform(adapter, rawPayload);
    return {
      transformed: true,
      payload: transformedPayload,
      adapterId: adapter.id,
    };
  }

  public retireAdapter(
    participant: ParticipantId,
    onStatusChange?: (adapter: Adapter) => void,
    onLog?: (log: Omit<SystemLog, 'id' | 'timestamp'>) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const adapter = this.activeAdapters.get(participant);
      if (!adapter) {
        resolve();
        return;
      }

      onLog?.({
        agent: 'EDGE',
        severity: 'WARN',
        message: `Upstream schema recovery detected for [${participant}]. Initiating safe retirement for Adapter [${adapter.id}]...`,
      });

      adapter.status = 'RETIRING';
      onStatusChange?.({ ...adapter });

      setTimeout(() => {
        adapter.status = 'REMOVED';
        this.activeAdapters.delete(participant);

        onLog?.({
          agent: 'EDGE',
          severity: 'SUCCESS',
          message: `✓ Adapter [${adapter.id}] safely unmounted from API Gateway hot-path. Gateway traffic restored to pure canonical pass-through.`,
        });

        onStatusChange?.({ ...adapter });
        resolve();
      }, 500);
    });
  }
}
