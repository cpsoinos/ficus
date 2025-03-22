declare module '*.wasm' {
	const init: (options?: WebAssembly.Imports) => Promise<WebAssembly.Instance>;
	export default init;
	export const memory: WebAssembly.Memory;
}
