<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Pos } from '$types';

	export let label = '';
	export let pos: Pos;

	const dispatch = createEventDispatcher();
	const handleSubmit = () => {
		dispatch('submit', label);
	};
</script>

<span class="label-input" style:--x={pos.x} style:--y={pos.y}>
	<form on:submit={handleSubmit}>
		<!-- svelte-ignore a11y-autofocus -->
		<input type="text" bind:value={label} on:submit={handleSubmit} autofocus />
	</form>
</span>

<style>
	.label-input {
		position: absolute;
		top: calc(var(--y) * 1px);
		left: calc(var(--x) * 1px);
	}
</style>
