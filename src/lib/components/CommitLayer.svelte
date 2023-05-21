<script lang="ts">
	import { Layer, type Render } from 'svelte-canvas';
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

	let render: Render;
	$: render = ({ context }) => {
		const animatedRadius = $tweenedRadius;

		context.fillStyle = `rgba(0, 0, 255)`;
		context.beginPath();
		context.arc($animatedPos.x, $animatedPos.y, animatedRadius, 0, Math.PI * 2);
		if (animatedRadius !== 0) {
			context.fill();
		}

		if (selected) {
			context.strokeStyle = `rgba(255, 0, 0)`;
			context.lineWidth = 2;
			context.stroke();
		}

		if (label) {
			context.font = `${animatedRadius}px serif`;
			context.fillStyle = `rgba(0, 0, 0)`;
			const offset = animatedRadius * 1.5;
			context.fillText(label, $animatedPos.x + offset, $animatedPos.y + offset);
		}
	};
</script>

<Layer {render} on:click />
