<script lang="ts">
	import Commit from '$lib/components/Commit.svelte';
	import Line from '$lib/components/Line.svelte';
	import Staged from '$lib/components/Staged.svelte';
	import { Canvas } from 'svelte-canvas';
	import type { TCommit, Pos } from '../types';

	import LabelInput from '$lib/components/LabelInput.svelte';
	import { store } from '$lib/store';
	import {
		compteGridSize,
		getCommitById,
		getGridFromPosition,
		getPositionFromGrid,
		hydrateParentsCommitsCb
	} from '$lib/utils';

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


	let innerHeight = 0,
		innerWidth = 0;

	const camera = { x: 3, y: 0, z: 2 };

	let gridSize: number;
	let grid2pos: (p: Pos) => Pos;
	let pos2grid: (p: Pos) => Pos;
	$: {
		const win = { innerHeight, innerWidth };
		gridSize = compteGridSize(100, camera);
		grid2pos = getPositionFromGrid.bind(null, win, camera, gridSize);
		pos2grid = getGridFromPosition.bind(null, win, camera, gridSize);
	}

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
		commitsIdsToLabel = commitsIdsToLabel.filter(filterSubmitted);
		selectedCommitsIds = selectedCommitsIds.filter(filterSubmitted);
	};

	$: computeNewCommit = (pos: Pos, parentId?: string) => {
		if (!parentId) {
			console.log('Failure: cannot create commit w/o parent');
			return;
		}

		return {
			pos: pos2grid(pos),
			parents: [parentId] as [string]
		};
	};

	$: handleCanvasClick = (ev: MouseEvent) => {
		if (editMode === undefined) return;

		if (editMode === 'c') {
			const parentId = selectedCommitsIds.at(0);
			const newCommit = computeNewCommit({ x: ev.clientX, y: ev.clientY }, parentId);
			if (!newCommit) return;

			store.addCommit(newCommit);

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

	$: commitsWithParents = $store.commits.map(c => hydrateParentsCommitsCb($store.commits, c));
	$: commitsToLabel = commitsIdsToLabel.map((id) => getCommitById(commitsWithParents, id)!);
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
	{#each commitsWithParents as commit}
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
