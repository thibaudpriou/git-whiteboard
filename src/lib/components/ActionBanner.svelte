<script lang="ts">
	import { ActionType } from '$lib/constants';

	export let action: ActionType | undefined;
</script>

{#if action}
	<p class="mode-info">
		Mode: <span>
			{#if action === ActionType.COMMIT}
				commit creation
			{/if}
			{#if action === ActionType.MOVE}
				reposition
			{/if}
		</span>
	</p>
{/if}
