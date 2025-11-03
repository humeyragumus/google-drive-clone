"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import QRCodeShare from "@/components/QRCodeShare";

const ActionDropdown = ({ file }: { file: Models.Document }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [name, setName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [sharePassword, setSharePassword] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [permission, setPermission] = useState("read");

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
    setEmails([]);
    setSharePassword("");
    setExpiryDate("");
    setPermission("read");
  };

  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({ fileId: file.$id, name, extension: file.extension, path }),
      share: () => updateFileUsers({ 
        fileId: file.$id, 
        emails, 
        path,
        shareOptions: {
          password: sharePassword || undefined,
          expiryDate: expiryDate || undefined,
          permission: permission as 'read' | 'write'
        }
      }),
      delete: () =>
        deleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();

    setIsLoading(false);
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger className="shad-no-focus">
            <Image
              src="/assets/icons/dots.svg"
              alt="dots"
              width={34}
              height={34}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="max-w-[200px] truncate">
              {file.name}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {actionsDropdownItems.map((actionItem) => (
              <DropdownMenuItem
                key={actionItem.value}
                className="shad-dropdown-item"
                onClick={() => {
                  setAction(actionItem);

                  if (
                    ["rename", "share", "delete", "details"].includes(
                      actionItem.value,
                    )
                  ) {
                    setIsModalOpen(true);
                  }
                }}
              >
                {actionItem.value === "download" ? (
                  <Link
                    href={constructDownloadUrl(file.bucketFileId)}
                    download={file.name}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={actionItem.icon}
                      alt={actionItem.label}
                      width={30}
                      height={30}
                    />
                    {actionItem.label}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Image
                      src={actionItem.icon}
                      alt={actionItem.label}
                      width={30}
                      height={30}
                    />
                    {actionItem.label}
                  </div>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {action && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="shad-dialog button">
            <DialogHeader className="flex flex-col gap-3">
              <DialogTitle className="text-center text-light-100">
                {action.label}
              </DialogTitle>
              {action.value === "rename" && (
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              {action.value === "details" && <FileDetails file={file} />}
              {action.value === "share" && (
                <ShareInput
                  file={file}
                  onInputChange={setEmails}
                  onRemove={handleRemoveUser}
                  onShareOptionsChange={(options) => {
                    setSharePassword(options.password);
                    setExpiryDate(options.expiryDate);
                    setPermission(options.permission);
                  }}
                  shareOptions={{
                    password: sharePassword,
                    expiryDate: expiryDate,
                    permission: permission
                  }}
                />
              )}
              {action.value === "delete" && (
                <p className="delete-confirmation">
                  Are you sure you want to delete{` `}
                  <span className="delete-file-name">{file.name}</span>?
                </p>
              )}
            </DialogHeader>
            {["rename", "delete", "share"].includes(action.value) && (
              <DialogFooter className="flex flex-col gap-3 md:flex-row">
                <Button onClick={closeAllModals} className="modal-cancel-button">
                  Cancel
                </Button>
                <Button onClick={handleAction} className="modal-submit-button">
                  <p className="capitalize">{action.value}</p>
                  {isLoading && (
                    <Image
                      src="/assets/icons/loader.svg"
                      alt="loader"
                      width={24}
                      height={24}
                      className="animate-spin"
                    />
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
export default ActionDropdown;
