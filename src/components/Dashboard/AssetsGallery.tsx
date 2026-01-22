import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Trash2, Loader2, Image as ImageIcon, FileText, Clock } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Asset {
    id: string;
    type: string;
    asset_url: string;
    created_at: string;
    business_id: string;
}

interface DesignRequest {
    id: string;
    request_type: string;
    description: string;
    status: string;
    created_at: string;
}

const AssetsGallery = () => {
    const queryClient = useQueryClient();
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
    const [filter, setFilter] = useState<"logo" | "flyer" | "document">("logo");

    // 1. Fetch User Session
    const { data: sessionData, isLoading: sessionLoading } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await supabase.auth.getSession();
            return data.session;
        },
    });

    const user = sessionData?.user;

    // Realtime Subscriptions
    useEffect(() => {
        if (!user) return;

        // Channel for Assets (Insertions)
        const assetsChannel = supabase
            .channel('assets-updates')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'assets',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('New asset received:', payload);
                    queryClient.invalidateQueries({ queryKey: ['assets'] });
                    toast.success("New asset received!");
                }
            )
            .subscribe();

        // Channel for Design Requests (Updates)
        const requestsChannel = supabase
            .channel('requests-updates')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'design_requests',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    console.log('Request updated:', payload);
                    queryClient.invalidateQueries({ queryKey: ['designRequests'] });
                    if (payload.new.status === 'completed') {
                        toast.success("A design request has been completed!");
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(assetsChannel);
            supabase.removeChannel(requestsChannel);
        };
    }, [user, queryClient]);

    // 2. Fetch Assets
    const { data: assets = [], isLoading: assetsLoading } = useQuery({
        queryKey: ['assets', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("assets")
                .select("*")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as Asset[];
        },
    });

    // 3. Fetch Pending Design Requests
    const { data: pendingRequests = [], isLoading: requestsLoading } = useQuery({
        queryKey: ['designRequests', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("design_requests")
                .select("*")
                .eq("user_id", user!.id)
                .neq("status", "completed")
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data as DesignRequest[];
        },
    });

    // 4. Fetch Businesses for CAC Certificates
    const { data: businesses = [] } = useQuery({
        queryKey: ['businesses', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("businesses")
                .select("id, name, cac_certificate_url, created_at")
                .eq("user_id", user!.id)
                .not("cac_certificate_url", "is", null);
            if (error) throw error;
            return data;
        },
    });

    const loading = sessionLoading || assetsLoading || requestsLoading;

    // Merge Assets with CAC Certificates
    const allAssets = [
        ...assets,
        ...businesses.map((b: any) => ({
            id: `cac-${b.id}`,
            type: "document",
            asset_url: b.cac_certificate_url?.startsWith('http')
                ? b.cac_certificate_url
                : b.cac_certificate_url
                    ? supabase.storage.from('uploads').getPublicUrl(b.cac_certificate_url).data.publicUrl
                    : '',
            created_at: b.created_at,
            business_id: b.id,
            title: `CAC Certificate - ${b.name}`
        }))
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const handleDownload = async (asset: any) => {
        try {
            const response = await fetch(asset.asset_url);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${asset.title || asset.type}-${new Date(asset.created_at).getTime()}.${asset.asset_url.includes('.pdf') ? 'pdf' : 'png'}`;
            link.click();
            URL.revokeObjectURL(url);
            toast.success("Download started!");
        } catch (error) {
            console.error("Download error:", error);
            toast.error("Failed to download asset");
        }
    };

    const handleDelete = async (assetId: string) => {
        if (assetId.startsWith('cac-')) {
            toast.error("Cannot delete CAC Certificate from here.");
            return;
        }
        if (!confirm("Are you sure you want to delete this asset?")) return;

        try {
            const { error } = await supabase
                .from("assets")
                .delete()
                .eq("id", assetId);

            if (error) throw error;

            toast.success("Asset deleted successfully");
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        } catch (error: any) {
            console.error("Delete error:", error);
            toast.error("Failed to delete asset");
        }
    };

    const filteredAssets = allAssets.filter(asset => asset.type === filter);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 min-h-screen bg-zinc-950 text-zinc-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Assets Gallery</h1>
                    <p className="text-zinc-400 mt-2">View, download, and manage your generated assets</p>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap bg-zinc-900/50 p-1.5 rounded-xl border border-white/10 backdrop-blur-sm">
                    {[
                        { id: 'logo', label: 'Logos' },
                        { id: 'flyer', label: 'Flyers' },
                        { id: 'document', label: 'Documents' }
                    ].map(type => (
                        <Button
                            key={type.id}
                            variant={filter === type.id ? "secondary" : "ghost"}
                            onClick={() => setFilter(type.id as any)}
                            size="sm"
                            className={filter === type.id
                                ? "bg-zinc-800 text-white shadow-sm"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"}
                        >
                            {type.label} <span className="ml-2 opacity-50 text-xs">
                                ({allAssets.filter(a => a.type === type.id).length})
                            </span>
                        </Button>
                    ))}
                </div>
            </div>

            {/* Pending Requests Section */}
            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-sme-orange" /> Pending Requests
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {pendingRequests.map((req) => (
                            <Card key={req.id} className="bg-zinc-900/50 border-sme-orange/30 backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-sme-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <CardHeader className="p-5 pb-2 relative">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-sm font-medium flex items-center gap-2 text-sme-orange">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            {req.request_type.charAt(0).toUpperCase() + req.request_type.slice(1)}
                                        </CardTitle>
                                        <div className="px-2 py-0.5 rounded-full bg-sme-orange/10 border border-sme-orange/20 text-xs text-sme-orange capitalize">
                                            {req.status}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-5 pt-2 relative">
                                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{req.description || "No description provided."}</p>
                                    <div className="flex items-center text-xs text-zinc-500">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {filteredAssets.length === 0 && pendingRequests.length === 0 ? (
                <Card className="bg-zinc-900/30 border-dashed border-zinc-800">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-6 ring-1 ring-white/10">
                            <ImageIcon className="h-8 w-8 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">No assets found</h3>
                        <p className="text-zinc-500 text-sm mb-8 max-w-sm text-center">
                            {filter === "all"
                                ? "Start creating logos, flyers, and other assets to see them appear here."
                                : `You haven't created any ${filter}s yet.`}
                        </p>
                        <Button
                            onClick={() => window.location.href = "/dashboard/ai-tools"}
                            className="bg-sme-orange hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
                        >
                            Create New Asset
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAssets.map((asset) => (
                        <Card key={asset.id} className="bg-zinc-900/50 border-white/5 backdrop-blur-sm hover:border-white/20 hover:bg-zinc-900/80 transition-all duration-300 group overflow-hidden shadow-xl shadow-black/20">
                            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium flex items-center gap-2 text-zinc-300">
                                    {asset.type === "logo" && <ImageIcon className="h-4 w-4 text-purple-400" />}
                                    {asset.type === "flyer" && <ImageIcon className="h-4 w-4 text-pink-400" />}
                                    {asset.type === "document" && <FileText className="h-4 w-4 text-blue-400" />}
                                    {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                                </CardTitle>
                                <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-mono">
                                    {new Date(asset.created_at).toLocaleDateString()}
                                </span>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                {/* Preview */}
                                <div
                                    className="bg-zinc-950/50 rounded-lg h-48 flex items-center justify-center mb-4 cursor-pointer relative overflow-hidden border border-white/5 group-hover:border-white/10 transition-colors"
                                    onClick={() => setPreviewAsset(asset)}
                                >
                                    <div className="absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.1]" />

                                    {asset.asset_url?.includes('.svg') ? (
                                        <iframe
                                            src={asset.asset_url}
                                            className="w-full h-full pointer-events-none relative z-10"
                                            title={`${asset.type} preview`}
                                        />
                                    ) : (
                                        <img
                                            src={asset.asset_url}
                                            alt={asset.type}
                                            className="max-w-full max-h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}

                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 z-20 backdrop-blur-[2px]">
                                        <Button
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-full bg-white text-black hover:bg-zinc-200"
                                            onClick={(e) => { e.stopPropagation(); setPreviewAsset(asset); }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="h-9 w-9 p-0 rounded-full bg-white text-black hover:bg-zinc-200"
                                            onClick={(e) => { e.stopPropagation(); handleDownload(asset); }}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        {!asset.id?.startsWith('cac-') && (
                                            <Button
                                                size="sm"
                                                className="h-9 w-9 p-0 rounded-full bg-red-500 text-white hover:bg-red-600 border-0"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(asset.id); }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="text-xs text-zinc-500 truncate font-medium">
                                    {(asset as any).title || `${asset.type} asset`}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] bg-zinc-950 border-white/10 p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 border-b border-white/10 bg-zinc-900/50 backdrop-blur-xl">
                        <DialogTitle className="flex items-center gap-3 text-white">
                            {previewAsset?.type === "logo" && <ImageIcon className="h-5 w-5 text-purple-400" />}
                            {previewAsset?.type === "flyer" && <ImageIcon className="h-5 w-5 text-pink-400" />}
                            {previewAsset?.type === "document" && <FileText className="h-5 w-5 text-blue-400" />}
                            {previewAsset?.type.charAt(0).toUpperCase() + previewAsset?.type.slice(1)} Preview
                        </DialogTitle>
                    </DialogHeader>

                    <div className="bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 p-8 flex items-center justify-center min-h-[400px]">
                        {previewAsset?.asset_url.includes('.svg') ? (
                            <iframe
                                src={previewAsset.asset_url}
                                className="w-full h-[500px] border-0"
                                title="Asset preview"
                            />
                        ) : (
                            <img
                                src={previewAsset?.asset_url}
                                alt="Asset preview"
                                className="max-w-full max-h-[500px] object-contain shadow-2xl rounded-lg"
                            />
                        )}
                    </div>

                    <div className="p-6 border-t border-white/10 bg-zinc-900/50 backdrop-blur-xl flex justify-between items-center">
                        <div className="text-sm text-zinc-500">
                            Created on {previewAsset && new Date(previewAsset.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setPreviewAsset(null)} className="text-zinc-400 hover:text-white">
                                Close
                            </Button>
                            <Button onClick={() => previewAsset && handleDownload(previewAsset)} className="bg-white text-black hover:bg-zinc-200">
                                <Download className="h-4 w-4 mr-2" />
                                Download Asset
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AssetsGallery;
