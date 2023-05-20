<script lang="ts">
	import Commit from '$lib/components/Commit.svelte';
	import Line from '$lib/components/Line.svelte';
	import Staged from '$lib/components/Staged.svelte';
	import { Canvas } from 'svelte-canvas';
	import type { TCommit, Pos } from '../types';

	import LabelInput from '$lib/components/LabelInput.svelte';
	import { store } from '$lib/store';

	/**
	 * TODOLIST
	 * - create WorkingDirChanges component
	 * - move elements with drag event
	 * - merge action
	 * - rebase action
	 * - cherry-pick
	 */

	// TODO delete Staged interface
	type Staged = {
		id: string;
		pos: Pos;
	};

	// TODO delete Mem interface
	interface Mem {
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

	let memory: Mem;
	$: memory = {
		staged: []
	};

	let commitsIdsToLabel: TCommit['id'][] = [];
	const displayLabelInputs = (id: TCommit['id'][]) => {
		commitsIdsToLabel = id;
	};

	const handleLabelSubmit = (commit: TCommit, ev: CustomEvent<string>) => {
		if (!commit) return;

		store.renameCommit(commit, ev.detail);
		const filterSubmitted = (id: TCommit['id']) => id !== commit.id;
		commitsIdsToLabel = [...commitsIdsToLabel.filter(filterSubmitted)];
		selectedCommitsIds = [...selectedCommitsIds.filter(filterSubmitted)];
	};

	$: handleCanvasClick = (ev: MouseEvent) => {
		if (editMode === undefined) return;

		if (editMode === 'c') {
			// add a new commit
			const parentId = selectedCommitsIds.at(0);
			if (!parentId) {
				console.log('Failure: cannot create commit w/o parent');
				return;
			}

			const newCommit = {
				pos: pos2grid({ x: ev.clientX, y: ev.clientY })
			};
			store.addCommit(newCommit, [parentId]);

			const lastCommit = $store.commits.at(-1)!;
			selectedCommitsIds = [lastCommit.id]; // to chain creation
			return;
		}

		if (editMode === 'n') {
			displayLabelInputs(selectedCommitsIds);
		}
	};

	let editMode: string | undefined;
	const handleKeydown = (ev: KeyboardEvent) => {
		if (ev.repeat) return;

		if (ev.key === 'Escape') {
			selectedCommitsIds = [];
			commitsIdsToLabel = [];
			return;
		}

		if (ev.key === 'c') editMode = ev.key;
	};

	const handleKeyup = (ev: KeyboardEvent) => {
		editMode = undefined;

		if (ev.key === 'n') {
			displayLabelInputs(selectedCommitsIds);
		}
	};

	let selectedCommitsIds: TCommit['id'][] = [];
	const handleCommitClick = (clicked: TCommit) => {
		// remove if exists
		const newSelectedCommits = selectedCommitsIds.filter((id) => id !== clicked.id);

		if (selectedCommitsIds.length === newSelectedCommits.length) {
			// none found
			newSelectedCommits.push(clicked.id);
		}
		selectedCommitsIds = newSelectedCommits;
	};

	$: commits = $store.commits.map((c) => ({
		...c,
		parentCommits:
			c.parents?.map((pid) => {
				const parentCommit = $store.commits.find((c2) => c2.id === pid);
				if (!parentCommit) throw new Error('parent not found');

				return parentCommit;
			}) ?? []
	}));

	$: commitsToLabel = commitsIdsToLabel.map((id) => commits.find((c) => c.id === id)!);
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
	{#each commits as commit}
		<Commit
			pos={grid2pos(commit.pos)}
			label={commit.name}
			radius={gridSize / 4}
			on:click={() => handleCommitClick(commit)}
			selected={selectedCommitsIds.some((id) => id === commit.id)}
		/>

		{#each commit.parentCommits as parent}
			<!-- TODO rename component Line -> Link -->
			<Line startPoint={grid2pos(parent.pos)} endPoint={grid2pos(commit.pos)} />
		{/each}
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
