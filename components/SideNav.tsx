"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type SideNavItem = { label: string; href: string };

export function SideNav({ items }: { items: SideNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-8 flex flex-col gap-2">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              active
                ? "rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary"
                : "rounded-2xl px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

