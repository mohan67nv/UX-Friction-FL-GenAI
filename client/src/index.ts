export type RawEventType = 'click' | 'hover' | 'scroll' | 'navigation';

export interface IntentVector {
  rage_score: number;
  hesitation_score: number;
  confusion_score: number;
  satisfaction_score: number;
  timestamp: number;
}

export interface PrivacyEdgeConfig {
  apiKey: string;
  apiBaseUrl: string;
  privacyLevel?: 'standard' | 'high' | 'maximum';
  /** If true, do not use any persistent browser storage. Default: true */
  strictNoPersistence?: boolean;
}

export class PrivacyEdgeAnalytics {
  private readonly config: Required<PrivacyEdgeConfig>;
  private readonly ghost: GhostWitness;
  private readonly federated: FederatedClient;

  constructor(cfg: PrivacyEdgeConfig) {
    const epsilonMap = { standard: 2.0, high: 1.0, maximum: 0.5 } as const;
    this.config = {
      privacyLevel: cfg.privacyLevel ?? 'high',
      strictNoPersistence: cfg.strictNoPersistence ?? true,
      ...cfg
    };

    const epsilon = epsilonMap[this.config.privacyLevel];
    this.federated = new FederatedClient({
      apiBaseUrl: this.config.apiBaseUrl,
      apiKey: this.config.apiKey,
      epsilon
    });

    this.ghost = new GhostWitness({
      onIntent: (intent) => this.federated.addTrainingSample(intent)
    });
  }

  async init(): Promise<void> {
    // In MVP: heuristics-only, no ONNX/TF runtime.
    await this.federated.downloadGlobalModel();
    this.startMonitoring();
  }

  destroy(): void {
    this.ghost.destroy();
  }

  trackEvent(eventName: string, properties?: Record<string, unknown>): void {
    const intent: IntentVector = {
      rage_score: 0,
      hesitation_score: 0,
      confusion_score: 0,
      satisfaction_score: properties?.positive ? 1 : 0,
      timestamp: Date.now()
    };
    this.federated.addTrainingSample(intent);
  }

  private startMonitoring(): void {
    this.ghost.attach();
  }
}

// ------------------------------
// GhostWitness (RAM-only buffer)
// ------------------------------

type GhostWitnessOptions = {
  onIntent: (intent: IntentVector) => void;
};

class GhostWitness {
  private buffer: ArrayBuffer;
  private view: Uint8Array;
  private readonly ttlMs = 200;

  // RAM-only behavior state
  private clickHistory = new WeakMap<EventTarget, number[]>();
  private hoverStart = new WeakMap<EventTarget, number>();
  private pageClickCount = 0;
  private navSeq: number[] = []; // hashed path sequence, RAM only
  private readonly navSeqMax = 12;

  private attached = false;
  private onIntent: (intent: IntentVector) => void;

  private clickHandler = (e: MouseEvent) => this.capture(e);
  private mouseOverHandler = (e: MouseEvent) => this.capture(e);
  private scrollHandler = () => this.capture(new Event('scroll'));
  private visibilityHandler = () => this.onVisibilityChange();

  constructor(opts: GhostWitnessOptions) {
    this.onIntent = opts.onIntent;
    this.buffer = new ArrayBuffer(1024);
    this.view = new Uint8Array(this.buffer);
  }

  attach(): void {
    if (this.attached) return;
    this.attached = true;

    // Track navigation (SPA + traditional)
    this.recordNavigation();
    window.addEventListener('popstate', () => this.recordNavigation(), { passive: true });

    // Patch pushState/replaceState for SPAs (RAM-only; no persistence)
    const hist = window.history as History & {
      __pePatched?: boolean;
      __pePush?: History['pushState'];
      __peReplace?: History['replaceState'];
    };
    if (!hist.__pePatched) {
      hist.__pePatched = true;
      hist.__pePush = hist.pushState;
      hist.__peReplace = hist.replaceState;
      hist.pushState = function (...args) {
        const r = hist.__pePush!.apply(this, args as any);
        window.dispatchEvent(new Event('privacyedge:navigation'));
        return r;
      } as any;
      hist.replaceState = function (...args) {
        const r = hist.__peReplace!.apply(this, args as any);
        window.dispatchEvent(new Event('privacyedge:navigation'));
        return r;
      } as any;
    }
    window.addEventListener('privacyedge:navigation', () => this.recordNavigation(), { passive: true });

    document.addEventListener('click', this.clickHandler, { passive: true });

    // Throttle hover + scroll to reduce overhead
    let hoverT: number | undefined;
    document.addEventListener('mouseover', (e) => {
      if (hoverT) window.clearTimeout(hoverT);
      hoverT = window.setTimeout(() => this.mouseOverHandler(e as MouseEvent), 150);
    });

    let scrollT: number | undefined;
    window.addEventListener(
      'scroll',
      () => {
        if (scrollT) window.clearTimeout(scrollT);
        scrollT = window.setTimeout(this.scrollHandler, 200);
      },
      { passive: true }
    );

    // Dead-end detection: when user hides/leaves page and had zero outbound clicks.
    document.addEventListener('visibilitychange', this.visibilityHandler, { passive: true });
    window.addEventListener('pagehide', this.visibilityHandler as any, { passive: true });
  }

  destroy(): void {
    if (!this.attached) return;
    document.removeEventListener('click', this.clickHandler);
    document.removeEventListener('mouseover', this.mouseOverHandler as any);
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('visibilitychange', this.visibilityHandler);
    window.removeEventListener('pagehide', this.visibilityHandler as any);
    this.attached = false;
    this.wipeBuffer();
  }

  private capture(event: Event): void {
    const start = performance.now();

    // Serialize minimal features into buffer (MVP: not storing raw strings)
    const features = this.extractFeatures(event);

    // Heuristics-only friction detection (MVP+)
    const intent = this.heuristicPredict(event, features);
    this.onIntent(intent);

    this.wipeBuffer();

    const elapsed = performance.now() - start;
    if (elapsed > this.ttlMs) {
      // eslint-disable-next-line no-console
      console.warn(`[PrivacyEdge] GhostWitness TTL exceeded: ${elapsed.toFixed(1)}ms`);
    }
  }

  private extractFeatures(event: Event): number[] {
    const features: number[] = [];

    if (event instanceof MouseEvent) {
      const target = event.target as HTMLElement | null;
      const importance = target ? getElementImportance(target) : 0.1;
      const clickFreq = target ? this.getClickFrequency(target) : 0;

      features.push(
        event.clientX / Math.max(1, window.innerWidth),
        event.clientY / Math.max(1, window.innerHeight),
        importance,
        clickFreq,
        ((Date.now() % 86_400_000) / 86_400_000) // time of day normalized
      );
    } else {
      features.push(0, 0, 0.1, 0, ((Date.now() % 86_400_000) / 86_400_000));
    }

    const scrollDepth = document.body.scrollHeight
      ? window.scrollY / document.body.scrollHeight
      : 0;

    const linkDensity = Math.min(document.querySelectorAll('a').length / 100, 1);
    const domComplexity = Math.min(document.querySelectorAll('*').length / 1000, 1);

    features.push(scrollDepth, linkDensity, domComplexity);

    // Pad to 12 features for future model compatibility
    while (features.length < 12) features.push(0);
    return features;
  }

  private heuristicPredict(event: Event, _features: number[]): IntentVector {
    const now = Date.now();

    // --- Rage clicking ---
    let rage = 0;
    if (event.type === 'click' && event.target) {
      this.pageClickCount += 1;

      const clicks = this.clickHistory.get(event.target) ?? [];
      const recent = clicks.filter((t) => now - t < 1000);
      recent.push(now);
      this.clickHistory.set(event.target, recent);
      if (recent.length >= 3) rage = 0.9;
    }

    // --- Hesitation (hover-to-click delay on important elements) ---
    let hesitation = 0;
    if (event.type === 'mouseover' && event.target) {
      // Record hover start (RAM-only)
      this.hoverStart.set(event.target, now);
    }
    if (event.type === 'click' && event.target) {
      const hoverAt = this.hoverStart.get(event.target);
      if (hoverAt) {
        const hoverMs = now - hoverAt;
        const imp = event.target instanceof HTMLElement ? getElementImportance(event.target) : 0.1;
        // Threshold: >2s on important elements, smaller threshold for primary CTAs.
        const threshold = imp >= 1 ? 1200 : 2000;
        if (hoverMs > threshold) {
          // Scale to [0,1] with soft cap
          hesitation = Math.min((hoverMs - threshold) / 3000, 1) * 0.8;
        }
      }
    }

    // --- Confusion (backtracking / non-linear navigation) ---
    // Use hashed path IDs (irreversible) stored only in RAM.
    const confusion = this.detectBacktrackingScore();

    // --- Dead-end (page exit with zero outbound clicks) ---
    // Emitted via onVisibilityChange; not here.

    return {
      rage_score: rage,
      hesitation_score: hesitation,
      confusion_score: confusion,
      satisfaction_score: 0,
      timestamp: now
    };
  }

  private getClickFrequency(target: EventTarget): number {
    const clicks = this.clickHistory.get(target) ?? [];
    const now = Date.now();
    return clicks.filter((t) => now - t < 5000).length / 10; // normalize-ish
  }

  private wipeBuffer(): void {
    this.view.fill(0);
  }

  private onVisibilityChange(): void {
    // Fire a dead-end intent when the page is being hidden and the user had no outbound clicks.
    // Conservative heuristic: only if *no* clicks happened on the page.
    if (document.visibilityState !== 'hidden') return;

    if (this.pageClickCount === 0) {
      this.onIntent({
        rage_score: 0,
        hesitation_score: 0,
        confusion_score: 0.2,
        satisfaction_score: 0,
        timestamp: Date.now()
      });
    }
  }

  private recordNavigation(): void {
    // Reset per-page counters on navigation
    this.pageClickCount = 0;

    const h = stablePathHash(location.pathname);
    this.navSeq.push(h);
    if (this.navSeq.length > this.navSeqMax) this.navSeq.shift();
  }

  private detectBacktrackingScore(): number {
    if (this.navSeq.length < 4) return 0;

    // Backtracking pattern: A -> B -> C -> B or A -> B -> A
    const s = this.navSeq;
    const last = s[s.length - 1];

    // Simple revisit detection
    let visits = 0;
    for (let i = 0; i < s.length - 1; i++) if (s[i] === last) visits++;

    const revisited = visits >= 1;
    const immediateBacktrack = s.length >= 3 && last === s[s.length - 3];
    const oscillation = prev === s[s.length - 3] && last === s[s.length - 4];

    if (oscillation) return 0.8;
    if (immediateBacktrack) return 0.6;
    if (revisited) return 0.3;
    return 0;
  }
}

function getElementImportance(element: HTMLElement): number {
  if (element.matches('button[type="submit"], .cta, .primary-button')) return 1;
  if (element.matches('button, a')) return 0.5;
  return 0.1;
}

function stablePathHash(path: string): number {
  // Non-cryptographic, irreversible-ish hash for local sequence patterns.
  // Used only in RAM to detect backtracking; never sent as URL.
  let h = 2166136261;
  for (let i = 0; i < path.length; i++) {
    h ^= path.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// ------------------------------
// Federated client (MVP)
// ------------------------------

type FederatedClientOpts = {
  apiBaseUrl: string;
  apiKey: string;
  epsilon: number;
};

type Tensor = { shape: number[]; data: number[] };

type ModelWeights = { tensors?: Tensor[]; layers?: number[][][] };

interface LocalTrainer {
  train(model: ModelWeights, batch: IntentVector[]): Promise<ModelWeights>;
}

class NoopTrainer implements LocalTrainer {
  async train(_model: ModelWeights, _batch: IntentVector[]): Promise<ModelWeights> {
    return { tensors: [] };
  }
}

class FederatedClient {
  private localModel: ModelWeights | null = null;

  // Client-side training interface (stub). In production, implement with TF.js.
  private trainer: LocalTrainer = new NoopTrainer();
  private batch: IntentVector[] = [];
  private readonly batchSize = 50;
  private readonly updateIntervalMs = 5 * 60 * 1000;

  constructor(private opts: FederatedClientOpts) {
    window.setInterval(() => void this.sendUpdate(), this.updateIntervalMs);
  }

  async downloadGlobalModel(): Promise<void> {
    const res = await fetch(`${this.opts.apiBaseUrl}/api/v1/model/download`, {
      headers: { 'x-api-key': this.opts.apiKey }
    });
    if (!res.ok) throw new Error(`Model download failed: ${res.status}`);
    this.localModel = (await res.json()) as ModelWeights;
  }

  addTrainingSample(intent: IntentVector): void {
    this.batch.push(intent);
    if (this.batch.length >= this.batchSize) void this.sendUpdate();
  }

  private async sendUpdate(): Promise<void> {
    if (!this.localModel || this.batch.length === 0) return;

    // MVP: no real training; just send aggregate counters as tiny "deltas".
    // Future: this.trainer.train(this.localModel, this.batch)
    const rageCount = this.batch.filter((b) => b.rage_score > 0.8).length;

    const rageRatio = rageCount / Math.max(1, this.batch.length);

    const weightDelta: ModelWeights = {
      tensors: [{ shape: [1, 1], data: [rageRatio] }]
    };

    const update = {
      client_id: await this.getEphemeralClientId(),
      weight_delta: weightDelta,
      num_samples: this.batch.length,
      timestamp: Date.now()
    };

    const res = await fetch(`${this.opts.apiBaseUrl}/api/v1/aggregate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.opts.apiKey
      },
      body: JSON.stringify(update)
    });
    if (res.ok) {
      this.batch = [];
      await this.downloadGlobalModel();
    }
  }

  private async getEphemeralClientId(): Promise<string> {
    // IMPORTANT: we avoid stable fingerprinting in MVP.
    // This ID rotates daily and is scoped to origin; good enough for basic rate limiting.
    const day = Math.floor(Date.now() / 86_400_000);
    const msg = `${location.origin}:${day}`;
    const buf = new TextEncoder().encode(msg);
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
