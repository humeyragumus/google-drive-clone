'use client';

import { getFiles } from "@/lib/actions/file.actions";
import { useFavorites } from "@/lib/FavoritesContext";
import FileList from "@/components/FileList";
import { useEffect, useState } from "react";
import { Models } from "node-appwrite";

const FavoritesPage = () => {
  const [files, setFiles] = useState<Models.Document[]>([]);
  const { favorites } = useFavorites();
  
  useEffect(() => {
    const fetchFiles = async () => {
      const result = await getFiles({ types: [] });
      setFiles(Array.isArray(result) ? result : result.documents || []);
    };
    
    fetchFiles();
  }, []);

  const favoriteFiles = Array.isArray(files)
    ? files.filter((file) => favorites.includes(file.$id))
    : [];

  return (
    <div className="files-container">
      <FileList files={favoriteFiles} />
    </div>
  );
};

export default FavoritesPage; 