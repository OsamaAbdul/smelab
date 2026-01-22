import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ComplianceReviews = () => {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [remarks, setRemarks] = useState("");

    const fetchRecords = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("compliance_records")
            .select("*, businesses(name, user_id)")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching compliance records:", error);
            toast.error("Failed to load records");
        } else {
            setRecords(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleUpdateStatus = async (status: "approved" | "needs_changes") => {
        if (!selectedRecord) return;
        setProcessing(true);

        try {
            // Update Record
            await supabase
                .from("compliance_records")
                .update({
                    status: status === "approved" ? "approved" : "pending", // Keep pending if needs changes, but update remarks? Or use a new status
                    // Actually let's use 'approved' or stay 'pending' with remarks, or maybe 'rejected'
                    // The request said: "compliance_records": "update status and remarks"
                    remarks: remarks
                })
                .eq("id", selectedRecord.id);

            // Notify User
            await supabase.from("notifications").insert({
                user_id: selectedRecord.businesses.user_id,
                title: `Compliance Review Update: ${status === "approved" ? "Approved" : "Action Required"}`,
                message: status === "approved"
                    ? `Your compliance record for ${selectedRecord.compliance_type} has been approved.`
                    : `Your compliance record requires attention: ${remarks}`,
                type: status === "approved" ? "success" : "warning"
            });

            toast.success("Record updated");
            setSelectedRecord(null);
            setRemarks("");
            fetchRecords();
        } catch (err) {
            console.error(err);
            toast.error("Update failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Compliance Reviews</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : records.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        No pending compliance reviews.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {records.map((rec) => (
                        <Card key={rec.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedRecord(rec)}>
                            <CardContent className="p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg capitalize">{rec.compliance_type.replace('_', ' ')}</h3>
                                    <p className="text-sm text-gray-500">
                                        Business: {rec.businesses?.name || "N/A"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Submitted: {new Date(rec.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-medium">
                                        Review Needed
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Review Compliance Record</DialogTitle>
                        <DialogDescription>Verify documents and compliance status.</DialogDescription>
                    </DialogHeader>

                    {selectedRecord && (
                        <div className="space-y-6 py-4">
                            <div className="text-sm space-y-2">
                                <p><span className="font-semibold">Type:</span> {selectedRecord.compliance_type}</p>
                                <p><span className="font-semibold">Due Date:</span> {selectedRecord.due_date || "N/A"}</p>
                                {selectedRecord.document_url && (
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open(selectedRecord.document_url, "_blank")}>
                                        View Document
                                    </Button>
                                )}
                            </div>

                            <div className="border-t pt-4 space-y-4">
                                <textarea
                                    placeholder="Add remarks or feedback..."
                                    className="w-full border rounded p-2 text-sm"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />

                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleUpdateStatus("approved")}
                                        disabled={processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2 h-4 w-4" /> Approve</>}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                                        onClick={() => handleUpdateStatus("needs_changes")}
                                        disabled={processing || !remarks}
                                    >
                                        {processing ? <Loader2 className="animate-spin" /> : <><AlertCircle className="mr-2 h-4 w-4" /> Request Changes</>}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ComplianceReviews;
