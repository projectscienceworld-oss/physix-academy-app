import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: 'PhysixAcademy | Modern Physics Learning',
  description: 'Interactive Physics Teaching Platform for Universities',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PhysixAcademy',
  },
  formatDetection: { telephone: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFas9aCtVJj" crossOrigin="anonymous" />
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8" crossOrigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" integrity="sha384-+VBxd3it6nS7qv9tW3FBWjpW6T8tG7sUMKnoODtR4pU9efql0pUdQ1vv5qeyW6QA" crossOrigin="anonymous"></script>
        <script dangerouslySetInnerHTML={{ __html: `document.addEventListener("DOMContentLoaded", function() { if (window.renderMathInElement) window.renderMathInElement(document.body); });` }} />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#6d28d9" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PhysixAcademy" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <script dangerouslySetInnerHTML={{ __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/sw.js').catch(function(err) { console.log('SW registration failed:', err); }); }); }` }} />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <AuthProvider>
          <AppLayoutShell>
            {children}
          </AppLayoutShell>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}

import { RouteGuard } from "@/components/auth/RouteGuard";

// Separate component so we can use hooks inside AuthProvider
function AppLayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 pb-20 md:pb-0 relative overflow-x-hidden">
          <div className="container mx-auto px-4 py-8">
            <RouteGuard>
              {children}
            </RouteGuard>
          </div>
        </main>
      </div>
      <MobileNav />
    </SidebarProvider>
  );
}
