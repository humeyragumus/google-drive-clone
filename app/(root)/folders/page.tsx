"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserFolders, createFolder, deleteFolder } from "@/lib/actions/folder.actions";
import { Models } from "node-appwrite";

const FoldersPage = () => {
  const [folders, setFolders] = useState<Models.Document[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const response = await getUserFolders();
        setFolders(response.documents);
      } catch (error) {
        console.error("Failed to load folders:", error);
      }
    };

    loadFolders();
  }, []);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const newFolder = await createFolder(newFolderName.trim());
      setFolders([newFolder, ...folders]);
      setNewFolderName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create folder:", error);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const success = await deleteFolder(deletingId);
    setIsDeleting(false);
    setShowDeleteModal(false);
    setDeletingId(null);
    if (success) {
      setFolders((prev) => prev.filter((f) => f.$id !== deletingId));
    }
  };

  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-2xl font-semibold text-light-100">Folders</h1>

      <div className="flex flex-col gap-4">
        {!isCreating ? (
          <Button
            onClick={() => setIsCreating(true)}
            className="w-fit bg-brand text-white hover:bg-brand/90"
          >
            Create Folder
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="max-w-xs"
            />
            <Button
              onClick={handleCreateFolder}
              className="bg-brand text-white hover:bg-brand/90"
            >
              Create
            </Button>
            <Button
              onClick={() => {
                setIsCreating(false);
                setNewFolderName("");
              }}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {folders.map((folder) => (
            <div key={folder.$id} className="flex items-center gap-3 rounded-lg border border-light-400/20 p-4 transition-all hover:border-brand/50">
              <Link
                href={`/folders/${folder.$id}`}
                className="flex items-center gap-3 flex-1 min-w-0"
              >
                <Image
                  src="/assets/icons/folder.svg"
                  alt="folder"
                  width={24}
                  height={24}
                />
                <span className="font-medium text-light-100 truncate">{folder.name}</span>
              </Link>
              <button
                className="ml-2 p-1 rounded hover:bg-red-50"
                onClick={() => { setDeletingId(folder.$id); setShowDeleteModal(true); }}
                title="Delete Folder"
              >
                <Image src="/assets/icons/delete.svg" alt="delete" width={24} height={24} />
              </button>
            </div>
          ))}
        </div>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="rounded-lg bg-white p-8 shadow-lg flex flex-col gap-4 min-w-[380px]">
              <h2 className="text-lg font-semibold text-red-600">Delete Folder</h2>
              <p>Are you sure you want to delete this folder?</p>
              <div className="flex flex-col gap-2">
                <button
                  className="px-4 py-2 min-w-[100px] rounded bg-gray-200 hover:bg-gray-300"
                  onClick={() => { setShowDeleteModal(false); setDeletingId(null); }}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 min-w-[120px] rounded text-white font-bold text-lg transition"
                  style={{ background: "#ac93b9" }}
                  onClick={handleDeleteFolder}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Onayla'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoldersPage; 