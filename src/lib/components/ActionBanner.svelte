<script lang="ts">
	import { ActionType } from '$lib/constants';

	export let action: ActionType | undefined;
</script>

<div class="action-banner">
	{#if !action}
		<p class="ask-help">press "<strong>h</strong>" for help</p>
	{:else if action === ActionType.HELP}
		<div class="help-banner">
			<section>
				<h4>General</h4>
				<p>Display help: press "<strong>h</strong>"</p>
				<p>Change point of view: use <strong>arrow keys</strong>. Press shift alongside to zoom.</p>
				<p>Beautify graph: press "<strong>b</strong>".</p>
			</section>
			<hr />
			<section>
				<h4>Edition modes</h4>
				<p>To enter a specific mode, press the respective key. Press once more to leave it.</p>
				<ul>
					<li>
						<p>
							"<strong>c</strong>" mode: to create commits. <br />Select up to 2 commits then click
							on target position.
						</p>
					</li>
					<li>
						<p>
							"<strong>n</strong>" mode: to rename commits. <br />Select commit then input new
							label.
						</p>
					</li>
					<li>
						<p>
							"<strong>p</strong>" mode: to re-position commits. <br />Select commit then click on
							target position.
						</p>
					</li>
					<li>
						<p>
							"<strong>d</strong>" mode: to delete commits. <br />Select commit.
						</p>
					</li>
					<li>
						<p>
							"<strong>u</strong>" mode: to "unbase" commits, i.e. to remove their parents. <br />Select commit.
						</p>
					</li>
					<li>
						<p>
							"<strong>r</strong>" mode: to "rebase" commits, i.e. change their parents. <br />Select commit then click on new parent.
						</p>
					</li>
				</ul>
			</section>
		</div>
	{:else}
		<p class="banner">
			Mode: <span>
				{#if action === ActionType.COMMIT}
					commit creation
				{/if}
				{#if action === ActionType.POSITION}
					reposition
				{/if}
				{#if action === ActionType.RENAME}
					rename
				{/if}
				{#if action === ActionType.DELETE}
					delete
				{/if}
				{#if action === ActionType.UNBASE}
					unbase
				{/if}
				{#if action === ActionType.REBASE}
					rebase
				{/if}
			</span>
		</p>
	{/if}
</div>

<style>
	.action-banner {
		padding: 0.2em 1em;
	}
	.ask-help {
		margin: 0em;
	}
	.banner {
		margin: 0.2em;
	}

	.help-banner {
		background-color: rgba(0, 0, 0, 0.2);
		padding: 0.2em 1em;
	}
</style>
