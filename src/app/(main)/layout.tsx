import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import AppBar from "@/components/appbar";

export default function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center w-full gap-2 transition-[width,height] ease-linear ">
          <AppBar />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
