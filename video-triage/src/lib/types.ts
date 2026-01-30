export interface Project {
  id: number
  name: string
  root_path: string
  created_at: string
}

export interface Clip {
  id: number
  project_id: number
  file_path: string
  file_name: string
  file_size: number
  duration_secs: number | null
  width: number | null
  height: number | null
  rating: number
  status: 'unreviewed' | 'kept' | 'rejected'
  notes: string
  thumbnail_path: string | null
  sprite_path: string | null
  sprite_frames: number
  created_at: string
}

export interface Tag {
  id: number
  name: string
  color: string
}

export interface ClipWithTags extends Clip {
  tags: Tag[]
}

export interface ScanResult {
  clips: Clip[]
  total_found: number
}

export interface ExportResult {
  exported: number
  failed: number
  destination: string
}

export type StatusFilter = 'all' | 'unreviewed' | 'kept' | 'rejected'
export type SortBy = 'name' | 'rating' | 'status' | 'date' | 'size'
export type ViewMode = 'grid' | 'list'
