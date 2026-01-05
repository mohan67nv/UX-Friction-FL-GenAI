import type { IntentVector } from '../index';

export type ModelRuntime = 'heuristics' | 'onnx' | 'tfjs';

export class AIFrictionEngine {
  private runtime: ModelRuntime = 'heuristics';

  async initialize(_opts: { modelUrl?: string } = {}) {
    // Future:
    // - ONNX: onnxruntime-web InferenceSession
    // - TFJS: tfjs model
    this.runtime = 'heuristics';
  }

  predict(_features: number[]): IntentVector {
    // Placeholder: heuristics handled elsewhere.
    return {
      rage_score: 0,
      hesitation_score: 0,
      confusion_score: 0,
      satisfaction_score: 0,
      timestamp: Date.now()
    };
  }
}
