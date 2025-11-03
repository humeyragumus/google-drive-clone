/* eslint-disable no-unused-vars */

declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface ActionType {
  label: string;
  icon: string;
  value: string;
}

declare interface SearchParamProps {
  params?: Promise<SegmentParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

declare interface UploadFileProps {
  file: File;
  ownerId: string;
  accountId: string;
  path: string;
  folderId?: string;
}
declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
  folderId?: string;
}
declare interface RenameFileProps {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}
declare interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
  path: string;
  shareOptions?: {
    password?: string;
    expiryDate?: string;
    permission?: 'read' | 'write';
  };
}
declare interface DeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}

declare interface FileUploaderProps {
  ownerId: string;
  accountId: string;
  className?: string;
}

declare interface MobileNavigationProps {
  ownerId: string;
  accountId: string;
  fullName: string;
  avatar: string;
  email: string;
}
declare interface SidebarProps {
  fullName: string;
  avatar: string;
  email: string;
}

declare interface ThumbnailProps {
  type: string;
  extension: string;
  url: string;
  className?: string;
  imageClassName?: string;
}

declare interface ShareInputProps {
  file: Models.Document;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (email: string) => void;
}

declare interface HTMLInputElement {
  webkitdirectory?: string;
  directory?: string;
}

declare interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
  webkitdirectory?: string;
  directory?: string;
}

declare interface ShareStats {
  views: number;
  downloads: number;
  lastAccessed?: string;
}

declare interface SharedUser {
  email: string;
  permission: 'read' | 'write';
  addedAt: string;
}

declare interface IFile extends Models.Document {
  name: string;
  owner: {
    id: string;
    fullName: string;
  };
  size: number;
  extension: string;
  bucketFileId: string;
  url: string;
  users?: SharedUser[];
  sharePassword?: string;
  shareExpiryDate?: string;
  sharePermission?: 'read' | 'write';
  shareStatsViews?: number;
  shareStatsDownloads?: number;
  shareStatsLastAccessed?: string | null;
}
