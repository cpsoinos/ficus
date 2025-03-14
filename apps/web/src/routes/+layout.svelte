<script lang="ts">
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import '../app.css';

	let { children } = $props();
</script>

<TooltipProvider>
	<Toaster />
	{@render children()}
</TooltipProvider>
