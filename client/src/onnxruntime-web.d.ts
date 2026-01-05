declare module 'onnxruntime-web' {
  // Minimal shim so TypeScript can compile in this repo.
  // The runtime is provided by the onnxruntime-web package.
  export const InferenceSession: any;
  export const Tensor: any;
  export const env: any;
}
