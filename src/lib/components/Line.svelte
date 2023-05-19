<script lang="ts">
	import { Layer, type Render } from 'svelte-canvas';
	import { quartInOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';

	type Pos = { x: number; y: number };

	export let startPoint: Pos;
	export let endPoint: Pos;
	export let width = 5;
	export let animDuration = 500;

	const tweenedPos = (v: number) =>
		tweened(v, {
			duration: animDuration,
			easing: quartInOut
		});

	let startX = tweenedPos(startPoint.x);
	let startY = tweenedPos(startPoint.y);
	let endX = tweenedPos(endPoint.x);
	let endY = tweenedPos(endPoint.y);

    const moveTo = (newStart: Pos, newEnd: Pos) => {
		startX.set(newStart.x)
		startY.set(newStart.y)
        endX.set(newEnd.x)
        endY.set(newEnd.y)
	};

	$: {
		moveTo(startPoint, endPoint);
	}

	let render: Render;
	$: render = ({ context }) => {
		context.fillStyle = `rgba(0, 0, 255)`;
		context.beginPath();
		context.moveTo($startX, $startY);
		context.lineTo($endX, $endY);
		context.lineWidth = width;
		context.strokeStyle = `rgba(0, 0, 255)`;
        context.setLineDash([]);
		context.stroke();
	};
</script>

<Layer {render} />
