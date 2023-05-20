<script lang="ts">
	import Commit from '$lib/components/Commit.svelte';
	import Line from '$lib/components/Line.svelte';
	import Staged from '$lib/components/Staged.svelte';
	import { Canvas } from 'svelte-canvas';
	import type { Pos } from '../types';

	import { v4 as uuidv4 } from 'uuid';
	import LabelInput from '$lib/components/LabelInput.svelte';

	type Commit = {
		id: string;
		pos: Pos;
		name?: string;
	};

	type Staged = {
		id: string;
		pos: Pos;
	};

	interface Mem {
		commits: Commit[];
		lines: {
			start: Commit;
			end: Commit;
		}[];
		staged: Staged[];
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
			y: Math.round(-(p.y - innerHeight / 2) / gridSize + cameraPos.y)
		};
	};

	// TODO create a store
	const renameCommit = (commit: Commit, name: string) => {
		const found = memory.commits.find((c) => c.id === commit.id);
		if (!found) return;

		found.name = name;
		memory.commits = [...memory.commits];
	};
	const createCommit = (pos: Commit['pos'], head?: Commit) => {
		const newCommit = { id: uuidv4(), pos };
		memory.commits = [...memory.commits, newCommit];
		if (head) {
			memory.lines = [
				...memory.lines,
				{
					start: head,
					end: newCommit
				}
			];
		}
	};

	let memory: Mem;
	$: rootCommit = {
		id: uuidv4(),
		pos: { x: 0, y: 0 },
		name: 'Root'
	};
	$: memory = {
		commits: [rootCommit],
		lines: [],
		staged: []
	};

	let commitsToLabel: Commit[] = [];
	const displayLabelInputs = (commits: Commit[]) => {
		commitsToLabel = commits;
	};

	const handleLabelSubmit = (commit: Commit, ev: CustomEvent<string>) => {
		if (!commit) return;

		renameCommit(commit, ev.detail);
		const filterSubmitted = (c: Commit) => c.id !== commit.id;
		commitsToLabel = [...commitsToLabel.filter(filterSubmitted)];
		selectedCommits = [...selectedCommits.filter(filterSubmitted)];
	};

	$: handleCanvasClick = (ev: MouseEvent) => {
		if (editMode === undefined) return;

		if (editMode === 'c') {
			// add a new commit
			if (selectedCommits.length > 1) {
				console.log('Failure: Cannot link to more than 1 commit'); // yet (it's a merge) ;)
				return;
			}

			const pos = pos2grid({ x: ev.clientX, y: ev.clientY });
			createCommit(pos, selectedCommits.at(0));

			selectedCommits = [];
			return;
		}

		if (editMode === 'n') {
			displayLabelInputs(selectedCommits);
		}
	};

	let editMode: string | undefined;
	const handleKeydown = (ev: KeyboardEvent) => {
		if (ev.repeat) return;

		if (ev.key === 'Escape') {
			selectedCommits = [];
			commitsToLabel = [];
			return;
		}

		if (ev.key === 'c') editMode = ev.key;
	};

	const handleKeyup = (ev: KeyboardEvent) => {
		editMode = undefined;

		if (ev.key === 'n') {
			displayLabelInputs(selectedCommits);
		}
	};

	let selectedCommits: Commit[] = [];
	const handleCommitClick = (clicked: Commit) => {
		// remove if exists
		const newSelectedCommits = selectedCommits.filter((c) => c.id !== clicked.id);

		if (selectedCommits.length === newSelectedCommits.length) {
			// none found
			newSelectedCommits.push(clicked);
		}
		selectedCommits = newSelectedCommits;
	};

	// TODO create WorkingDirChanges component
	// TODO move elements with drag event
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svelte:document on:keydown={handleKeydown} on:keyup={handleKeyup} />

{#if editMode}
	<p class="mode-info">
		Mode: <span>
			{#if editMode === 'c'}
				commit creation
			{/if}
		</span>
	</p>
{/if}
<Canvas
	width={innerWidth}
	height={innerHeight}
	on:click={editMode !== undefined ? handleCanvasClick : undefined}
	layerEvents={true}
>
	{#each Object.entries(memory.lines) as [k, line]}
		<Line startPoint={grid2pos(line.start.pos)} endPoint={grid2pos(line.end.pos)} />
	{/each}

	{#each memory.commits as commit}
		<Commit
			pos={grid2pos(commit.pos)}
			label={commit.name}
			radius={gridSize / 4}
			on:click={() => handleCommitClick(commit)}
			selected={selectedCommits.some((c) => c.id === commit.id)}
		/>
	{/each}

	{#each memory.staged as staged}
		<!-- TODO staged props: `pos` i.o. `x` & `y` -->
		<Staged x={grid2pos(staged.pos).x} y={grid2pos(staged.pos).y} radius={gridSize / 4} />
	{/each}
</Canvas>

{#each commitsToLabel as c}
	<LabelInput label={c.name} pos={grid2pos(c.pos)} on:submit={(e) => handleLabelSubmit(c, e)} />
{/each}

<style>
	.mode-info {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
