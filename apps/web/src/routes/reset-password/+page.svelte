<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<AuthWrapper>
	<h1>Enter your new password</h1>
	<form method="post" use:enhance>
		<label for="form-reset.password">Password</label>
		<input
			type="password"
			id="form-reset.password"
			name="password"
			autocomplete="new-password"
			required
		/><br />
		<button>Reset password</button>
		<p>{form?.message ?? ''}</p>
	</form>
</AuthWrapper>
