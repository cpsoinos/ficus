<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<AuthWrapper>
	<h1>Forgot your password?</h1>
	<form method="post" use:enhance>
		<label for="form-forgot.email">Email</label>
		<input type="email" id="form-forgot.email" name="email" required value={form?.email ?? ''} /><br
		/>
		<button>Send</button>
		<p>{form?.message ?? ''}</p>
	</form>
	<a href="/login">Sign in</a>
</AuthWrapper>
