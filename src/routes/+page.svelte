<script lang="ts">
	import Commit from '$lib/components/Commit.svelte';
	import Line from '$lib/components/Line.svelte';
	import Staged from '$lib/components/Staged.svelte';
	import { Canvas } from 'svelte-canvas';

	let innerHeight = 0,
		innerWidth = 0;

	let x = 0,
		y = 0;
	const moveTo = (newX: number, newY: number) => {
		x = newX;
		y = newY;
	};

	const handleClick = (ev: MouseEvent) => {
		moveTo(ev.clientX, ev.clientY);
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<Canvas width={innerWidth} height={innerHeight} on:click={handleClick}>
	<Commit {x} {y} />
	<Staged x={200} y={200} />
	<Line startPoint={{ x, y }} endPoint={{ x: 100, y: 200 }} />
</Canvas>
