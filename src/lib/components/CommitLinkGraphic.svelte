<script lang="ts">
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
</script>

<line class="commit-link" x1={$animatedStart.x} y1={$animatedStart.y} x2={$animatedEnd.x} y2={$animatedEnd.y} stroke-width={width} />
<style>
	.commit-link {
		stroke:  rgba(0, 0, 255);
	}
</style>
