"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const createFolder = async (name: string) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const now = new Date().toISOString();
    const folderDocument = {
      name,
      ownerId: currentUser.$id,
      createdAt: now,
      updatedAt: now,
    };

    const newFolder = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      ID.unique(),
      folderDocument,
    );

    revalidatePath("/folders");
    return parseStringify(newFolder);
  } catch (error) {
    handleError(error, "Failed to create folder");
  }
};

export const getUserFolders = async () => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const folders = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      [
        Query.equal("ownerId", [currentUser.$id]),
        Query.orderDesc("$createdAt"),
      ],
    );

    return parseStringify(folders);
  } catch (error) {
    handleError(error, "Failed to get folders");
  }
};

export const deleteFolder = async (folderId: string) => {
  const { databases } = await createAdminClient();
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.foldersCollectionId,
      folderId
    );
    revalidatePath("/folders");
    return true;
  } catch (error) {
    handleError(error, "Failed to delete folder");
    return false;
  }
}; 