import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, CheckCircle, XCircle, Download } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const DesignRequests = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [processing, setProcessing] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("design_requests")
            .select("*, profiles(first_name, last_name, email), businesses(name)")
            .eq("status", "pending")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching design requests:", error);
            toast.error("Failed to load requests");
        } else {
            setRequests(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUploadComplete = async () => {
        if (!selectedRequest || !uploadFile) return;
        setProcessing(true);

        try {
            // 1. Upload File
            const fileName = `designs/${selectedRequest.user_id}/${Date.now()}-${uploadFile.name}`;
            const { error: uploadError } = await supabase.storage
                .from("uploads")
                .upload(fileName, uploadFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(fileName);

            // 2. Save Asset
            await supabase.from("assets").insert({
                user_id: selectedRequest.user_id,
                business_id: selectedRequest.business_id,
                type: selectedRequest.request_type,
                asset_url: publicUrl
            });

            // 3. Update Request Status
            await supabase
                .from("design_requests")
                .update({ status: "completed" })
                .eq("id", selectedRequest.id);

            // 4. Notify User
            await supabase.from("notifications").insert({
                user_id: selectedRequest.user_id,
                title: "Design Request Completed",
                message: `Your ${selectedRequest.request_type} request for ${selectedRequest.businesses?.name} is ready!`,
                type: "success",
                action_url: "/dashboard/assets"
            });

            toast.success("Design uploaded and request completed!");
            setSelectedRequest(null);
            setUploadFile(null);
            fetchRequests();
        } catch (err) {
            console.error(err);
            toast.error("Failed to complete request");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Design Requests</h1>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
            ) : requests.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-gray-500">
                        No pending design requests.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} className="hover:shadow-md transition cursor-pointer" onClick={() => setSelectedRequest(req)}>
                            <CardContent className="p-6 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg capitalize">{req.request_type} Request</h3>
                                    <p className="text-sm text-gray-500">
                                        Business: {req.businesses?.name || "N/A"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Requested: {new Date(req.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                                        Pending
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Process Design Request</DialogTitle>
                        <DialogDescription>Review requirements and upload completed design.</DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 py-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-sm">
                                <p className="font-semibold mb-1">Description/Instructions:</p>
                                <p className="text-gray-700">{selectedRequest.description || "No description provided."}</p>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-4">Upload Completed Design</h4>

                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    />
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600">
                                        {uploadFile ? uploadFile.name : "Click to upload design file"}
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="outline" onClick={() => setSelectedRequest(null)}>Cancel</Button>
                                    <Button
                                        className="bg-sme-orange text-white"
                                        disabled={!uploadFile || processing}
                                        onClick={handleUploadComplete}
                                    >
                                        {processing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                        Complete Request
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

export default DesignRequests;
