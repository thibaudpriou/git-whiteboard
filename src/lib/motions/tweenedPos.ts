import type { Pos } from '../../types';
import { quartInOut } from 'svelte/easing';
import { tweened } from 'svelte/motion';

const interpolateNb = (from: number, to: number, t: number) => from * (1 - t) + to * t;

export const tweenedPos = (initialPos: Pos, animDuration = 200) => {
	return tweened(initialPos, {
		duration: animDuration,
		easing: quartInOut,
		interpolate: (from, to) => (t) => {
			return {
				x: interpolateNb(from.x, to.x, t),
				y: interpolateNb(from.y, to.y, t)
			};
		}
	});
};
