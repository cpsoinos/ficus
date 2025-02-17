export class BindingsSingleton {
	static env: CloudflareBindings;

	static initialize(env: CloudflareBindings) {
		Bindings.env = env;
	}
}

export type BindingsType = typeof BindingsSingleton & CloudflareBindings;

export const Bindings = new Proxy(BindingsSingleton, {
	get(target, prop, receiver) {
		if (prop in target) {
			return Reflect.get(target, prop, receiver);
		}
		if (BindingsSingleton.env && prop in BindingsSingleton.env) {
			return BindingsSingleton.env[prop as keyof CloudflareBindings];
		}
		return undefined;
	}
}) as BindingsType;
