<script lang="ts">
	import { TooltipProvider } from '$lib/components/ui/tooltip';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import '../app.css';

	let { children } = $props();
</script>

<TooltipProvider>
	<Toaster />
	{@render children()}
</TooltipProvider>
