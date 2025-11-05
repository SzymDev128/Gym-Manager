"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { system } from "@/theme";
import { AuthProvider } from "@/contexts/AuthContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <AuthProvider>
        <SWRConfig value={{ fetcher }}>{children}</SWRConfig>
      </AuthProvider>
    </ChakraProvider>
  );
}
