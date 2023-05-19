<script lang="ts">
	import Commit from '$lib/components/Commit.svelte';
	import Line from '$lib/components/Line.svelte';
	import Staged from '$lib/components/Staged.svelte';
	import { Canvas } from 'svelte-canvas';
	import type { Pos } from '../types';

	interface Mem {
		commits: {
			[hash: string]: Pos;
		};
		lines: {
			[id: string]: {
				start: Pos;
				end: Pos;
			};
		};
		staged: {
			[id: string]: Pos;
		};
	}

	const gridSize = 100;

	const cameraPos = {
		x: 0,
		y: 0
	};

	let innerHeight = 0,
		innerWidth = 0;

	$: getGridPos = (p: Pos): Pos => {
		return {
			x: innerWidth / 2 + (p.x + cameraPos.x) * gridSize,
			y: innerHeight / 2 + (- p.y + cameraPos.y) * gridSize
		};
	};

	let x = 0,
		y = 1;
	const moveTo = (newX: number, newY: number) => {
		x = Math.round((newX - innerWidth / 2) / gridSize - cameraPos.x);
		y = Math.round(- (newY - innerHeight / 2) / gridSize + cameraPos.y);
	};

	let memory: Mem;
	$: memory = {
		commits: {
			a: getGridPos({ x, y })
		},
		lines: {
			'null-a': {
				start: getGridPos({ x, y }),
				end: getGridPos({ x: 0, y: 0 })
			}
		},
		staged: {
			's-1': getGridPos({ x: -1, y: 0 })
		}
	};

	// TODO create WorkingDirChanges component
	// TODO move elements with drag event


	const handleClick = (ev: MouseEvent) => {
		moveTo(ev.clientX, ev.clientY);
	};

</script>

<svelte:window bind:innerWidth bind:innerHeight />

<Canvas width={innerWidth} height={innerHeight} on:click={handleClick}>
	{#each Object.entries(memory.lines) as [k, line]}
		<Line startPoint={line.start} endPoint={line.end} />
	{/each}

	{#each Object.entries(memory.commits) as [k, commit]}
		<Commit x={commit.x} y={commit.y} radius={gridSize / 4} />
	{/each}

	{#each Object.entries(memory.staged) as [k, staged]}
		<Staged x={staged.x} y={staged.y} radius={gridSize / 4} />
	{/each}
</Canvas>
