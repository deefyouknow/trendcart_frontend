"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          aria-label="Open menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            หน้าแรก
          </Link>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            สินค้า
          </Link>
          <Link
            href="/products"
            onClick={() => setOpen(false)}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            หมวดหมู่
          </Link>
          <Link
            href={isAuthenticated ? "/admin" : "/login"}
            onClick={() => setOpen(false)}
            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {isAuthenticated ? "การจัดการระบบ" : "เข้าสู่ระบบ"}
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
