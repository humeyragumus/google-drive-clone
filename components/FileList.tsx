'use client';

import { Models } from "node-appwrite";
import ActionDropdown from "./ActionDropdown";
import { FormattedDateTime } from "./FormattedDateTime";
import { Thumbnail } from "./Thumbnail";
import { FavoriteButton } from "./FavoriteButton";
import { constructFileUrl, convertFileSize } from "@/lib/utils";
import { restoreFile, hardDeleteFile } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";

interface FileListProps {
  files: Models.Document[];
}

const FileList = ({ files }: FileListProps) => {
  const pathname = usePathname();

  const handleRestore = async (fileId: string) => {
    await restoreFile(fileId, pathname);
    window.location.reload();
  };

  const handleHardDelete = async (fileId: string, bucketFileId: string) => {
    await hardDeleteFile(fileId, bucketFileId, pathname);
    window.location.reload();
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => {
        const fileUrl = constructFileUrl(file.bucketFileId);
        return (
          <a
            key={file.$id}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-between rounded-2xl bg-white shadow p-4 min-h-[220px] h-full transition-transform hover:scale-[1.03] hover:shadow-lg group cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2 w-full">
              <div className="flex items-start gap-2 w-2/3">
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={fileUrl}
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="flex flex-col items-end gap-2 w-1/3">
                <div className="flex items-center gap-2">
                  <FavoriteButton id={file.$id} />
                  <ActionDropdown file={file} />
                </div>
                <span className="font-medium text-md text-right text-light-100 mt-2">{convertFileSize(file.size)}</span>
              </div>
            </div>
            <div className="flex flex-col items-center mt-2 flex-1">
              <h4 className="file-name text-center font-semibold text-light-100 line-clamp-2 mb-1 text-base">{file.name}</h4>
              <FormattedDateTime date={file.$createdAt} className="text-xs text-light-200" />
              {file.owner && (
                <p className="caption text-light-200 flex items-center gap-2 mt-1">
                  By: {file.owner.fullName}
                  <span className="bg-[#ac93b9]/30 text-[#ac93b9] rounded-full px-2 py-0.5 text-xs font-semibold">QR</span>
                </p>
              )}
              {/* Çöp kutusu için butonlar */}
              {file.isDeleted && (
                <div className="flex gap-2 mt-4">
                  <button
                    className="px-3 py-1 rounded bg-brand text-white text-xs font-semibold hover:bg-brand/80"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); handleRestore(file.$id); }}
                  >
                    Geri Yükle
                  </button>
                  {file.bucketFileId && (
                    <button
                      style={{
                        display: "inline-block",
                        opacity: 1,
                        visibility: "visible",
                        background: "#ac93b9",
                        color: "#fff",
                        border: "none",
                        zIndex: 1000,
                        position: "relative",
                        padding: "6px 16px",
                        fontWeight: 600,
                        fontSize: "13px",
                        borderRadius: "8px"
                      }}
                      className="force-visible"
                      onClick={e => { e.preventDefault(); e.stopPropagation(); handleHardDelete(file.$id, file.bucketFileId); }}
                    >
                      Kalıcı Sil
                    </button>
                  )}
                </div>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
};

export default FileList; 