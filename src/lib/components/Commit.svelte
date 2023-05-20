<script lang="ts">
	import { Layer, type Render } from 'svelte-canvas';
	import { tweened } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';
	import type { Pos } from '../../types';

	export let pos: Pos;
	export let animDuration = 500;
	export let radius = 50;
	export let selected = false

	const tweenedPos = (v: number) =>
		tweened(v, {
			duration: animDuration,
			easing: quartInOut
		});

	let posX = tweenedPos(pos.x);
	let posY = tweenedPos(pos.y);

	const moveTo = (newPos: Pos) => {
		posX.set(newPos.x);
		posY.set(newPos.y);
	};

	$: {
		moveTo(pos);
	}

	let render: Render;
	$: render = ({ context }) => {
		context.fillStyle = `rgba(0, 0, 255)`;
		context.beginPath();
		context.arc($posX, $posY, radius, 0, Math.PI * 2);
		context.fill();

		if (selected) {
			context.strokeStyle = `rgba(255, 0, 0)`;
			context.lineWidth = 2;
			context.stroke();
		}
	};
</script>

<Layer {render} on:click/>
