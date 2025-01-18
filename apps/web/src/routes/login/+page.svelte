<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthForm from '$lib/components/auth-form.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<form method="post" action="?/login" use:enhance>
		<AuthForm mode="login" email={form?.email} errorMessage={form?.message} />
	</form>
</div>
