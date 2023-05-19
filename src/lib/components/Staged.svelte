<script lang="ts">
	import { Layer, type Render } from 'svelte-canvas';
	import { tweened } from 'svelte/motion';
	import { quartInOut } from 'svelte/easing';

	export let x: number;
	export let y: number;
	export let animDuration = 500;
	export let width = 5;
	export let radius = 50;

	const tweenedPos = (v: number) =>
		tweened(v, {
			duration: animDuration,
			easing: quartInOut
		});

	let posX = tweenedPos(x);
	let posY = tweenedPos(y);

	const moveTo = (newX: number, newY: number) => {
		posX.set(newX);
		posY.set(newY);
	};

	$: {
		moveTo(x, y);
	}

	let render: Render;
	$: render = ({ context }) => {
		context.fillStyle = `rgba(0, 0, 255)`;
		context.beginPath();
		context.setLineDash([12, 6]);
		context.lineWidth = width;
		context.strokeStyle = `rgba(0, 0, 255)`;
		context.arc($posX, $posY, radius - width / 2, 0, Math.PI * 2);
		context.stroke();
	};
</script>

<Layer {render} />
