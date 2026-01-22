import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    FileCheck,
    Palette,
    ListTodo,
    ShieldCheck,
    MessageSquare,
    LogOut,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import supabase from "@/utils/supabase";
import { toast } from "sonner";

const ConsultantLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth/login");
        toast.success("Logged out successfully");
    };

    const menuItems = [
        { title: "Dashboard", icon: LayoutDashboard, path: "/consultant/dashboard" },
        { title: "CAC Verification", icon: FileCheck, path: "/consultant/cac-verification" },
        { title: "Design Requests", icon: Palette, path: "/consultant/design-requests" },
        { title: "Compliance Reviews", icon: ShieldCheck, path: "/consultant/compliance-reviews" },
        { title: "My Tasks", icon: ListTodo, path: "/consultant/tasks" },
        { title: "Messages", icon: MessageSquare, path: "/consultant/messages" },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:relative md:translate-x-0`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h1 className="text-xl font-bold text-sme-orange">SME Consultant</h1>
                        <button
                            className="md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-1 p-4">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname === item.path
                                        ? "bg-sme-orange text-white"
                                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                    }`}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </button>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-slate-700">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-5 w-5" />
                            Logout
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between bg-white p-4 shadow-sm md:hidden">
                    <button onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-6 w-6 text-gray-600" />
                    </button>
                    <span className="font-semibold text-gray-800">Consultant Portal</span>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ConsultantLayout;
