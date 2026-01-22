import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, Palette, ShieldCheck, ListTodo, Activity } from "lucide-react";
import supabase from "@/utils/supabase";

const fetchMetrics = async () => {
    const [
        { count: cacCount },
        { count: designCount },
        { count: complianceCount },
        { count: taskCount }
    ] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }).eq("registration_status", "processing_cac"),
        supabase.from("design_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("compliance_records").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("task_assignments").select("*", { count: "exact", head: true }).eq("status", "pending")
    ]);

    return {
        pendingCac: cacCount || 0,
        pendingDesigns: designCount || 0,
        pendingCompliance: complianceCount || 0,
        myTasks: taskCount || 0
    };
};

const ConsultantDashboard = () => {
    const { data: metrics, isLoading, error } = useQuery({
        queryKey: ["consultantMetrics"],
        queryFn: fetchMetrics,
    });

    const cards = [
        { title: "Pending CAC Verifications", value: metrics?.pendingCac || 0, icon: FileCheck, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Design Requests", value: metrics?.pendingDesigns || 0, icon: Palette, color: "text-purple-600", bg: "bg-purple-100" },
        { title: "Compliance Reviews", value: metrics?.pendingCompliance || 0, icon: ShieldCheck, color: "text-green-600", bg: "bg-green-100" },
        { title: "My Active Tasks", value: metrics?.myTasks || 0, icon: ListTodo, color: "text-orange-600", bg: "bg-orange-100" },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sme-orange"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 p-6">Failed to load dashboard metrics.</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Consultant Dashboard</h1>
                <p className="text-gray-500">Overview of pending tasks and requests.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, idx) => (
                    <Card key={idx} className="border-none shadow-sm hover:shadow-md transition">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`p-3 rounded-full ${card.bg}`}>
                                <card.icon className={`h-6 w-6 ${card.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-gray-500" /> Recent System Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-400">
                        No recent activity to display.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ConsultantDashboard;
