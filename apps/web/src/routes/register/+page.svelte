<script lang="ts">
	import type { ActionData } from './$types';
	import AuthForm from '$lib/components/auth-form.svelte';
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';

	let { form }: { form: ActionData } = $props();
</script>

<AuthWrapper>
	<AuthForm action="?/register" mode="register" errorMessage={form?.message} />
</AuthWrapper>
