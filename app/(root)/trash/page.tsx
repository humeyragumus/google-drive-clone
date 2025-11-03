'use client';

import { getFiles } from "@/lib/actions/file.actions";
import FileList from "@/components/FileList";
import { useEffect, useState } from "react";
import { Models } from "node-appwrite";

const TrashPage = () => {
  const [files, setFiles] = useState<Models.Document[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const result = await getFiles({ types: [] });
      const allFiles = Array.isArray(result) ? result : result.documents || [];
      setFiles(allFiles.filter((file: any) => file.isDeleted));
    };
    fetchFiles();
  }, []);

  return (
    <div className="files-container">
      <h2 className="h2 mb-6">Trash</h2>
      <FileList files={files} />
    </div>
  );
};

export default TrashPage; 