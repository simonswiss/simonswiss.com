import { invoke } from '@tauri-apps/api/core'
import type {
  Project,
  Clip,
  ClipWithTags,
  Tag,
  ScanResult,
  ExportResult,
} from './types'

// Project commands
export async function createProject(
  name: string,
  rootPath: string,
): Promise<Project> {
  return invoke('create_project', { name, rootPath })
}

export async function getProjects(): Promise<Project[]> {
  return invoke('get_projects')
}

export async function deleteProject(projectId: number): Promise<void> {
  return invoke('delete_project', { projectId })
}

// Scan & Import commands
export async function scanFolder(
  projectId: number,
  folderPath: string,
): Promise<ScanResult> {
  return invoke('scan_folder', { projectId, folderPath })
}

// Clip commands
export async function getClips(projectId: number): Promise<Clip[]> {
  return invoke('get_clips', { projectId })
}

export async function getClipsWithTags(
  projectId: number,
): Promise<ClipWithTags[]> {
  return invoke('get_clips_with_tags', { projectId })
}

export async function updateClipRating(
  clipId: number,
  rating: number,
): Promise<void> {
  return invoke('update_clip_rating', { clipId, rating })
}

export async function updateClipStatus(
  clipId: number,
  status: string,
): Promise<void> {
  return invoke('update_clip_status', { clipId, status })
}

export async function updateClipNotes(
  clipId: number,
  notes: string,
): Promise<void> {
  return invoke('update_clip_notes', { clipId, notes })
}

// Thumbnail commands
export async function generateThumbnail(
  clipId: number,
  filePath: string,
  outputDir: string,
): Promise<string> {
  return invoke('generate_thumbnail', { clipId, filePath, outputDir })
}

export async function getVideoMetadata(
  filePath: string,
): Promise<[number, number, number]> {
  return invoke('get_video_metadata', { filePath })
}

export async function getThumbnailDir(): Promise<string> {
  return invoke('get_thumbnail_dir')
}

// Tag commands
export async function createTag(name: string, color: string): Promise<Tag> {
  return invoke('create_tag', { name, color })
}

export async function getTags(): Promise<Tag[]> {
  return invoke('get_tags')
}

export async function deleteTag(tagId: number): Promise<void> {
  return invoke('delete_tag', { tagId })
}

export async function addClipTag(clipId: number, tagId: number): Promise<void> {
  return invoke('add_clip_tag', { clipId, tagId })
}

export async function removeClipTag(
  clipId: number,
  tagId: number,
): Promise<void> {
  return invoke('remove_clip_tag', { clipId, tagId })
}

export async function getClipTags(clipId: number): Promise<Tag[]> {
  return invoke('get_clip_tags', { clipId })
}

// Export commands
export async function exportKeptClips(
  projectId: number,
  destination: string,
): Promise<ExportResult> {
  return invoke('export_kept_clips', { projectId, destination })
}
