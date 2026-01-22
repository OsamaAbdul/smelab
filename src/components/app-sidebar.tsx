import {
  Headset,
  LayoutDashboard,
  Rocket,
  Building2,
  Image,
  Zap,
  ShieldCheck,
  Settings,
  Search,
  Bell,
  MessageSquare
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import supabase from "@/utils/supabase";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile, setOpenMobile } = useSidebar();

  // 1. Fetch User Session
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  const user = sessionData?.user;

  // 2. Fetch Checklist Status (Scoped to active business or any business)
  const { data: checklist, isLoading: checklistLoading } = useQuery({
    queryKey: ['checklist', user?.id, 'sidebar'],
    enabled: !!user,
    queryFn: async () => {
      // First, get the most recent business
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!businesses || businesses.length === 0) return [];

      // Then get the checklist for that business (or unlinked ones as fallback)
      const { data, error } = await supabase
        .from("onboarding_checklist")
        .select("step_key, status")
        .eq("user_id", user!.id)
        .or(`business_id.eq.${businesses[0].id},business_id.is.null`);


      if (error) throw error;
      return data;
    },
  });

  // Improved mapping: Use checklist status to determine disabled state.
  const getItems = () => {
    // Default enabled
    const baseItems = [
      { title: "Dashboard", url: "/dashboard/home", icon: LayoutDashboard, disabled: false },
      { title: "Onboarding", url: "/dashboard/onboarding", icon: Rocket, disabled: false },
      { title: "Business Info", url: "/dashboard/existing-business", icon: Building2, disabled: false },
    ];

    // Check progress
    // If we have any checklist items, it means a business exists and is initialized.
    const hasBusiness = checklist && checklist.length > 0;

    return [
      ...baseItems,
      { title: "Assets", url: "/dashboard/assets", icon: Image, disabled: !hasBusiness },
      { title: "Consulting", url: "/dashboard/consulting", icon: Headset, disabled: !hasBusiness },
      { title: "Messages", url: "/dashboard/messages", icon: MessageSquare, disabled: !hasBusiness },
      { title: "Compliance", url: "/dashboard/compliance", icon: ShieldCheck, disabled: !hasBusiness },
      { title: "AI Tools", url: "/dashboard/ai-tools", icon: Zap, disabled: !hasBusiness },
    ];
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const dynamicItems = getItems();

  return (
    <Sidebar
      collapsible="icon"
      className={cn("w-[--sidebar-width] border-r border-white/5 bg-[#09090b] text-white", className)}
      style={{
        "--sidebar-background": "#09090b",
        "--sidebar-foreground": "#ffffff",
        "--sidebar-border": "rgb(255 255 255 / 0.05)"
      } as React.CSSProperties}
      {...props}
    >

      {/* Mac Window Controls & Logo */}
      <SidebarHeader className={cn("flex flex-col py-8 gap-8", isMobile ? "items-start px-6" : "items-center")}>
        {/* Window Controls - Hidden on mobile */}
        {!isMobile && (
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 transition-colors cursor-pointer" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors cursor-pointer" />
          </div>
        )}

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.3)] shrink-0">
            S
          </div>
          {isMobile && (
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight text-white">SME<span className="text-blue-500">LAB</span></span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Africa</span>
            </div>
          )}
        </div>
      </SidebarHeader>



      <SidebarContent className={cn("flex flex-col gap-2 px-2 scrollbar-none", isMobile ? "items-stretch" : "items-center")}>


        {/* Main Navigation */}
        <nav className={cn("flex flex-col gap-1.5 w-full", isMobile ? "px-3" : "items-center")}>
          {dynamicItems.map((item) => (
            <TooltipProvider key={item.title}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.disabled ? "#" : item.url}
                    onClick={(e) => {
                      if (item.disabled) {
                        e.preventDefault();
                      } else {
                        handleLinkClick();
                      }
                    }}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center rounded-xl transition-all duration-300 relative group",
                        isMobile ? "w-full h-12 px-4 flex-row justify-start gap-4" : "w-10 h-10 justify-center",
                        isActive
                          ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                          : "text-zinc-400 hover:bg-white/10 hover:text-white",
                        item.disabled && "opacity-30 cursor-not-allowed"
                      )


                    }
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {isMobile && <span className="font-bold text-sm tracking-wide">{item.title}</span>}
                    {item.disabled && (
                      <div className="absolute top-1 right-1">
                        <div className="w-1.5 h-1.5 bg-zinc-700 rounded-full border border-zinc-900" />
                      </div>
                    )}

                  </NavLink>
                </TooltipTrigger>
                {!isMobile && (
                  <TooltipContent side="right" className="bg-zinc-900 border-white/10 text-white ml-2">
                    {item.title} {item.disabled && "(Complete Setup)"}
                  </TooltipContent>
                )}

              </Tooltip>
            </TooltipProvider>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter className="py-6 flex flex-col items-center gap-4">




      </SidebarFooter>
    </Sidebar>
  );
}
