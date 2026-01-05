export type OnnxIntentOutput = { vector: number[]; outputName: string };

export async function loadOnnxSession(modelUrl: string) {
  const ort = await import('onnxruntime-web');
  // Prefer WASM for broad compatibility.
  // ort.env.wasm.wasmPaths can be set by integrator if needed.
  const session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ['wasm']
  });
  return { ort, session };
}

export async function runOnnxIntent(
  session: any,
  ort: any,
  features: number[]
): Promise<OnnxIntentOutput> {
  const inputName = session.inputNames?.[0] || 'input';
  const tensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);
  const outputs = await session.run({ [inputName]: tensor });

  // Prefer an output called "embedding"; otherwise use first output.
  const outName = outputs.embedding ? 'embedding' : Object.keys(outputs)[0];
  const out = outputs[outName];
  const data = Array.from(out.data as Float32Array);
  return { vector: data, outputName: outName };
}
