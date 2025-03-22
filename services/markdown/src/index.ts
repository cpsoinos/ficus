import { BindingsSingleton } from './lib/bindings';
import { render } from './render';

export default {
	async fetch(request, env, _ctx): Promise<Response> {
		BindingsSingleton.initialize(env);

		const body = await request.text();
		const html = await render(body);

		return new Response(html);
	}
} satisfies ExportedHandler<Env>;
