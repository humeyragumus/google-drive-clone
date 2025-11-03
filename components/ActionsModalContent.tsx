import { Models } from "node-appwrite";
import Thumbnail from "@/components/Thumbnail";
import FormattedDateTime from "@/components/FormattedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const ImageThumbnail = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormattedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => {
  return (
    <>
      <ImageThumbnail file={file} />
      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format:" value={file.extension} />
        <DetailRow label="Size:" value={convertFileSize(file.size)} />
        <DetailRow label="Owner:" value={file.owner.fullName} />
        <DetailRow label="Last edit:" value={formatDateTime(file.$updatedAt)} />
      </div>
    </>
  );
};

interface Props {
  file: Models.Document;
  onInputChange: (emails: string[]) => void;
  onRemove: (email: string) => void;
  onShareOptionsChange?: (options: {
    password: string;
    expiryDate: string;
    permission: string;
  }) => void;
  shareOptions?: {
    password: string;
    expiryDate: string;
    permission: string;
  };
}

export const ShareInput = ({ 
  file, 
  onInputChange, 
  onRemove,
  onShareOptionsChange,
  shareOptions: initialOptions 
}: Props) => {
  const [sharePassword, setSharePassword] = useState(initialOptions?.password || "");
  const [expiryDate, setExpiryDate] = useState(initialOptions?.expiryDate || "");
  const [permission, setPermission] = useState(initialOptions?.permission || "read");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Update parent component when options change
  useEffect(() => {
    onShareOptionsChange?.({
      password: sharePassword,
      expiryDate,
      permission
    });
  }, [sharePassword, expiryDate, permission]);

  return (
    <>
      <ImageThumbnail file={file} />

      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field"
        />

        <Button 
          onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          className="mt-2 text-brand hover:text-brand/80"
          variant="link"
        >
          {showAdvancedOptions ? "Hide" : "Show"} advanced options
        </Button>

        {showAdvancedOptions && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <p className="subtitle-2 text-light-100">Password Protection</p>
              <Input
                type="password"
                placeholder="Set a password for shared access"
                value={sharePassword}
                onChange={(e) => setSharePassword(e.target.value)}
                className="share-input-field"
              />
            </div>

            <div className="space-y-2">
              <p className="subtitle-2 text-light-100">Expiry Date</p>
              <Input
                type="datetime-local"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="share-input-field"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div className="space-y-2">
              <p className="subtitle-2 text-light-100">Permission Level</p>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="permission"
                    value="read"
                    checked={permission === "read"}
                    onChange={(e) => setPermission(e.target.value)}
                    className="accent-brand"
                  />
                  <span className="text-light-100">Read only</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="permission"
                    value="write"
                    checked={permission === "write"}
                    onChange={(e) => setPermission(e.target.value)}
                    className="accent-brand"
                  />
                  <span className="text-light-100">Can edit</span>
                </label>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {file.users.map((email: string) => (
              <li
                key={email}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{email}</p>
                <Button
                  onClick={() => onRemove(email)}
                  className="share-remove-user"
                >
                  <Image
                    src="/assets/icons/remove.svg"
                    alt="Remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
