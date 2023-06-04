<script lang="ts">
	import { tweened } from 'svelte/motion';
	import { cubicIn } from 'svelte/easing';
	import type { Pos } from '../../types';
	import { tweenedPos } from '$lib/motions';

	export let pos: Pos;
	export let animDuration: number | undefined = undefined;
	export let radius = 0;
	export let selected = false;
	export let label: string | undefined;

	const animatedPos = tweenedPos(pos, animDuration);

	const tweenedRadius = tweened(0, {
		duration: 50,
		easing: cubicIn
	});

	$: {
		animatedPos.set(pos);
	}
	$: {
		tweenedRadius.set(radius);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<circle
	class="commit"
	class:selected
	on:click
	cx={$animatedPos.x}
	cy={$animatedPos.y}
	r={$tweenedRadius}
/>
{#if label}
	<text
		class="label"
		x={$animatedPos.x + $tweenedRadius * 1.5}
		y={$animatedPos.y + $tweenedRadius * 1.5}>{label}</text
	>
{/if}

<style>
	.commit {
		fill: rgba(0, 0, 255);
	}

	.selected {
		stroke: rgba(255, 0, 0);
		stroke-width: 0.1em;
	}

	.label {
		fill: black;
	}
</style>
