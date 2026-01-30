<script lang="ts">
	import { onMount } from 'svelte';
	import { open } from '@tauri-apps/plugin-dialog';
	import {
		getProjects,
		createProject,
		deleteProject,
		scanFolder,
		getClipsWithTags,
		updateClipRating,
		updateClipStatus,
		updateClipNotes,
		generateThumbnail,
		getThumbnailDir,
		getTags,
		createTag,
		deleteTag,
		addClipTag,
		removeClipTag,
		exportKeptClips
	} from '$lib/commands';
	import type { Project, ClipWithTags, Tag, StatusFilter, SortBy } from '$lib/types';
	import { formatDuration, formatFileSize, convertFileSrc, TAG_COLORS } from '$lib/utils';
	import ClipGrid from '$lib/components/ClipGrid.svelte';
	import VideoPlayer from '$lib/components/VideoPlayer.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Toolbar from '$lib/components/Toolbar.svelte';
	import ProjectPicker from '$lib/components/ProjectPicker.svelte';

	let projects = $state<Project[]>([]);
	let currentProject = $state<Project | null>(null);
	let clips = $state<ClipWithTags[]>([]);
	let tags = $state<Tag[]>([]);
	let selectedClipIndex = $state<number>(-1);
	let statusFilter = $state<StatusFilter>('all');
	let ratingFilter = $state<number>(0);
	let tagFilter = $state<number | null>(null);
	let sortBy = $state<SortBy>('name');
	let searchQuery = $state('');
	let isScanning = $state(false);
	let scanProgress = $state('');
	let showPlayer = $state(false);
	let showSidebar = $state(true);
	let thumbnailDir = $state('');
	let showProjectPicker = $state(true);

	let filteredClips = $derived.by(() => {
		let result = clips;

		// Status filter
		if (statusFilter !== 'all') {
			result = result.filter((c) => c.status === statusFilter);
		}

		// Rating filter
		if (ratingFilter > 0) {
			result = result.filter((c) => c.rating >= ratingFilter);
		}

		// Tag filter
		if (tagFilter !== null) {
			result = result.filter((c) => c.tags.some((t) => t.id === tagFilter));
		}

		// Search filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			result = result.filter(
				(c) =>
					c.file_name.toLowerCase().includes(q) ||
					c.notes.toLowerCase().includes(q) ||
					c.tags.some((t) => t.name.toLowerCase().includes(q))
			);
		}

		// Sort
		result = [...result].sort((a, b) => {
			switch (sortBy) {
				case 'name':
					return a.file_name.localeCompare(b.file_name);
				case 'rating':
					return b.rating - a.rating;
				case 'status': {
					const order = { kept: 0, unreviewed: 1, rejected: 2 };
					return (order[a.status] ?? 1) - (order[b.status] ?? 1);
				}
				case 'size':
					return b.file_size - a.file_size;
				case 'date':
					return a.created_at.localeCompare(b.created_at);
				default:
					return 0;
			}
		});

		return result;
	});

	let selectedClip = $derived(
		selectedClipIndex >= 0 && selectedClipIndex < filteredClips.length
			? filteredClips[selectedClipIndex]
			: null
	);

	let stats = $derived({
		total: clips.length,
		unreviewed: clips.filter((c) => c.status === 'unreviewed').length,
		kept: clips.filter((c) => c.status === 'kept').length,
		rejected: clips.filter((c) => c.status === 'rejected').length
	});

	onMount(async () => {
		try {
			thumbnailDir = await getThumbnailDir();
			projects = await getProjects();
			tags = await getTags();
		} catch (e) {
			console.error('Failed to initialize:', e);
		}
	});

	async function handleSelectProject(project: Project) {
		currentProject = project;
		showProjectPicker = false;
		selectedClipIndex = -1;
		await loadClips();
	}

	async function handleCreateProject() {
		const folder = await open({ directory: true, multiple: false });
		if (!folder) return;

		const folderPath = folder as string;
		const name = folderPath.split('/').pop() || 'Untitled Project';

		try {
			const project = await createProject(name, folderPath);
			currentProject = project;
			showProjectPicker = false;
			projects = await getProjects();

			// Auto-scan the folder
			await handleScanFolder(folderPath);
		} catch (e) {
			console.error('Failed to create project:', e);
		}
	}

	async function handleScanFolder(folderPath?: string) {
		if (!currentProject) return;

		const path = folderPath || currentProject.root_path;
		isScanning = true;
		scanProgress = 'Scanning for video files...';

		try {
			const result = await scanFolder(currentProject.id, path);
			scanProgress = `Found ${result.total_found} video files. Generating thumbnails...`;

			await loadClips();

			// Generate thumbnails in the background
			let thumbCount = 0;
			for (const clip of clips) {
				if (!clip.thumbnail_path) {
					try {
						await generateThumbnail(clip.id, clip.file_path, thumbnailDir);
						thumbCount++;
						scanProgress = `Generated ${thumbCount} thumbnails...`;
					} catch (e) {
						console.warn(`Failed to generate thumbnail for ${clip.file_name}:`, e);
					}
				}
			}

			// Reload clips with updated thumbnails
			await loadClips();
			scanProgress = '';
		} catch (e) {
			console.error('Scan failed:', e);
			scanProgress = `Scan failed: ${e}`;
		} finally {
			isScanning = false;
		}
	}

	async function loadClips() {
		if (!currentProject) return;
		try {
			clips = await getClipsWithTags(currentProject.id);
		} catch (e) {
			console.error('Failed to load clips:', e);
		}
	}

	async function handleRating(clipId: number, rating: number) {
		await updateClipRating(clipId, rating);
		const clip = clips.find((c) => c.id === clipId);
		if (clip) clip.rating = rating;
		clips = [...clips];
	}

	async function handleStatus(clipId: number, status: 'unreviewed' | 'kept' | 'rejected') {
		await updateClipStatus(clipId, status);
		const clip = clips.find((c) => c.id === clipId);
		if (clip) clip.status = status;
		clips = [...clips];
	}

	async function handleNotes(clipId: number, notes: string) {
		await updateClipNotes(clipId, notes);
		const clip = clips.find((c) => c.id === clipId);
		if (clip) clip.notes = notes;
		clips = [...clips];
	}

	async function handleToggleTag(clipId: number, tagId: number) {
		const clip = clips.find((c) => c.id === clipId);
		if (!clip) return;

		const hasTag = clip.tags.some((t) => t.id === tagId);
		if (hasTag) {
			await removeClipTag(clipId, tagId);
			clip.tags = clip.tags.filter((t) => t.id !== tagId);
		} else {
			await addClipTag(clipId, tagId);
			const tag = tags.find((t) => t.id === tagId);
			if (tag) clip.tags = [...clip.tags, tag];
		}
		clips = [...clips];
	}

	async function handleCreateTag(name: string, color: string) {
		try {
			const tag = await createTag(name, color);
			tags = [...tags, tag];
		} catch (e) {
			console.error('Failed to create tag:', e);
		}
	}

	async function handleDeleteTag(tagId: number) {
		await deleteTag(tagId);
		tags = tags.filter((t) => t.id !== tagId);
		// Remove from clips too
		for (const clip of clips) {
			clip.tags = clip.tags.filter((t) => t.id !== tagId);
		}
		clips = [...clips];
	}

	async function handleExport() {
		if (!currentProject) return;

		const folder = await open({ directory: true, multiple: false });
		if (!folder) return;

		try {
			const result = await exportKeptClips(currentProject.id, folder as string);
			alert(`Exported ${result.exported} clips${result.failed > 0 ? ` (${result.failed} failed)` : ''}`);
		} catch (e) {
			console.error('Export failed:', e);
			alert(`Export failed: ${e}`);
		}
	}

	async function handleDeleteProject(projectId: number) {
		if (!confirm('Delete this project? This only removes metadata, not your video files.')) return;
		await deleteProject(projectId);
		projects = await getProjects();
		if (currentProject?.id === projectId) {
			currentProject = null;
			clips = [];
			showProjectPicker = true;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		// Don't handle if typing in an input
		if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') return;

		switch (e.key) {
			case 'ArrowRight':
			case 'j':
				e.preventDefault();
				if (selectedClipIndex < filteredClips.length - 1) selectedClipIndex++;
				break;
			case 'ArrowLeft':
			case 'k':
				e.preventDefault();
				if (selectedClipIndex > 0) selectedClipIndex--;
				break;
			case ' ':
			case 'Enter':
				e.preventDefault();
				if (selectedClip) showPlayer = !showPlayer;
				break;
			case 'Escape':
				if (showPlayer) {
					showPlayer = false;
				}
				break;
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
				if (selectedClip) {
					const rating = parseInt(e.key);
					handleRating(selectedClip.id, selectedClip.rating === rating ? 0 : rating);
				}
				break;
			case '0':
				if (selectedClip) handleRating(selectedClip.id, 0);
				break;
			case 'y':
			case 'p':
				if (selectedClip) {
					handleStatus(selectedClip.id, selectedClip.status === 'kept' ? 'unreviewed' : 'kept');
				}
				break;
			case 'x':
				if (selectedClip) {
					handleStatus(selectedClip.id, selectedClip.status === 'rejected' ? 'unreviewed' : 'rejected');
				}
				break;
			case 'i':
				showSidebar = !showSidebar;
				break;
		}
	}

	function handleBackToProjects() {
		showProjectPicker = true;
		currentProject = null;
		clips = [];
		selectedClipIndex = -1;
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="flex h-screen flex-col bg-bg">
	{#if showProjectPicker}
		<ProjectPicker
			{projects}
			onSelect={handleSelectProject}
			onCreate={handleCreateProject}
			onDelete={handleDeleteProject}
		/>
	{:else}
		<!-- Toolbar -->
		<Toolbar
			projectName={currentProject?.name || ''}
			{stats}
			{statusFilter}
			{ratingFilter}
			{tagFilter}
			{sortBy}
			{searchQuery}
			{tags}
			{isScanning}
			{scanProgress}
			onStatusFilterChange={(v) => (statusFilter = v)}
			onRatingFilterChange={(v) => (ratingFilter = v)}
			onTagFilterChange={(v) => (tagFilter = v)}
			onSortChange={(v) => (sortBy = v)}
			onSearchChange={(v) => (searchQuery = v)}
			onImport={() => handleScanFolder()}
			onExport={handleExport}
			onBack={handleBackToProjects}
			onToggleSidebar={() => (showSidebar = !showSidebar)}
		/>

		<!-- Main content -->
		<div class="flex min-h-0 flex-1">
			<!-- Clip grid -->
			<div class="flex-1 overflow-y-auto p-4">
				<ClipGrid
					clips={filteredClips}
					{selectedClipIndex}
					onSelect={(i) => {
						selectedClipIndex = i;
					}}
					onPlay={(i) => {
						selectedClipIndex = i;
						showPlayer = true;
					}}
					onRate={handleRating}
					onStatus={handleStatus}
				/>
			</div>

			<!-- Sidebar -->
			{#if showSidebar && selectedClip}
				<Sidebar
					clip={selectedClip}
					{tags}
					onRate={(r) => handleRating(selectedClip!.id, r)}
					onStatus={(s) => handleStatus(selectedClip!.id, s)}
					onNotes={(n) => handleNotes(selectedClip!.id, n)}
					onToggleTag={(tagId) => handleToggleTag(selectedClip!.id, tagId)}
					onCreateTag={handleCreateTag}
					onDeleteTag={handleDeleteTag}
					onPlay={() => (showPlayer = true)}
				/>
			{/if}
		</div>

		<!-- Video player modal -->
		{#if showPlayer && selectedClip}
			<VideoPlayer
				clip={selectedClip}
				onClose={() => (showPlayer = false)}
				onRate={(r) => handleRating(selectedClip!.id, r)}
				onStatus={(s) => handleStatus(selectedClip!.id, s)}
				onPrev={() => {
					if (selectedClipIndex > 0) selectedClipIndex--;
				}}
				onNext={() => {
					if (selectedClipIndex < filteredClips.length - 1) selectedClipIndex++;
				}}
			/>
		{/if}
	{/if}
</div>
