<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import AuthForm from '$lib/components/auth-form.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<form method="post" action="?/register" use:enhance>
		<!-- <label>
		Email
		<input name="email" type="email" required />
	</label>
	<label>
		Password
		<input type="password" name="password" required />
	</label>
	<button>Login</button>
	<button formaction="?/register">Register</button> -->
		<AuthForm mode="register" />
	</form>
	<p style="color: red">{form?.message ?? ''}</p>
</div>
