<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	export let mode: 'login' | 'register';
	export let email: string | undefined = undefined;
	export let errorMessage: string | undefined = undefined;

	const titleMap = {
		login: 'Login',
		register: 'Register'
	};

	const descriptionMap = {
		login: 'Enter your email below to login to your account',
		register: 'Enter your email below to register for an account'
	};

	const submitTextMap = {
		login: 'Login',
		register: 'Register'
	};

	const alternateTextMap = {
		login: "Don't have an account?",
		register: 'Already have an account?'
	};

	const alternateLinkTextMap = {
		login: 'Sign up',
		register: 'Login'
	};

	const alternateLinkHrefMap = {
		login: '/register',
		register: '/login'
	};

	const title = titleMap[mode];
	const description = descriptionMap[mode];
	const submitText = submitTextMap[mode];
	const alternateText = alternateTextMap[mode];
	const alternateLinkText = alternateLinkTextMap[mode];
	const alternateLinkHref = alternateLinkHrefMap[mode];
</script>

<Card.Root class="mx-auto max-w-sm sm:w-96">
	<Card.Header>
		<Card.Title class="text-2xl">{title}</Card.Title>
		<Card.Description>{description}</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="grid gap-4">
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					name="email"
					placeholder="m@example.com"
					required
					autocomplete="username"
					value={email}
				/>
			</div>
			<div class="grid gap-2">
				<div class="flex items-center">
					<Label for="password">Password</Label>
					{#if mode === 'login'}
						<a href="##" class="ml-auto inline-block text-sm underline">Forgot your password?</a>
					{/if}
				</div>
				<Input
					id="password"
					type="password"
					name="password"
					required
					autocomplete={mode === 'login' ? 'current-password' : 'off'}
				/>
			</div>

			<div class="h-4">
				{#if errorMessage}
					<p class="text-sm text-red-500">{errorMessage}</p>
				{/if}
			</div>

			<Button type="submit" class="w-full">{submitText}</Button>
			<Button variant="outline" class="w-full" href="/oauth/github">Login with Github</Button>
		</div>
		<div class="mt-4 text-center text-sm">
			{alternateText}
			<a href={alternateLinkHref} class="underline">{alternateLinkText}</a>
		</div>
	</Card.Content>
</Card.Root>
