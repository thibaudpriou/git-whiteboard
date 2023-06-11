<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let label = '';

	const dispatch = createEventDispatcher();
	const handleSubmit = () => {
		const detail = { label };
		dispatch('submit', detail);
	};
</script>

<form on:submit={handleSubmit}>
	<!-- svelte-ignore a11y-autofocus -->
	<input type="text" bind:value={label} on:submit={handleSubmit} autofocus />
</form>
