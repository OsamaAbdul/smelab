import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Clock } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ConsultantTasks = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from("task_assignments")
            .select("*")
            .eq("consultant_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching tasks:", error);
            toast.error("Failed to load tasks");
        } else {
            setTasks(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const TaskList = ({ status }: { status: string }) => {
        const filtered = tasks.filter(t => status === 'all' ? true : t.status === status);

        if (filtered.length === 0) {
            return <div className="text-center py-8 text-gray-500">No tasks found.</div>;
        }

        return (
            <div className="space-y-3">
                {filtered.map(task => (
                    <Card key={task.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                {task.status === 'completed' ? (
                                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                                ) : (
                                    <Clock className="text-orange-500 h-5 w-5" />
                                )}
                                <div>
                                    <p className="font-medium capitalize">{task.task_type.replace('_', ' ')}</p>
                                    <p className="text-xs text-gray-400">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</p>
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {task.status}
                            </span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : (
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="all">All Tasks</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-4"><TaskList status="pending" /></TabsContent>
                    <TabsContent value="in_progress" className="mt-4"><TaskList status="in_progress" /></TabsContent>
                    <TabsContent value="completed" className="mt-4"><TaskList status="completed" /></TabsContent>
                    <TabsContent value="all" className="mt-4"><TaskList status="all" /></TabsContent>
                </Tabs>
            )}
        </div>
    );
};

export default ConsultantTasks;
