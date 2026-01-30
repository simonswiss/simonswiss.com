<script lang="ts">
	import type { ClipWithTags } from '$lib/types';
	import { formatDuration, formatFileSize, convertFileSrc } from '$lib/utils';

	let {
		clips,
		selectedClipIndex,
		onSelect,
		onPlay,
		onRate,
		onStatus
	}: {
		clips: ClipWithTags[];
		selectedClipIndex: number;
		onSelect: (index: number) => void;
		onPlay: (index: number) => void;
		onRate: (clipId: number, rating: number) => void;
		onStatus: (clipId: number, status: 'unreviewed' | 'kept' | 'rejected') => void;
	} = $props();

	// Track scrub state per-card: which frame index is showing, and the scrub progress (0-1)
	let scrubData = $state<{ index: number; progress: number; frameIndex: number } | null>(null);

	function handleMouseMove(e: MouseEvent, clipIndex: number, clip: ClipWithTags) {
		if (!clip.sprite_path || clip.sprite_frames <= 1) return;

		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const x = e.clientX - rect.left;
		const progress = Math.max(0, Math.min(1, x / rect.width));
		const frameIndex = Math.min(
			clip.sprite_frames - 1,
			Math.floor(progress * clip.sprite_frames)
		);

		scrubData = { index: clipIndex, progress, frameIndex };
	}

	function handleMouseLeave() {
		scrubData = null;
	}

	function statusColor(status: string) {
		switch (status) {
			case 'kept':
				return 'border-kept';
			case 'rejected':
				return 'border-rejected';
			default:
				return 'border-transparent';
		}
	}

	function statusIcon(status: string) {
		switch (status) {
			case 'kept':
				return '✓';
			case 'rejected':
				return '✗';
			default:
				return '';
		}
	}
</script>

{#if clips.length === 0}
	<div class="flex h-full items-center justify-center">
		<div class="text-center text-text-muted">
			<svg class="mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
			<p class="text-lg">No clips found</p>
			<p class="text-sm">Import a footage folder to get started</p>
		</div>
	</div>
{:else}
	<div class="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
		{#each clips as clip, i}
			{@const isScrubbing = scrubData?.index === i}
			{@const frameIndex = isScrubbing ? scrubData!.frameIndex : 0}
			{@const progress = isScrubbing ? scrubData!.progress : 0}
			<div
				class="group relative cursor-pointer overflow-hidden rounded-lg border-2 bg-surface transition-all {selectedClipIndex === i
					? 'border-accent ring-1 ring-accent/50'
					: statusColor(clip.status)} hover:ring-1 hover:ring-accent/30"
				role="button"
				tabindex="0"
				onclick={() => onSelect(i)}
				ondblclick={() => onPlay(i)}
				onkeydown={(e) => e.key === 'Enter' && onPlay(i)}
			>
				<!-- Thumbnail area with sprite scrubbing -->
				<div
					class="relative aspect-video bg-bg overflow-hidden"
					onmousemove={(e) => handleMouseMove(e, i, clip)}
					onmouseleave={handleMouseLeave}
				>
					{#if isScrubbing && clip.sprite_path}
						<!-- Sprite strip: show the correct frame by shifting background-position -->
						<div
							class="absolute inset-0"
							style="
								background-image: url('{convertFileSrc(clip.sprite_path)}');
								background-size: {clip.sprite_frames * 100}% 100%;
								background-position: {(frameIndex / Math.max(1, clip.sprite_frames - 1)) * 100}% 0%;
								background-repeat: no-repeat;
							"
						></div>
					{:else if clip.thumbnail_path}
						<img
							src={convertFileSrc(clip.thumbnail_path)}
							alt={clip.file_name}
							class="h-full w-full object-cover"
							loading="lazy"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center text-text-muted">
							<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
						</div>
					{/if}

					<!-- Scrub progress bar -->
					{#if isScrubbing}
						<div class="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
							<div
								class="h-full bg-accent transition-none"
								style="width: {progress * 100}%"
							></div>
						</div>
						<!-- Scrub timestamp -->
						{#if clip.duration_secs}
							<span class="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white tabular-nums">
								{formatDuration(progress * clip.duration_secs)}
							</span>
						{/if}
					{/if}

					<!-- Duration badge (when not scrubbing) -->
					{#if !isScrubbing && clip.duration_secs}
						<span class="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-1.5 py-0.5 text-xs text-white">
							{formatDuration(clip.duration_secs)}
						</span>
					{/if}

					<!-- Status indicator -->
					{#if clip.status !== 'unreviewed'}
						<span
							class="absolute top-1.5 left-1.5 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white {clip.status === 'kept'
								? 'bg-kept'
								: 'bg-rejected'}"
						>
							{statusIcon(clip.status)}
						</span>
					{/if}

					<!-- Play button overlay (only when not scrubbing) -->
					{#if !isScrubbing}
						<div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
							<button
								class="rounded-full bg-black/60 p-2 text-white transition-transform hover:scale-110"
								aria-label="Play clip"
								onclick={(e) => {
									e.stopPropagation();
									onPlay(i);
								}}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
							</button>
						</div>
					{/if}

					<!-- Frame indicator dots -->
					{#if isScrubbing && clip.sprite_frames > 1}
						<div class="absolute top-1.5 right-1.5 flex gap-0.5">
							{#each Array(clip.sprite_frames) as _, f}
								<div
									class="h-1 w-1 rounded-full {f === frameIndex ? 'bg-white' : 'bg-white/30'}"
								></div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Info -->
				<div class="p-2">
					<div class="truncate text-sm font-medium text-text" title={clip.file_name}>
						{clip.file_name}
					</div>
					<div class="mt-0.5 flex items-center justify-between">
						<span class="text-xs text-text-muted">{formatFileSize(clip.file_size)}</span>
						<!-- Star rating -->
						<div class="flex items-center gap-px">
							{#each [1, 2, 3, 4, 5] as star}
								<button
									class="text-xs transition-colors {clip.rating >= star
										? 'text-star'
										: 'text-border hover:text-star/60'}"
									onclick={(e) => {
										e.stopPropagation();
										onRate(clip.id, clip.rating === star ? 0 : star);
									}}
									title="Rate {star}"
								>
									★
								</button>
							{/each}
						</div>
					</div>
					<!-- Tags -->
					{#if clip.tags.length > 0}
						<div class="mt-1 flex flex-wrap gap-1">
							{#each clip.tags as tag}
								<span
									class="rounded px-1.5 py-0.5 text-[10px] font-medium"
									style="background: {tag.color}22; color: {tag.color}"
								>
									{tag.name}
								</span>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>
{/if}
