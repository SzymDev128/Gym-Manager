import { Providers } from "./providers";
import { AuthGuard } from "@/components/AuthGuard";
import { Toaster } from "@/components/ui/toaster";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>
        <Providers>
          <AuthGuard>{children}</AuthGuard>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
