<script lang="ts">
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<AuthWrapper>
	<h1>Recovery code</h1>
	<p>Your recovery code is: {data.recoveryCode}</p>
	<p>You can use this recovery code if you lose access to your second factors.</p>
	<a href="/">Next</a>
</AuthWrapper>
