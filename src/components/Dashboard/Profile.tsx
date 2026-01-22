import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Phone, Building2, MapPin, Calendar, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
    const queryClient = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        phone_number: "",
        display_name: "",
    });

    // 1. Fetch User Session
    const { data: sessionData, isLoading: sessionLoading } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await supabase.auth.getSession();
            return data.session;
        },
    });

    const user = sessionData?.user;

    // 2. Fetch Profile
    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['profile', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user!.id)
                .single();
            if (error) throw error;
            return data;
        },
    });

    // 3. Fetch Businesses
    const { data: businesses, isLoading: businessesLoading } = useQuery({
        queryKey: ['businesses', user?.id],
        enabled: !!user,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false });
            if (error) throw error;
            return data;
        },
    });

    const loading = sessionLoading || profileLoading || businessesLoading;
    const business = businesses?.[0] || null;

    useEffect(() => {
        if (profile) {
            setFormData({
                first_name: profile.first_name || "",
                last_name: profile.last_name || "",
                phone_number: profile.phone_number || "",
                display_name: profile.display_name || "",
            });
        }
    }, [profile]);

    const handleUpdateProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone_number: formData.phone_number,
                    display_name: formData.display_name,
                })
                .eq("id", user.id);

            if (error) throw error;

            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            console.error("Error updating profile:", error.message);
            toast.error("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    // Use global loading if profile is not yet loaded
    if (!profile && loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 pb-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">My Profile</h2>
                    <p className="text-muted-foreground">
                        Manage your personal information and business details.
                    </p>
                </div>
                <Button
                    variant={isEditing ? "outline" : "default"}
                    onClick={() => setIsEditing(!isEditing)}
                    disabled={saving}
                >
                    {isEditing ? <><X className="mr-2 h-4 w-4" /> Cancel</> : <><Edit className="mr-2 h-4 w-4" /> Edit Profile</>}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={profile?.avatar_url} alt={profile?.first_name} />
                            <AvatarFallback className="text-lg">
                                {profile?.first_name?.charAt(0)}
                                {profile?.last_name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle>{profile?.first_name} {profile?.last_name}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {profile?.display_name || "SME Owner"}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={formData.last_name}
                                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="display_name">Display Name</Label>
                                    <Input
                                        id="display_name"
                                        value={formData.display_name}
                                        onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleUpdateProfile} disabled={saving} className="w-full">
                                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Mail className="h-4 w-4" /> Email
                                    </div>
                                    <p>{profile?.email}</p>
                                </div>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Phone className="h-4 w-4" /> Phone
                                    </div>
                                    <p>{profile?.phone_number || "Not provided"}</p>
                                </div>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Calendar className="h-4 w-4" /> Joined
                                    </div>
                                    <p>{new Date(profile?.created_at).toLocaleDateString()}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Business Details Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" /> Business Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {business ? (
                            <>
                                <div className="grid gap-1">
                                    <div className="text-sm font-medium text-muted-foreground">Business Name</div>
                                    <p className="text-lg font-semibold">{business.name}</p>
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-sm font-medium text-muted-foreground">Industry</div>
                                    <p>{business.industry || business.nature_of_business || "Not specified"}</p>
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-sm font-medium text-muted-foreground">Stage</div>
                                    <p className="capitalize">{business.stage || "Idea"}</p>
                                </div>
                                <div className="grid gap-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <MapPin className="h-4 w-4" /> Address
                                    </div>
                                    <p>{business.company_address || "No address provided"}</p>
                                </div>
                                <div className="grid gap-1">
                                    <div className="text-sm font-medium text-muted-foreground">Registration Status</div>
                                    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${business.registration_status === 'registered'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {business.registration_status === 'registered' ? 'Registered' : 'Pending / Not Registered'}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <p className="text-muted-foreground mb-4">No business details found.</p>
                                <Button variant="outline" onClick={() => window.location.href = '/dashboard/onboarding'}>
                                    Start Onboarding
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
