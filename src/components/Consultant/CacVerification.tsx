import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CacVerification = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("businesses")
            .select("*, profiles(first_name, last_name, email)")
            .eq("registration_status", "processing_cac")
            .order("updated_at", { ascending: false });

        if (error) {
            console.error("Error fetching CAC requests:", error);
            toast.error("Failed to load requests");
        } else {
            setRequests(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (action: "approve" | "reject") => {
        if (!selectedRequest) return;
        setProcessing(true);

        try {
            const updates: any = {
                registration_status: action === "approve" ? "registered" : "rejected",
            };

            // Update Business
            const { error: updateError } = await supabase
                .from("businesses")
                .update(updates)
                .eq("id", selectedRequest.id);

            if (updateError) throw updateError;

            // Create Notification
            await supabase.from("notifications").insert({
                user_id: selectedRequest.user_id,
                title: `CAC Registration ${action === "approve" ? "Approved" : "Rejected"}`,
                message: action === "approve"
                    ? `Your business ${selectedRequest.name} has been successfully registered!`
                    : `Your registration for ${selectedRequest.name} was rejected. Reason: ${rejectReason}`,
                type: action === "approve" ? "success" : "error"
            });

            // If approved, update checklist
            if (action === "approve") {
                await supabase
                    .from("onboarding_checklist")
                    .update({ status: "completed" })
                    .eq("user_id", selectedRequest.user_id)
                    .eq("step_key", "registration");
            }

            toast.success(`Request ${action}ed successfully`);
            setSelectedRequest(null);
            setRejectReason("");
            fetchRequests();
        } catch (err) {
            console.error(err);
            toast.error("Action failed");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">CAC Verification</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : requests.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        No pending CAC verifications.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedRequest(req)}>
                            <CardContent className="p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">{req.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Owner: {req.profiles?.first_name} {req.profiles?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Submitted: {new Date(req.updated_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                                        Pending Review
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Application: {selectedRequest?.name}</DialogTitle>
                        <DialogDescription>Review details and documents before approving.</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-semibold block">Industry:</span> {selectedRequest.industry}
                                </div>
                                <div>
                                    <span className="font-semibold block">Email:</span> {selectedRequest.profiles?.email}
                                </div>
                                <div>
                                    <span className="font-semibold block">Address:</span> {selectedRequest.company_address || "N/A"}
                                </div>
                                <div>
                                    <span className="font-semibold block">Phone:</span> {selectedRequest.phone_number || "N/A"}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-2">Documents</h4>
                                <div className="flex gap-4">
                                    {selectedRequest.director_id_url ? (
                                        <Button variant="outline" size="sm" onClick={() => window.open(selectedRequest.director_id_url, "_blank")}>
                                            <FileText className="mr-2 h-4 w-4" /> View Director ID
                                        </Button>
                                    ) : <span className="text-gray-400 text-sm">No Director ID</span>}

                                    {selectedRequest.passport_url ? (
                                        <Button variant="outline" size="sm" onClick={() => window.open(selectedRequest.passport_url, "_blank")}>
                                            <FileText className="mr-2 h-4 w-4" /> View Passport
                                        </Button>
                                    ) : <span className="text-gray-400 text-sm">No Passport</span>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-4 border-t">
                                <div className="flex gap-3">
                                    <Button
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction("approve")}
                                        disabled={processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin" /> : <><CheckCircle className="mr-2 h-4 w-4" /> Approve Registration</>}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => {
                                            if (!rejectReason) {
                                                toast.error("Please enter a reason for rejection");
                                                return;
                                            }
                                            handleAction("reject");
                                        }}
                                        disabled={processing}
                                    >
                                        {processing ? <Loader2 className="animate-spin" /> : <><XCircle className="mr-2 h-4 w-4" /> Reject</>}
                                    </Button>
                                </div>
                                <textarea
                                    placeholder="Reason for rejection (required if rejecting)"
                                    className="w-full border rounded p-2 text-sm"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CacVerification;
