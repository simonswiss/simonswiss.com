<script lang="ts">
	import type { ClipWithTags } from '$lib/types';
	import { formatDuration, convertFileSrc } from '$lib/utils';

	let {
		clip,
		onClose,
		onRate,
		onStatus,
		onPrev,
		onNext
	}: {
		clip: ClipWithTags;
		onClose: () => void;
		onRate: (rating: number) => void;
		onStatus: (status: 'unreviewed' | 'kept' | 'rejected') => void;
		onPrev: () => void;
		onNext: () => void;
	} = $props();

	let videoEl = $state<HTMLVideoElement | null>(null);

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowLeft':
				if (e.shiftKey) {
					e.preventDefault();
					onPrev();
				} else if (videoEl) {
					e.preventDefault();
					videoEl.currentTime = Math.max(0, videoEl.currentTime - 5);
				}
				break;
			case 'ArrowRight':
				if (e.shiftKey) {
					e.preventDefault();
					onNext();
				} else if (videoEl) {
					e.preventDefault();
					videoEl.currentTime += 5;
				}
				break;
			case 'j':
				e.preventDefault();
				onPrev();
				break;
			case 'k':
				e.preventDefault();
				onNext();
				break;
			case ' ':
				e.preventDefault();
				if (videoEl) {
					if (videoEl.paused) videoEl.play();
					else videoEl.pause();
				}
				break;
			case 'Escape':
				e.preventDefault();
				onClose();
				break;
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex flex-col bg-black/95"
	onclick={(e) => {
		if (e.target === e.currentTarget) onClose();
	}}
	onkeydown={() => {}}
>
	<!-- Top bar -->
	<div class="flex items-center justify-between px-4 py-3">
		<div class="flex items-center gap-4">
			<h3 class="text-sm font-medium text-white">{clip.file_name}</h3>
			{#if clip.duration_secs}
				<span class="text-xs text-white/50">{formatDuration(clip.duration_secs)}</span>
			{/if}
		</div>

		<div class="flex items-center gap-3">
			<!-- Rating -->
			<div class="flex items-center gap-0.5">
				{#each [1, 2, 3, 4, 5] as star}
					<button
						class="text-lg transition-colors {clip.rating >= star
							? 'text-star'
							: 'text-white/20 hover:text-star/60'}"
						onclick={() => onRate(clip.rating === star ? 0 : star)}
					>
						★
					</button>
				{/each}
			</div>

			<!-- Status buttons -->
			<div class="flex gap-2">
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {clip.status === 'kept'
						? 'bg-kept text-white'
						: 'bg-white/10 text-white/60 hover:text-kept'}"
					onclick={() => onStatus(clip.status === 'kept' ? 'unreviewed' : 'kept')}
				>
					Keep
				</button>
				<button
					class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors {clip.status === 'rejected'
						? 'bg-rejected text-white'
						: 'bg-white/10 text-white/60 hover:text-rejected'}"
					onclick={() => onStatus(clip.status === 'rejected' ? 'unreviewed' : 'rejected')}
				>
					Reject
				</button>
			</div>

			<button
				class="rounded-md p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
				onclick={onClose}
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
			</button>
		</div>
	</div>

	<!-- Video -->
	<div class="flex flex-1 items-center justify-center min-h-0 px-16">
		<video
			bind:this={videoEl}
			class="max-h-full max-w-full rounded"
			src={convertFileSrc(clip.file_path)}
			controls
			autoplay
		>
			<track kind="captions" />
		</video>
	</div>

	<!-- Navigation -->
	<div class="flex items-center justify-center gap-4 py-3">
		<button
			class="rounded-md bg-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/20 hover:text-white"
			onclick={onPrev}
		>
			Previous (J)
		</button>
		<button
			class="rounded-md bg-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/20 hover:text-white"
			onclick={onNext}
		>
			Next (K)
		</button>
	</div>

	<!-- Hints -->
	<div class="flex justify-center gap-4 pb-3 text-xs text-white/30">
		<span>Space: Play/Pause</span>
		<span>Arrow keys: Seek 5s</span>
		<span>J/K: Prev/Next clip</span>
		<span>1-5: Rate</span>
		<span>Y: Keep</span>
		<span>X: Reject</span>
		<span>Esc: Close</span>
	</div>
</div>
