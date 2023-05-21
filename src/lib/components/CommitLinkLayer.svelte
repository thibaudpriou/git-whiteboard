<script lang="ts">
	import { Layer, type Render } from 'svelte-canvas';
	import type { Pos } from '../../types';
	import { tweenedPos } from '$lib/motions';

	export let startPoint: Pos;
	export let endPoint: Pos;
	export let width = 5;
	export let animDuration: number | undefined = undefined;

	const animatedStart = tweenedPos(startPoint, animDuration);
	const animatedEnd = tweenedPos(startPoint, animDuration);

	$: {
		animatedStart.set(startPoint)
		animatedEnd.set(endPoint)
	}

	let render: Render;
	$: render = ({ context }) => {
		context.beginPath();
		context.moveTo($animatedStart.x, $animatedStart.y);
		context.lineTo($animatedEnd.x, $animatedEnd.y);
		context.lineWidth = width;
		context.strokeStyle = `rgba(0, 0, 255)`;
        context.setLineDash([]);
		context.stroke();
	};
</script>
	
<Layer {render} />
