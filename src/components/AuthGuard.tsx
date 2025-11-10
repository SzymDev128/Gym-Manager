"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";

const publicPaths = ["/auth/login", "/auth/register"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    if (!isLoading && !isLoggedIn && !isPublicPath) {
      router.push("/auth/login");
    }
  }, [isLoggedIn, isLoading, pathname, router]);

  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // If not logged in and trying to access protected route, don't render
  if (!isLoggedIn && !isPublicPath) {
    return null;
  }

  return (
    <>
      {!isPublicPath && <Navbar />}
      {children}
    </>
  );
}
