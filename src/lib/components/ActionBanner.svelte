<script lang="ts">
	import { ActionType } from '$lib/constants';

	export let action: ActionType | undefined;
</script>

{#if action}
	<p class="banner">
		Mode: <span>
			{#if action === ActionType.COMMIT}
				commit creation
			{/if}
			{#if action === ActionType.MOVE}
				reposition
			{/if}
			{#if action === ActionType.RENAME}
				rename
			{/if}
		</span>
	</p>
{/if}

<style>
	.banner {
		padding: .2em 1em;
		margin: .2em;
	}
</style>
