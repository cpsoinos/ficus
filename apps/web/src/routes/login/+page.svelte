<script lang="ts">
	import AuthForm from '$lib/components/auth-form.svelte';
	import AuthWrapper from '$lib/components/auth-wrapper.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import Icon from '$lib/components/ui/icon/icon.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let errorMessage = $state('');

	$effect(() => {
		if (form?.message) {
			errorMessage = form.message;
		}
	});

	function clearFormError() {
		errorMessage = '';
	}
</script>

<AuthWrapper>
	<AuthForm
		method="POST"
		action="?/login"
		title="Login"
		description="Enter your email below to login to your account"
		{errorMessage}
	>
		{#snippet fields()}
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					name="email"
					placeholder="m@example.com"
					required
					autocomplete="username"
					value={form?.email}
					oninput={clearFormError}
				/>
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
				</div>
				<Input
					id="password"
					type="password"
					name="password"
					required
					autocomplete="current-password"
					oninput={clearFormError}
				/>
			</div>
			<a href="/forgot-password" class="ml-auto inline-block text-sm underline">
				Forgot your password?
			</a>
		{/snippet}

		{#snippet footer()}
			<div class="grid w-full gap-4">
				<Button type="submit" class="w-full">Login</Button>
				<Button variant="outline" class="w-full" href="/oauth/github">
					<Icon icon="mdi:github" />
					Login with Github
				</Button>
				<div class="text-center text-sm">
					Don't have an account?
					<a href="/register" class="underline">Sign up</a>
				</div>
			</div>
		{/snippet}
	</AuthForm>
</AuthWrapper>
