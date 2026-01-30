<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Video Triage</title>
</svelte:head>

{@render children()}
