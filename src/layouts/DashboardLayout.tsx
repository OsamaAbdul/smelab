import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon, Bell, Search, Sparkles } from "lucide-react";
import supabase from "@/utils/supabase";
import { Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

function DashboardLayout() {
  const navigate = useNavigate();

  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth/login");
  };

  return (
    <SidebarProvider>
      <div className="flex w-full h-screen bg-[#09090b] text-zinc-100 overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content Wrapper */}
        <div className="flex flex-col flex-1 h-full min-w-0 transition-all duration-300 relative overflow-hidden">

          <div className="flex flex-col h-full overflow-y-auto">
            <header className="sticky top-0 z-30 flex min-h-16 items-center gap-4 border-b border-white/5 bg-[#09090b]/80 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-[#09090b]/60">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="text-zinc-400 hover:text-white" />
              </div>

              <div className="flex flex-1 items-center gap-4">
                {/* Search Bar (Hidden on mobile, visible on desktop) */}
                <div className="hidden md:flex items-center w-full max-w-sm relative group">
                  <h1>SMELAB</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Notifications */}


                <div className="h-6 w-px bg-white/10 mx-1" />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/10 hover:ring-blue-500/50 transition-all p-0 overflow-hidden">
                      <Avatar className="h-full w-full">
                        <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} className="object-cover" />
                        <AvatarFallback className="bg-blue-600 text-white font-medium">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-[#111113] border-white/10 text-zinc-200" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{user?.user_metadata?.full_name || 'User'}</p>
                        <p className="text-xs leading-none text-zinc-500">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem
                      className="hover:bg-white/5 hover:text-white cursor-pointer focus:bg-white/5 focus:text-white"
                      onClick={() => navigate('/dashboard/profile')}
                    >
                      <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="hover:bg-red-500/10 hover:text-red-400 cursor-pointer focus:bg-red-500/10 focus:text-red-400"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full p-4 md:p-8">
              <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardLayout;
