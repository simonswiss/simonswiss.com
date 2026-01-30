<script lang="ts">
	import type { ClipWithTags, Tag } from '$lib/types';
	import { formatDuration, formatFileSize, convertFileSrc, TAG_COLORS } from '$lib/utils';

	let {
		clip,
		tags,
		onRate,
		onStatus,
		onNotes,
		onToggleTag,
		onCreateTag,
		onDeleteTag,
		onPlay
	}: {
		clip: ClipWithTags;
		tags: Tag[];
		onRate: (rating: number) => void;
		onStatus: (status: 'unreviewed' | 'kept' | 'rejected') => void;
		onNotes: (notes: string) => void;
		onToggleTag: (tagId: number) => void;
		onCreateTag: (name: string, color: string) => void;
		onDeleteTag: (tagId: number) => void;
		onPlay: () => void;
	} = $props();

	let newTagName = $state('');
	let newTagColor = $state(TAG_COLORS[0]);
	let showNewTag = $state(false);

	function handleCreateTag() {
		if (!newTagName.trim()) return;
		onCreateTag(newTagName.trim(), newTagColor);
		newTagName = '';
		showNewTag = false;
	}
</script>

<div class="flex w-80 flex-col border-l border-border bg-surface overflow-y-auto">
	<!-- Preview thumbnail -->
	<div class="relative aspect-video w-full bg-bg cursor-pointer" role="button" tabindex="0" onclick={onPlay} onkeydown={(e) => e.key === 'Enter' && onPlay()}>
		{#if clip.thumbnail_path}
			<img
				src={convertFileSrc(clip.thumbnail_path)}
				alt={clip.file_name}
				class="h-full w-full object-cover"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-text-muted">
				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
			</div>
		{/if}
		<div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
			<div class="rounded-full bg-black/60 p-3 text-white">
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
			</div>
		</div>
	</div>

	<div class="flex-1 p-4 space-y-5">
		<!-- File info -->
		<div>
			<h3 class="text-sm font-semibold text-text break-all">{clip.file_name}</h3>
			<div class="mt-1 grid grid-cols-2 gap-y-1 text-xs text-text-muted">
				<span>Size</span>
				<span class="text-right text-text">{formatFileSize(clip.file_size)}</span>
				{#if clip.duration_secs}
					<span>Duration</span>
					<span class="text-right text-text">{formatDuration(clip.duration_secs)}</span>
				{/if}
				{#if clip.width && clip.height}
					<span>Resolution</span>
					<span class="text-right text-text">{clip.width}x{clip.height}</span>
				{/if}
			</div>
		</div>

		<!-- Rating -->
		<div>
			<label class="mb-1.5 block text-xs font-medium text-text-muted uppercase tracking-wide">Rating</label>
			<div class="flex items-center gap-1">
				{#each [1, 2, 3, 4, 5] as star}
					<button
						class="text-xl transition-colors {clip.rating >= star
							? 'text-star'
							: 'text-border hover:text-star/60'}"
						onclick={() => onRate(clip.rating === star ? 0 : star)}
					>
						★
					</button>
				{/each}
				{#if clip.rating > 0}
					<button
						class="ml-2 text-xs text-text-muted hover:text-text"
						onclick={() => onRate(0)}
					>
						Clear
					</button>
				{/if}
			</div>
		</div>

		<!-- Status -->
		<div>
			<label class="mb-1.5 block text-xs font-medium text-text-muted uppercase tracking-wide">Status</label>
			<div class="flex gap-2">
				<button
					class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {clip.status === 'kept'
						? 'bg-kept text-white'
						: 'bg-surface-hover text-text-muted hover:text-kept'}"
					onclick={() => onStatus(clip.status === 'kept' ? 'unreviewed' : 'kept')}
				>
					Keep (Y)
				</button>
				<button
					class="flex-1 rounded-md py-2 text-sm font-medium transition-colors {clip.status === 'rejected'
						? 'bg-rejected text-white'
						: 'bg-surface-hover text-text-muted hover:text-rejected'}"
					onclick={() => onStatus(clip.status === 'rejected' ? 'unreviewed' : 'rejected')}
				>
					Reject (X)
				</button>
			</div>
		</div>

		<!-- Tags -->
		<div>
			<label class="mb-1.5 block text-xs font-medium text-text-muted uppercase tracking-wide">Tags</label>
			<div class="flex flex-wrap gap-1.5">
				{#each tags as tag}
					{@const active = clip.tags.some((t) => t.id === tag.id)}
					<button
						class="group/tag flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
						style="background: {active ? tag.color + '33' : 'var(--color-surface-hover)'}; color: {active
							? tag.color
							: 'var(--color-text-muted)'}"
						onclick={() => onToggleTag(tag.id)}
					>
						{tag.name}
						<span
							class="ml-0.5 hidden cursor-pointer text-[10px] opacity-50 hover:opacity-100 group-hover/tag:inline"
							role="button"
							tabindex="0"
							onclick={(e) => {
								e.stopPropagation();
								onDeleteTag(tag.id);
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.stopPropagation();
									onDeleteTag(tag.id);
								}
							}}
						>
							×
						</span>
					</button>
				{/each}

				{#if showNewTag}
					<div class="flex w-full items-center gap-1.5 mt-1">
						<input
							type="text"
							class="flex-1 rounded border border-border bg-bg px-2 py-1 text-xs text-text placeholder-text-muted focus:border-accent focus:outline-none"
							placeholder="Tag name..."
							bind:value={newTagName}
							onkeydown={(e) => e.key === 'Enter' && handleCreateTag()}
						/>
						<div class="flex gap-0.5">
							{#each TAG_COLORS.slice(0, 5) as color}
								<button
									class="h-4 w-4 rounded-full border-2 transition-all {newTagColor === color
										? 'border-white scale-110'
										: 'border-transparent'}"
									style="background: {color}"
									onclick={() => (newTagColor = color)}
								></button>
							{/each}
						</div>
						<button
							class="text-xs text-accent hover:text-accent-hover"
							onclick={handleCreateTag}
						>
							Add
						</button>
						<button
							class="text-xs text-text-muted hover:text-text"
							onclick={() => (showNewTag = false)}
						>
							×
						</button>
					</div>
				{:else}
					<button
						class="rounded-md border border-dashed border-border px-2 py-1 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
						onclick={() => (showNewTag = true)}
					>
						+ New Tag
					</button>
				{/if}
			</div>
		</div>

		<!-- Notes -->
		<div>
			<label class="mb-1.5 block text-xs font-medium text-text-muted uppercase tracking-wide">Notes</label>
			<textarea
				class="w-full rounded-md border border-border bg-bg p-2 text-sm text-text placeholder-text-muted focus:border-accent focus:outline-none resize-none"
				rows="3"
				placeholder="Add notes about this clip..."
				value={clip.notes}
				onblur={(e) => onNotes(e.currentTarget.value)}
			></textarea>
		</div>
	</div>
</div>
