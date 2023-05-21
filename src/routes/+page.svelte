<script lang="ts">
	import CommitLayer from '$lib/components/CommitLayer.svelte';
	import CommitLinkLayer from '$lib/components/CommitLinkLayer.svelte';
	import { Canvas } from 'svelte-canvas';
	import type { Commit, Pos } from '../types';

	import LabelInput from '$lib/components/LabelInput.svelte';
	import { store } from '$lib/store';
	import {
		compteGridSize,
		getCommitById,
		getGridFromPosition,
		getPositionFromGrid,
		hydrateParentsCommitsCb,
		isAllowedAction,
		removeArrayEl
	} from '$lib/utils';
	import { ActionType } from '$lib/constants';
	import ActionBanner from '$lib/components/ActionBanner.svelte';

	/**
	 * TODOLIST
	 * - create WorkingDirChanges component
	 * - rebase action
	 * - cherry-pick
	 */

	let innerHeight = 0,
		innerWidth = 0;

	const camera = { x: 0, y: 2, z: 2 };

	let gridSize: number;
	let grid2pos: (p: Pos) => Pos;
	let pos2grid: (p: Pos) => Pos;
	$: {
		const win = { innerHeight, innerWidth };
		gridSize = compteGridSize(100, camera);
		grid2pos = getPositionFromGrid.bind(null, win, camera, gridSize);
		pos2grid = getGridFromPosition.bind(null, win, camera, gridSize);
	}

	let commitsIdsToLabel: Commit['id'][] = [];
	const displayLabelInputs = (id: Commit['id'][]) => {
		commitsIdsToLabel = id;
	};

	const handleLabelSubmit = (commit: Commit, ev: CustomEvent<string>) => {
		if (!commit) return;

		store.renameCommit(commit, ev.detail);
		commitsIdsToLabel = removeArrayEl(commitsIdsToLabel, commit.id);
		selectedCommitsIds = removeArrayEl(selectedCommitsIds, commit.id);
	};

	$: handleCanvasClick = (ev: MouseEvent) => {
		if (editMode === undefined) return;

		const { clientX: x, clientY: y } = ev;
		const pos = pos2grid({ x, y });

		if (ActionType.RENAME === editMode) {
			displayLabelInputs(selectedCommitsIds);
		}

		if (ActionType.COMMIT === editMode) {
			if (selectedCommitsIds.length == 0) {
				console.log('Failure: cannot create commit w/o parent');
				return;
			}

			const parents = selectedCommitsIds.slice(0, 2) as [string] | [string, string];

			const newCommit = { pos, parents };
			if (!newCommit) return;

			store.addCommit(newCommit);

			const lastCommit = $store.commits.at(-1)!;
			selectedCommitsIds = [lastCommit.id]; // to chain creation
			return;
		}

		if (ActionType.MOVE === editMode) {
			const toMoveId = selectedCommitsIds.at(0);
			if (!toMoveId) return;

			store.moveCommit(toMoveId, pos);
		}
	};

	let editMode: ActionType | undefined;
	const handleKeydown = (ev: KeyboardEvent) => {
		if (ev.repeat) return;

		if (ActionType.CANCEL === ev.key) {
			selectedCommitsIds = [];
			commitsIdsToLabel = [];
			return;
		}

		if (!isAllowedAction(ev.key)) return;

		if (editMode === ev.key) {
			// reset
			selectedCommitsIds = [];
			editMode = undefined;
			return;
		}

		editMode = ev.key;
	};

	let selectedCommitsIds: Commit['id'][] = [];
	const handleCommitClick = (clicked: Commit) => {
		// remove if exists
		const newSelectedCommits = selectedCommitsIds.filter((id) => id !== clicked.id);

		if (selectedCommitsIds.length === newSelectedCommits.length) {
			// none found
			newSelectedCommits.push(clicked.id);
		}
		selectedCommitsIds = newSelectedCommits;
	};

	$: commitsWithParents = $store.commits.map((c) => hydrateParentsCommitsCb($store.commits, c));
	$: commitsToLabel = commitsIdsToLabel.map((id) => getCommitById(commitsWithParents, id)!);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svelte:document on:keydown={handleKeydown} />

<span class="mode-info">
	<ActionBanner action={editMode} />
</span>
{#if innerWidth && innerHeight}
	<Canvas
		width={innerWidth}
		height={innerHeight}
		on:click={editMode !== undefined ? handleCanvasClick : undefined}
		layerEvents={true}
	>
		<!-- display links underneath commits  -->
		{#each commitsWithParents as commit}
			{#each commit.parentCommits as parent}
				<CommitLinkLayer startPoint={grid2pos(parent.pos)} endPoint={grid2pos(commit.pos)} />
			{/each}
		{/each}

		{#each commitsWithParents as commit}
			<CommitLayer
				pos={grid2pos(commit.pos)}
				label={commit.name}
				radius={gridSize / 4}
				on:click={() => handleCommitClick(commit)}
				selected={selectedCommitsIds.some((id) => id === commit.id)}
			/>
		{/each}
	</Canvas>
{/if}

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
