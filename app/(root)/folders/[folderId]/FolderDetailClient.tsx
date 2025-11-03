"use client";

import Image from 'next/image';
import { useState } from 'react';
import { Models } from 'node-appwrite';
import { Thumbnail } from '@/components/Thumbnail';
import { FormattedDateTime } from '@/components/FormattedDateTime';
import { convertFileSize } from '@/lib/utils';
import ActionDropdown from '@/components/ActionDropdown';
import FileUploader from '@/components/FileUploader';
import { getFiles } from '@/lib/actions/file.actions';
import { deleteFolder } from '@/lib/actions/folder.actions';
import { useRouter } from 'next/navigation';

type FolderDetailClientProps = {
  folder: Models.Document | null;
  files: Models.Document[];
  user: any;
  folderId: string;
};

export default function FolderDetailClient({ folder, files: initialFiles, user, folderId }: FolderDetailClientProps) {
  const [files, setFiles] = useState<Models.Document[]>(initialFiles);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleFileUploaded = async () => {
    const folderFiles = await getFiles({
      types: [],
      searchText: '',
      folderId,
    });
    setFiles(folderFiles.documents);
  };

  const handleDeleteFolder = async () => {
    setIsDeleting(true);
    const success = await deleteFolder(folderId);
    setIsDeleting(false);
    setShowDeleteModal(false);
    if (success) {
      router.push('/folders');
    }
  };

  if (!folder || !user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-light-200">Folder not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <button
        className="flex items-center gap-2 w-fit mb-2 px-3 py-1 rounded bg-brand text-white text-sm font-semibold hover:bg-brand/80"
        onClick={() => router.push('/folders')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Klasörlere Dön
      </button>
      <div className="flex items-center gap-3">
        <Image
          src="/assets/icons/folder.svg"
          alt="folder"
          width={32}
          height={32}
        />
        <h1 className="text-2xl font-semibold text-light-100">{folder.name}</h1>
        <button
          className="ml-auto rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete Folder
        </button>
      </div>

      {/* Silme Onay Modali */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white p-8 shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h2 className="text-lg font-semibold text-red-600">Delete Folder</h2>
            <p>Are you sure you want to delete this folder?</p>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={handleDeleteFolder}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dosya Yükle Butonu */}
      <div className="mb-6">
        <FileUploader
          ownerId={user.$id}
          accountId={user.accountId}
          className="mb-2"
          folderId={folderId}
          onUploaded={handleFileUploaded}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((file: Models.Document) => (
          <a
            key={file.$id}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-4 rounded-lg border border-light-400/20 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <Thumbnail
                type={file.type}
                extension={file.extension}
                url={file.url}
                className="size-12"
              />
              <ActionDropdown file={file} />
            </div>

            <div className="flex flex-col gap-1">
              <p className="subtitle-2 line-clamp-1 text-light-100">
                {file.name}
              </p>
              <div className="flex items-center justify-between">
                <p className="caption text-light-200">
                  {convertFileSize(file.size)}
                </p>
                <FormattedDateTime
                  date={file.$createdAt}
                  className="caption text-light-200"
                />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 