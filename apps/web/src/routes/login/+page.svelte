<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<AuthWrapper>
	<AuthForm action="?/login" mode="login" email={form?.email} errorMessage={form?.message} />
</AuthWrapper>
