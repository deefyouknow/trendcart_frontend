"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CartIcon } from "@/components/cart/cart-icon";
import { MobileNav } from "./mobile-nav";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { isAuthenticated } = useAuth();

  // Helper to set google translate cookie and reload
  const setGoogleLanguage = (langCode: string) => {
    // TH = /th/th (or reset), EN = /th/en, CN = /th/zh-CN
    if (langCode === "th") {
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
    } else {
      document.cookie = `googtrans=/th/${langCode}; path=/;`;
      document.cookie = `googtrans=/th/${langCode}; domain=${location.hostname}; path=/;`;
    }
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        {/* Mobile nav */}
        <MobileNav />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="hidden sm:inline">TrendCart</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link
            href="/products"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            สินค้า
          </Link>
          <Link
            href="/products"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            หมวดหมู่
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="px-2 mr-1">
                แปลภาษา 🌐
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setGoogleLanguage("th")}>
                🇹🇭 ไทย (TH)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGoogleLanguage("en")}>
                🇺🇸 English (EN)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setGoogleLanguage("zh-CN")}>
                🇨🇳 中文 (CN)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href={isAuthenticated ? "/admin" : "/login"}
            className="hidden md:flex text-sm font-medium text-muted-foreground transition-colors hover:text-foreground mr-2"
          >
            {isAuthenticated ? "การจัดการระบบ" : "เข้าสู่ระบบ"}
          </Link>
          <CartIcon />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
