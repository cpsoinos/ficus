<script lang="ts">
	import type { PageServerData } from './$types';

	import { enhance } from '$app/forms';

	let { data }: { data: PageServerData } = $props();
</script>

<h1>Hi, {data.user.email}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/logout" use:enhance>
	<button>Sign out</button>
</form>
