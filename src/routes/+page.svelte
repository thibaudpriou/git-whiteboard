<script lang="ts">
	import type { Commit, Pos } from '$types';

	import { commits, commitList } from '$lib/stores';
	import {
		getObjectProperty,
		isAllowedAction,
		keyActionToCameraMotion,
		moveCamera,
		removeArrayEl
	} from '$lib/utils';
	import { ActionType } from '$lib/constants';
	import ActionBanner from '$lib/components/ActionBanner.svelte';
	import Whiteboard from '$lib/components/Whiteboard.svelte';

	let innerHeight = 0,
		innerWidth = 0;

	let camera = { x: 0, y: 2, z: 2 };

	let commitsIdsToLabel: Commit['id'][] = [];
	const displayLabelInputs = (id: Commit['id'][]) => {
		commitsIdsToLabel = id;
	};

	const handleLabelSubmit = (ev: CustomEvent<{label: string, commit: Commit}>) => {
		const {commit, label} = ev.detail
		commits.renameCommit(commit, label);
		commitsIdsToLabel = removeArrayEl(commitsIdsToLabel, commit.id);
		selectedCommitIds = removeArrayEl(selectedCommitIds, commit.id);
	};

	let editMode: ActionType | undefined;
	const handleKeydown = (ev: KeyboardEvent) => {
		if (ev.repeat) return;

		const { key, shiftKey } = ev;

		if (ActionType.CANCEL === key) {
			selectedCommitIds = [];
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
			selectedCommitIds = [];
			editMode = undefined;
			return;
		}

		editMode = key;

		// ? TODO reset selection for every mode changes
		if (ActionType.RENAME === key) {
			selectedCommitIds = [];
		}
	};

	$: handleBackgoundClick = (ev: CustomEvent<{pos: Pos, gridPos: Pos}>) => {
		if (editMode === undefined) return;

		const pos = ev.detail.gridPos;

		if (ActionType.COMMIT === editMode) {
			const parents = selectedCommitIds.slice(0, 2);
			if (!parents.length) return;

			const newCommit = { pos, parents } as Commit;

			const prevLastCommitId = $commits.lastCommitId;
			commits.addCommit(newCommit);
			const lastCommitId = $commits.lastCommitId;

			if (prevLastCommitId !== lastCommitId) {
				// a new commit was created
				selectedCommitIds = [lastCommitId]; // to chain creation
			}
			return;
		}

		if (ActionType.POSITION === editMode) {
			const toMoveId = selectedCommitIds.at(0);
			if (!toMoveId) return;

			commits.moveCommit(toMoveId, pos);
		}
	};

	let selectedCommitIds: Commit['id'][] = [];
	const handleCommitClick = (ev: CustomEvent<{commit: Commit}>) => {
		const clicked = ev.detail.commit
		if (ActionType.DELETE === editMode) {
			return commits.delete(clicked.id);
		}

		if (ActionType.UNBASE === editMode) {
			return commits.removeParents(clicked.id);
		}

		if (ActionType.REBASE === editMode && selectedCommitIds.length === 1) {
			// TODO perform a real rebase (select 2 or 3 commits, and checks that it's possible, with a nice animation)
			return commits.setParent(selectedCommitIds[0], clicked.id);
		}

		if (ActionType.POSITION === editMode) {
			selectedCommitIds = [clicked.id];
			return;
		}

		if (ActionType.COMMIT === editMode && selectedCommitIds.length >= 2) {
			return;
		}

		const newSelectedCommits = selectedCommitIds.filter((id) => id !== clicked.id);
		if (selectedCommitIds.length === newSelectedCommits.length) {
			// not already selected
			newSelectedCommits.push(clicked.id);
		}
		selectedCommitIds = newSelectedCommits;

		if (ActionType.RENAME === editMode) {
			displayLabelInputs(selectedCommitIds);
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
	<Whiteboard
		{camera}
		width={innerWidth}
		height={innerHeight}
		commits={$commitList}
		{commitsToLabel}
		selectedCommitIds={selectedCommitIds}
		on:backgound-click={handleBackgoundClick}
		on:commit-click={handleCommitClick}
		on:label-submit={handleLabelSubmit}
	/>
{/if}

<style>
	.mode-info {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
