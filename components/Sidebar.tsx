"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/">
        <Image
          src="/assets/icons/logom.svg"
          alt="logo"
          width={250}
          height={150}
          className="hidden h-auto lg:block"
        />

        <Image
          src="/assets/icons/logo-brand.svg"
          alt="logo"
          width={52}
          height={52}
          className="lg:hidden"
        />
      </Link>

      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {navItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full">
              <li
                className={cn(
                  "sidebar-nav-item",
                  pathname === url && "shad-active",
                )}
              >
                <Image
                  src={icon}
                  alt={name}
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon",
                    pathname === url && "nav-icon-active",
                  )}
                />
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      <Image
        src="/assets/images/files-2.png"
        alt="logo"
        width={506}
        height={418}
        className="w-full"
      />

      <div className="sidebar-user-info">
        <Image
          src={avatar}
          alt="Avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
          <Link href="/profile" className="flex items-center gap-1 mt-2 group">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-brand group-hover:text-[#ac93b9]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.764h.764c.987 0 1.405 1.266.588 1.868l-.647.49a1.125 1.125 0 00-.364 1.272l.3.933c.17.53-.43.98-.858.692l-.647-.49a1.125 1.125 0 00-1.317 0l-.647.49c-.428.288-1.028-.162-.858-.692l.3-.933a1.125 1.125 0 00-.364-1.272l-.647-.49c-.817-.602-.399-1.868.588-1.868h.764c.396 0 .71-.34.78-.764l.149-.894z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs text-brand group-hover:text-[#ac93b9] underline">Ayarlar</span>
          </Link>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
