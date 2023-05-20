<script lang="ts">
	import Commit from '$lib/components/Commit.svelte';
	import Line from '$lib/components/Line.svelte';
	import Staged from '$lib/components/Staged.svelte';
	import { Canvas } from 'svelte-canvas';
	import type { Pos } from '../types';

	import { v4 as uuidv4 } from 'uuid';

	type Commit = {
		id: string;
		pos: Pos;
	};

	interface Mem {
		commits: Commit[];
		lines: {
			start: Commit;
			end: Commit;
		}[];
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

	$: grid2pos = (p: Pos): Pos => {
		return {
			x: innerWidth / 2 + (p.x + cameraPos.x) * gridSize,
			y: innerHeight / 2 + (-p.y + cameraPos.y) * gridSize
		};
	};
	$: pos2grid = (p: Pos): Pos => {
		return {
			x: Math.round((p.x - innerWidth / 2) / gridSize - cameraPos.x),
			y: Math.round(- (p.y - innerHeight / 2) / gridSize + cameraPos.y)
		}}

	let memory: Mem;

	$: rootCommit = {
		id: uuidv4(),
		pos: { x: 0, y: 0 }
	};
	$: memory = {
		commits: [rootCommit],
		lines: [],
		staged: {
			[uuidv4()]: { x: -1, y: 0 }
		}
	};

	// TODO create WorkingDirChanges component
	// TODO move elements with drag event

	$: handleCanvasClick = (ev: MouseEvent) => {
		if (mode === undefined) {
			return;
		}

		if (mode === 'c') {
			// add a new commit
			if (selectedCommits.length > 1) {
				console.error('Cannot link to more than 1 commit'); // yet (it's a merge) ;)
				return;
			}

			const pos = pos2grid({ x: ev.clientX, y: ev.clientY })
			const newCommit = { id: uuidv4(), pos };
			memory.commits = [...memory.commits, newCommit];
			if (selectedCommits[0]) {
				memory.lines = [
					...memory.lines,
					{
						start: selectedCommits[0],
						end: newCommit
					}
				];
			}

			selectedCommits = []; // reset
			return;
		}
	};

	let mode: string | undefined;
	const handleKeydown = (ev: KeyboardEvent) => {
		if (ev.key === 'c') mode = ev.key;
	};
	const handleKeyup = (ev: KeyboardEvent) => {
		mode = undefined;
	};

	let selectedCommits: Commit[] = [];
	const handleCommitClick = (clicked: Commit) => {
		const foundIdx = selectedCommits.findIndex((c) => c.id === clicked.id);
		if (foundIdx >= 0) {
			// reset
			selectedCommits.splice(foundIdx, 1);
			selectedCommits = selectedCommits;
			return;
		}

		selectedCommits = [...selectedCommits, clicked];
	};
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svelte:document on:keydown={handleKeydown} on:keyup={handleKeyup} />

<Canvas
	width={innerWidth}
	height={innerHeight}
	on:click={mode !== undefined ? handleCanvasClick : undefined}
	layerEvents={true}
>
	{#each Object.entries(memory.lines) as [k, line]}
		<Line startPoint={grid2pos(line.start.pos)} endPoint={grid2pos(line.end.pos)} />
	{/each}

	{#each memory.commits as commit}
		<Commit
			pos={grid2pos(commit.pos)}
			radius={gridSize / 4}
			on:click={() => handleCommitClick(commit)}
			selected={selectedCommits.some((c) => c.id === commit.id)}
		/>
	{/each}

	{#each Object.entries(memory.staged) as [k, staged]}
		<Staged x={grid2pos(staged).x} y={grid2pos(staged).y} radius={gridSize / 4} />
	{/each}
</Canvas>
