<script lang="ts">
	import { Layer, type Render } from 'svelte-canvas';
	import { tweened } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';
	import type { Pos } from '../../types';

	export let pos: Pos;
	export let animDuration = 500;
	export let radius = 50;
	export let selected = false;
	export let label: string | undefined;

	const interpolateNb = (from: number, to: number, t: number) => from * (1 - t) + to * t;

	const tweenedPos = tweened(pos, {
		duration: animDuration,
		easing: quartInOut,
		interpolate: (from, to) => (t) => {
			return {
				x: interpolateNb(from.x, to.x, t),
				y: interpolateNb(from.y, to.y, t)
			};
		}
	});

	$: {
		tweenedPos.set(pos);
	}

	let render: Render;
	$: render = ({ context }) => {
		context.fillStyle = `rgba(0, 0, 255)`;
		context.beginPath();
		context.arc($tweenedPos.x, $tweenedPos.y, radius, 0, Math.PI * 2);
		context.fill();

		if (selected) {
			context.strokeStyle = `rgba(255, 0, 0)`;
			context.lineWidth = 2;
			context.stroke();
		}

		if (label) {
			context.font = `${radius}px serif`;
			context.fillStyle = `rgba(0, 0, 0)`;
			const offset = radius * 1.5;
			context.fillText(label, $tweenedPos.x + offset, $tweenedPos.y + offset);
		}
	};
</script>

<Layer {render} on:click />
