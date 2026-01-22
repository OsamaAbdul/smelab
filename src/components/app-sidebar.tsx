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

export function AppSidebar({ className, ...props }: React.ComponentProps<typeof Sidebar>) {

  // 1. Fetch User Session
  const { data: sessionData } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });
  const user = sessionData?.user;

  // 2. Fetch Checklist Status
  const { data: checklist } = useQuery({
    queryKey: ['checklist', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_checklist")
        .select("step_key, status")
        .eq("user_id", user!.id);
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

  const dynamicItems = getItems();

  return (
    <Sidebar
      collapsible="icon"
      className={cn("w-[--sidebar-width] border-r border-white/5 bg-[#0f172a] text-white", className)}
      style={{
        "--sidebar-background": "#0f172a",
        "--sidebar-foreground": "#ffffff",
        "--sidebar-border": "rgb(255 255 255 / 0.05)"
      } as React.CSSProperties}
      {...props}
    >
      {/* Mac Window Controls & Logo */}
      <SidebarHeader className="flex flex-col items-center py-6 gap-6">
        {/* Window Controls */}
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57] hover:bg-[#FF5F57]/80 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E] hover:bg-[#FEBC2E]/80 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28C840] hover:bg-[#28C840]/80 transition-colors cursor-pointer" />
        </div>

        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
          S
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col items-center gap-2 px-2 scrollbar-none">

        {/* Main Navigation */}
        <nav className="flex flex-col gap-3 w-full items-center">
          {dynamicItems.map((item) => (
            <TooltipProvider key={item.title}>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.disabled ? "#" : item.url}
                    onClick={(e) => item.disabled && e.preventDefault()}
                    className={({ isActive }) =>
                      cn(
                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 relative group",
                        isActive
                          ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                          : "text-zinc-400 hover:bg-white/10 hover:text-white",
                        item.disabled && "opacity-40 cursor-default hover:bg-transparent"
                      )

                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.disabled && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-zinc-700 rounded-full border border-[#0f172a]" />}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-zinc-900 border-white/10 text-white ml-2">
                  {item.title} {item.disabled && "(Complete Setup)"}
                </TooltipContent>
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
