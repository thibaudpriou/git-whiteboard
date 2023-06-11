<script lang="ts">
	import { computeGridSize, getGridFromPosition, getPositionFromGrid } from '$lib/utils';
	import type { Commit, CommitWithParents, Pos, Pos3D } from '$types';
	import { createEventDispatcher } from 'svelte';
	import CommitGraphic from './CommitGraphic.svelte';
	import CommitLinkGraphic from './CommitLinkGraphic.svelte';
	import LabelInput from './LabelInput.svelte';

	export let width: number, height: number;
	export let camera: Pos3D;
	export let commits: CommitWithParents[];
	export let commitsToLabel: Commit[];
	export let selectedCommitIds: Commit['id'][];

	const dispatch = createEventDispatcher();

	let gridSize: number;
	let grid2pos: (p: Pos) => Pos;
	let pos2grid: (p: Pos) => Pos;
	$: {
		const win = { innerWidth: width, innerHeight: height };
		gridSize = computeGridSize(100, camera);
		grid2pos = getPositionFromGrid.bind(null, win, camera, gridSize);
		pos2grid = getGridFromPosition.bind(null, win, camera, gridSize);
	}

	const handleBackgroundClick = (ev: MouseEvent) => {
		const { clientX: x, clientY: y } = ev;
		const pos = { x, y };
		const gridPos = pos2grid(pos);
		const detail = { pos, gridPos };
		dispatch('backgound-click', detail);
	};

	const handleCommitClick = (commit: Commit) => {
		const detail = { commit };
		dispatch('commit-click', detail);
	};

	const handleLabelSubmit = (commit: Commit, ev: CustomEvent<{ label: string }>) => {
		const detail = { ...ev.detail, commit };
		dispatch('label-submit', detail);
	};
</script>

<div class="whiteboard">
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<svg {width} {height} on:click={handleBackgroundClick}>
		<!-- display links underneath commits  -->
		{#each commits as commit (commit.id)}
			{#each commit.parentsCommits ?? [] as parent}
				<CommitLinkGraphic startPoint={grid2pos(parent.pos)} endPoint={grid2pos(commit.pos)} />
			{/each}
		{/each}

		{#each commits as commit (commit.id)}
			<CommitGraphic
				pos={grid2pos(commit.pos)}
				label={commit.name}
				radius={gridSize / 4}
				on:click={() => handleCommitClick(commit)}
				selected={selectedCommitIds.some((id) => id === commit.id)}
			/>
		{/each}
	</svg>

	{#each commitsToLabel as c}
		{@const gridPos = grid2pos(c.pos)}
		<span class="label-input" style:--x={gridPos.x} style:--y={gridPos.y}>
			<LabelInput label={c.name} on:submit={(e) => handleLabelSubmit(c, e)} />
		</span>
	{/each}
</div>

<style>
	.whiteboard {
		position: relative;
	}

	.label-input {
		position: absolute;
		top: calc(var(--y) * 1px);
		left: calc(var(--x) * 1px);
	}
</style>
