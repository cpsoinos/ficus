export class BindingsSingleton {
	static env: Env;

	static initialize(env: Env) {
		Bindings.env = env;
	}
}

export type BindingsType = typeof BindingsSingleton & Env;

export const Bindings = new Proxy(BindingsSingleton, {
	get(target, prop, receiver) {
		if (prop in target) {
			return Reflect.get(target, prop, receiver);
		}
		if (BindingsSingleton.env && prop in BindingsSingleton.env) {
			return BindingsSingleton.env[prop as keyof Env];
		}
		return undefined;
	}
}) as BindingsType;
