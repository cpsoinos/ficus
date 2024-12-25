<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import AuthForm from '$lib/components/auth-form.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex h-screen w-full items-center justify-center px-4">
	<form method="post" action="?/register" use:enhance>
		<AuthForm mode="register" />
	</form>
	<p style="color: red">{form?.message ?? ''}</p>
</div>
