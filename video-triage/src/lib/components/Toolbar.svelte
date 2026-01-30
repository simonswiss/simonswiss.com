<script lang="ts">
	import type { Tag, StatusFilter, SortBy } from '$lib/types';

	let {
		projectName,
		stats,
		statusFilter,
		ratingFilter,
		tagFilter,
		sortBy,
		searchQuery,
		tags,
		isScanning,
		scanProgress,
		onStatusFilterChange,
		onRatingFilterChange,
		onTagFilterChange,
		onSortChange,
		onSearchChange,
		onImport,
		onExport,
		onBack,
		onToggleSidebar
	}: {
		projectName: string;
		stats: { total: number; unreviewed: number; kept: number; rejected: number };
		statusFilter: StatusFilter;
		ratingFilter: number;
		tagFilter: number | null;
		sortBy: SortBy;
		searchQuery: string;
		tags: Tag[];
		isScanning: boolean;
		scanProgress: string;
		onStatusFilterChange: (v: StatusFilter) => void;
		onRatingFilterChange: (v: number) => void;
		onTagFilterChange: (v: number | null) => void;
		onSortChange: (v: SortBy) => void;
		onSearchChange: (v: string) => void;
		onImport: () => void;
		onExport: () => void;
		onBack: () => void;
		onToggleSidebar: () => void;
	} = $props();
</script>

<div class="flex flex-col border-b border-border bg-surface">
	<!-- Top bar -->
	<div class="flex items-center gap-3 px-4 py-2.5">
		<button
			class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
			onclick={onBack}
			title="Back to projects"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
		</button>

		<h1 class="text-lg font-semibold text-text">{projectName}</h1>

		<!-- Stats badges -->
		<div class="flex items-center gap-2 ml-4">
			<span class="rounded bg-surface-hover px-2 py-0.5 text-xs text-text-muted">{stats.total} clips</span>
			{#if stats.unreviewed > 0}
				<span class="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">{stats.unreviewed} unreviewed</span>
			{/if}
			{#if stats.kept > 0}
				<span class="rounded bg-kept/20 px-2 py-0.5 text-xs text-kept">{stats.kept} kept</span>
			{/if}
			{#if stats.rejected > 0}
				<span class="rounded bg-rejected/20 px-2 py-0.5 text-xs text-rejected">{stats.rejected} rejected</span>
			{/if}
		</div>

		<div class="flex-1"></div>

		{#if isScanning}
			<span class="text-sm text-accent animate-pulse">{scanProgress}</span>
		{/if}

		<!-- Action buttons -->
		<button
			class="rounded-md bg-surface-hover px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-active hover:text-text"
			onclick={onImport}
			disabled={isScanning}
		>
			Re-scan
		</button>
		<button
			class="rounded-md bg-kept/20 px-3 py-1.5 text-sm text-kept transition-colors hover:bg-kept/30"
			onclick={onExport}
		>
			Export Kept
		</button>
		<button
			class="rounded p-1.5 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
			onclick={onToggleSidebar}
			title="Toggle sidebar (I)"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M15 3v18"/></svg>
		</button>
	</div>

	<!-- Filter bar -->
	<div class="flex items-center gap-3 border-t border-border px-4 py-2">
		<!-- Search -->
		<div class="relative">
			<svg class="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
			<input
				type="text"
				placeholder="Search clips..."
				class="rounded-md border border-border bg-bg py-1.5 pl-8 pr-3 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none w-48"
				value={searchQuery}
				oninput={(e) => onSearchChange(e.currentTarget.value)}
			/>
		</div>

		<div class="h-4 w-px bg-border"></div>

		<!-- Status filter -->
		<div class="flex items-center gap-1">
			{#each ['all', 'unreviewed', 'kept', 'rejected'] as status}
				<button
					class="rounded-md px-2.5 py-1 text-xs font-medium transition-colors {statusFilter === status
						? status === 'kept'
							? 'bg-kept/20 text-kept'
							: status === 'rejected'
								? 'bg-rejected/20 text-rejected'
								: 'bg-accent/20 text-accent'
						: 'text-text-muted hover:bg-surface-hover hover:text-text'}"
					onclick={() => onStatusFilterChange(status as StatusFilter)}
				>
					{status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
				</button>
			{/each}
		</div>

		<div class="h-4 w-px bg-border"></div>

		<!-- Rating filter -->
		<div class="flex items-center gap-0.5">
			<span class="mr-1 text-xs text-text-muted">Min:</span>
			{#each [0, 1, 2, 3, 4, 5] as r}
				<button
					class="rounded px-1.5 py-0.5 text-xs transition-colors {ratingFilter === r
						? 'bg-star/20 text-star'
						: 'text-text-muted hover:text-star'}"
					onclick={() => onRatingFilterChange(r)}
				>
					{r === 0 ? 'Any' : '★'.repeat(r)}
				</button>
			{/each}
		</div>

		<div class="h-4 w-px bg-border"></div>

		<!-- Tag filter -->
		{#if tags.length > 0}
			<div class="flex items-center gap-1">
				<button
					class="rounded-md px-2 py-0.5 text-xs transition-colors {tagFilter === null
						? 'bg-accent/20 text-accent'
						: 'text-text-muted hover:text-text'}"
					onclick={() => onTagFilterChange(null)}
				>
					All tags
				</button>
				{#each tags as tag}
					<button
						class="rounded-md px-2 py-0.5 text-xs transition-colors"
						style="background: {tagFilter === tag.id
							? tag.color + '33'
							: 'transparent'}; color: {tagFilter === tag.id ? tag.color : 'var(--color-text-muted)'}"
						onclick={() => onTagFilterChange(tagFilter === tag.id ? null : tag.id)}
					>
						{tag.name}
					</button>
				{/each}
			</div>

			<div class="h-4 w-px bg-border"></div>
		{/if}

		<!-- Sort -->
		<div class="flex items-center gap-1">
			<span class="text-xs text-text-muted">Sort:</span>
			<select
				class="rounded border border-border bg-bg px-2 py-1 text-xs text-text focus:border-accent focus:outline-none"
				value={sortBy}
				onchange={(e) => onSortChange(e.currentTarget.value as SortBy)}
			>
				<option value="name">Name</option>
				<option value="rating">Rating</option>
				<option value="status">Status</option>
				<option value="size">Size</option>
				<option value="date">Date Added</option>
			</select>
		</div>
	</div>
</div>
