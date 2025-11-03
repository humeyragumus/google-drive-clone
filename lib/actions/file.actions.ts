"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";
import { sendShareEmail } from "@/lib/sendShareEmail"; // doğru yoldan import
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
  folderId,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileDocument: any = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };
    if (folderId) fileDocument.folderId = folderId;

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: Models.Document,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
  folderId,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);
    if (folderId) queries.push(Query.equal("folderId", [folderId]));

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    console.log({ files });
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
  shareOptions,
}: UpdateFileUsersProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    // Validate permission
    if (shareOptions?.permission && !['read', 'write'].includes(shareOptions.permission)) {
      throw new Error('Invalid permission value. Must be either "read" or "write".');
    }

    // Store user permissions separately
    const userPermissions = emails.map(email => ({
      email,
      permission: shareOptions?.permission || 'read',
      addedAt: new Date().toISOString()
    }));

    const updateData: any = {
      // Store only email addresses in users array
      users: emails,
      // Store full user data in a separate field
      userPermissions: JSON.stringify(userPermissions),
      shareStatsViews: 0,
      shareStatsDownloads: 0,
      shareStatsLastAccessed: null
    };

    if (shareOptions?.password) {
      updateData.sharePassword = shareOptions.password;
    }

    if (shareOptions?.expiryDate) {
      updateData.shareExpiryDate = shareOptions.expiryDate;
    }

    if (shareOptions?.permission) {
      updateData.sharePermission = shareOptions.permission;
    }

    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      updateData
    );

    if (!updatedFile) throw Error;

    // Send email to each shared user
    try {
      const fileUrl = constructFileUrl(updatedFile.bucketFileId);
      for (const userPerm of userPermissions) {
        await sendShareEmail({
          to: userPerm.email,
          fileName: updatedFile.name,
          fileUrl,
          senderName: currentUser?.fullName || "Bir kullanıcı",
          password: shareOptions?.password,
          expiryDate: shareOptions?.expiryDate,
          permission: userPerm.permission
        });
      }
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
    }

    revalidatePath(path);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases } = await createAdminClient();

  try {
    // Soft delete: sadece isDeleted alanını true yap
    const deletedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { isDeleted: true, deletedAt: new Date().toISOString() }
    );

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to soft delete file");
  }
};

export const restoreFile = async (fileId: string, path: string) => {
  const { databases } = await createAdminClient();
  try {
    const restoredFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      { isDeleted: false, deletedAt: null }
    );
    revalidatePath(path);
    return parseStringify(restoredFile);
  } catch (error) {
    handleError(error, "Failed to restore file");
  }
};

export const hardDeleteFile = async (fileId: string, bucketFileId: string, path: string) => {
  const { databases, storage } = await createAdminClient();
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId
    );
    await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
    revalidatePath(path);
    return { status: "success" };
  } catch (error) {
    handleError(error, "Failed to hard delete file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}
