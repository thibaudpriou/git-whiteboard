<script lang="ts">
	import CommitGraphic from '$lib/components/CommitGraphic.svelte';
	import CommitLinkGraphic from '$lib/components/CommitLinkGraphic.svelte';
	import type { Commit, Pos } from '../types';

	import LabelInput from '$lib/components/LabelInput.svelte';
	import { commits, commitList } from '$lib/stores';
	import {
		compteGridSize,
		getGridFromPosition,
		getObjectProperty,
		getPositionFromGrid,
		isAllowedAction,
		keyActionToCameraMotion,
		moveCamera,
		removeArrayEl
	} from '$lib/utils';
	import { ActionType } from '$lib/constants';
	import ActionBanner from '$lib/components/ActionBanner.svelte';

	let innerHeight = 0,
		innerWidth = 0;

	let camera = { x: 0, y: 2, z: 2 };

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

		commits.renameCommit(commit, ev.detail);
		commitsIdsToLabel = removeArrayEl(commitsIdsToLabel, commit.id);
		selectedCommitsIds = removeArrayEl(selectedCommitsIds, commit.id);
	};

	let editMode: ActionType | undefined;
	const handleKeydown = (ev: KeyboardEvent) => {
		if (ev.repeat) return;

		const { key, shiftKey } = ev;

		if (ActionType.CANCEL === key) {
			selectedCommitsIds = [];
			commitsIdsToLabel = [];
			editMode = undefined;
			return;
		}

		if (ActionType.BEAUTIFY === key) {
			commits.beautify();
			return;
		}

		if (commitsIdsToLabel.length) {
			/**
			 * don't listen to users input when entering text
			 */
			return;
		}

		const motion = keyActionToCameraMotion(key, shiftKey);
		if (motion) {
			camera = moveCamera(motion, camera);
			return;
		}

		if (!isAllowedAction(key)) return;

		if (editMode === key) {
			// reset
			selectedCommitsIds = [];
			editMode = undefined;
			return;
		}

		editMode = key;

		// ? TODO reset selection for every mode changes
		if (ActionType.RENAME === key) {
			selectedCommitsIds = [];
		}
	};

	$: handleSVGClick = (ev: MouseEvent) => {
		if (editMode === undefined) return;

		const { clientX: x, clientY: y } = ev;
		const pos = pos2grid({ x, y });

		if (ActionType.COMMIT === editMode) {
			const parents = selectedCommitsIds.slice(0, 2);
			if (!parents.length) return;

			const newCommit = { pos, parents } as Commit;

			const prevLastCommitId = Object.keys($commits.idMap).at(-1)!; // last added key
			commits.addCommit(newCommit);
			const lastCommitId = Object.keys($commits.idMap).at(-1)!; // last added key

			if (prevLastCommitId !== lastCommitId) {
				// a new commit was created
				selectedCommitsIds = [lastCommitId]; // to chain creation
			}
			return;
		}

		if (ActionType.POSITION === editMode) {
			const toMoveId = selectedCommitsIds.at(0);
			if (!toMoveId) return;

			commits.moveCommit(toMoveId, pos);
		}
	};

	let selectedCommitsIds: Commit['id'][] = [];
	const handleCommitClick = (clicked: Commit) => {
		if (ActionType.DELETE === editMode) {
			return commits.delete(clicked.id);
		}

		if (ActionType.UNBASE === editMode) {
			return commits.removeParents(clicked.id);
		}

		if (ActionType.REBASE === editMode && selectedCommitsIds.length === 1) {
			// TODO perform a real rebase (select 2 or 3 commits, and checks that it's possible, with a nice animation)
			return commits.setParent(selectedCommitsIds[0], clicked.id);
		}

		if (ActionType.POSITION === editMode) {
			selectedCommitsIds = [clicked.id];
			return;
		}

		if (ActionType.COMMIT === editMode && selectedCommitsIds.length >= 2) {
			return;
		}

		const newSelectedCommits = selectedCommitsIds.filter((id) => id !== clicked.id);
		if (selectedCommitsIds.length === newSelectedCommits.length) {
			// not already selected
			newSelectedCommits.push(clicked.id);
		}
		selectedCommitsIds = newSelectedCommits;

		if (ActionType.RENAME === editMode) {
			displayLabelInputs(selectedCommitsIds);
		}
	};

	$: commitsToLabel = commitsIdsToLabel.map((id) => getObjectProperty($commits.idMap, id)!);
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<svelte:document on:keydown={handleKeydown} />

<span class="mode-info">
	<ActionBanner action={editMode} />
</span>

{#if innerWidth && innerHeight}
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<svg width={innerWidth} height={innerHeight} on:click={handleSVGClick}>
		<!-- display links underneath commits  -->
		{#each $commitList as commit (commit.id)}
			{#each commit.parentsCommits ?? [] as parent}
				<CommitLinkGraphic startPoint={grid2pos(parent.pos)} endPoint={grid2pos(commit.pos)} />
			{/each}
		{/each}

		{#each $commitList as commit (commit.id)}
			<CommitGraphic
				pos={grid2pos(commit.pos)}
				label={commit.name}
				radius={gridSize / 4}
				on:click={() => handleCommitClick(commit)}
				selected={selectedCommitsIds.some((id) => id === commit.id)}
			/>
		{/each}
	</svg>
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
