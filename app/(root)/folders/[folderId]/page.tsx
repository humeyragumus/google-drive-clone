import { Models } from "node-appwrite";
import FolderDetailClient from './FolderDetailClient';
import { getUserFolders } from '@/lib/actions/folder.actions';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { getFiles } from '@/lib/actions/file.actions';

type FolderDetailPageProps = {
  params: { folderId: string }
};

export default async function FolderDetailPage({ params }: FolderDetailPageProps) {
  const { folderId } = params;
  const user = await getCurrentUser();
  const folders = await getUserFolders();
  const folder = folders.documents.find((f: Models.Document) => f.$id === folderId) || null;
  const folderFiles = await getFiles({ types: [], searchText: '', folderId });
  const files = folderFiles.documents;

  return (
    <FolderDetailClient
      folder={folder}
      files={files}
      user={user}
      folderId={folderId}
    />
  );
} 