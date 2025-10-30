"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import { ReactNode } from "react";
import { system } from "@/theme";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <SWRConfig value={{ fetcher }}>{children}</SWRConfig>
    </ChakraProvider>
  );
}
