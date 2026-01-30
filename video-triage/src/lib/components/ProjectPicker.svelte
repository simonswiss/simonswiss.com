<script lang="ts">
	import type { Project } from '$lib/types';

	let {
		projects,
		onSelect,
		onCreate,
		onDelete
	}: {
		projects: Project[];
		onSelect: (project: Project) => void;
		onCreate: () => void;
		onDelete: (id: number) => void;
	} = $props();
</script>

<div class="flex h-full items-center justify-center">
	<div class="w-full max-w-lg p-8">
		<h1 class="mb-2 text-3xl font-bold text-text">Video Triage</h1>
		<p class="mb-8 text-text-muted">Fast video clip review and organization</p>

		{#if projects.length > 0}
			<h2 class="mb-3 text-sm font-medium text-text-muted uppercase tracking-wide">Recent Projects</h2>
			<div class="mb-6 space-y-2">
				{#each projects as project}
					<div
						class="group flex w-full items-center justify-between rounded-lg border border-border bg-surface p-4 text-left transition-colors hover:bg-surface-hover cursor-pointer"
						role="button"
						tabindex="0"
						onclick={() => onSelect(project)}
						onkeydown={(e) => e.key === 'Enter' && onSelect(project)}
					>
						<div>
							<div class="font-medium text-text">{project.name}</div>
							<div class="text-sm text-text-muted">{project.root_path}</div>
						</div>
						<button
							class="rounded p-1.5 text-text-muted opacity-0 transition-all hover:bg-rejected/20 hover:text-rejected group-hover:opacity-100"
							onclick={(e) => {
								e.stopPropagation();
								onDelete(project.id);
							}}
							title="Delete project"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
						</button>
					</div>
				{/each}
			</div>
		{/if}

		<button
			class="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-text-muted transition-colors hover:border-accent hover:text-accent"
			onclick={onCreate}
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/><line x1="12" y1="10" x2="12" y2="16"/><line x1="9" y1="13" x2="15" y2="13"/></svg>
			Import Footage Folder
		</button>

		<div class="mt-8 rounded-lg bg-surface p-4 text-sm text-text-muted">
			<p class="mb-1 font-medium text-text">Keyboard Shortcuts</p>
			<div class="grid grid-cols-2 gap-1">
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">Arrow keys / J/K</kbd> Navigate</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">Space / Enter</kbd> Play</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">1-5</kbd> Star rating</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">0</kbd> Clear rating</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">Y / P</kbd> Keep clip</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">X</kbd> Reject clip</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">I</kbd> Toggle sidebar</span>
				<span><kbd class="rounded bg-surface-hover px-1.5 py-0.5 text-xs">Esc</kbd> Close player</span>
			</div>
		</div>
	</div>
</div>
