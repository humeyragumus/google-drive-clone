'use client';

import { useEffect, useRef, useState } from 'react';
import { getCurrentUser, updateUserProfile } from '@/lib/actions/user.actions';
import { uploadFile } from '@/lib/actions/file.actions';
import Image from 'next/image';

const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setName(currentUser?.fullName || '');
      setAvatar(currentUser?.avatar || '');
    };
    fetchUser();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfile({ name, avatar });
    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!user) return;
    // Fotoğrafı storage'a yükle
    const uploaded = await uploadFile({
      file,
      ownerId: user.$id,
      accountId: user.accountId,
      path: '/profile-avatar-upload',
    });
    if (uploaded && uploaded.url) {
      setAvatar(uploaded.url);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow">
      <h2 className="h2 mb-6 text-center">Profilim</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <Image
              src={avatar || '/assets/icons/avatar-placeholder.png'}
              alt="Avatar"
              width={80}
              height={80}
              className="rounded-full object-cover border"
            />
            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs">Fotoğrafı Değiştir</span>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        <div>
          <label className="block mb-1 font-medium">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">E-posta</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="input w-full bg-gray-100 cursor-not-allowed"
          />
        </div>
        <button
          type="submit"
          className="primary-btn mt-4"
          disabled={isSaving}
        >
          {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
        {success && <p className="text-green-600 text-center">Profil başarıyla güncellendi!</p>}
      </form>
    </div>
  );
};

export default ProfilePage; 