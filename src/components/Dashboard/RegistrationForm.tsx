import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, Trash2, Plus, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import supabase from "@/utils/supabase";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface RegistrationFormProps {
    businessId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const steps = ["Personal Info", "Business Info", "Proprietors", "Review"];

export default function RegistrationForm({ businessId, onSuccess, onCancel }: RegistrationFormProps) {
    const queryClient = useQueryClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Form State
    const [personalInfo, setPersonalInfo] = useState({
        fullName: "",
        dob: "",
        phone: "",
        email: "",
        homeAddress: "",
        passportUrl: "",
        idUrl: "",
        idType: "nin", // default
    });

    const [businessInfo, setBusinessInfo] = useState({
        address: "",
        activities: "",
        category: "",
    });

    const [partners, setPartners] = useState<any[]>([]);
    const [isSoleProprietor, setIsSoleProprietor] = useState(true);

    // Fetch User & Business Data
    const { data: sessionData } = useQuery({
        queryKey: ['session'],
        queryFn: async () => {
            const { data } = await supabase.auth.getSession();
            return data.session;
        },
    });
    const user = sessionData?.user;

    const { data: business } = useQuery({
        queryKey: ['business', businessId],
        enabled: !!businessId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("businesses")
                .select("*")
                .eq("id", businessId)
                .single();
            if (error) throw error;
            return data;
        },
    });

    // Fetch Partners
    const { data: existingPartners } = useQuery({
        queryKey: ['partners', businessId],
        enabled: !!businessId,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("business_partners")
                .select("*")
                .eq("business_id", businessId);
            if (error) throw error;
            return data;
        },
    });

    // Initialize Form Data
    useEffect(() => {
        if (user && !personalInfo.fullName) {
            setPersonalInfo(prev => ({
                ...prev,
                fullName: user.user_metadata?.full_name || "",
                email: user.email || "",
                phone: user.user_metadata?.phone_number || "",
            }));
        }
    }, [user]);

    useEffect(() => {
        if (business) {
            setPersonalInfo(prev => ({
                ...prev,
                homeAddress: business.residential_address || prev.homeAddress,
                dob: business.proprietor_dob || prev.dob,
                idType: business.proprietor_id_type || prev.idType,
                idUrl: business.proprietor_id_url || prev.idUrl,
                passportUrl: business.passport_url || prev.passportUrl,
            }));
            setBusinessInfo(prev => ({
                ...prev,
                address: business.company_address || prev.address,
                activities: business.business_activities || business.description || prev.activities,
                category: business.business_category || business.industry || prev.category,
            }));
        }
    }, [business]);

    useEffect(() => {
        if (existingPartners && existingPartners.length > 0) {
            setIsSoleProprietor(false);
            setPartners(existingPartners);
        }
    }, [existingPartners]);


    const handleFileUpload = async (file: File, path: string, fieldUpdate: (url: string) => void) => {
        if (!user) return;
        setUploading(path);
        try {
            const fileName = `${path}/${user.id}/${Date.now()}-${file.name}`;
            const { error } = await supabase.storage.from("uploads").upload(fileName, file);
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage.from("uploads").getPublicUrl(fileName);
            fieldUpdate(publicUrl);
            toast.success("File uploaded successfully");
        } catch (error: any) {
            console.error(error);
            toast.error("Upload failed: " + error.message);
        } finally {
            setUploading(null);
        }
    };

    const saveStep = async () => {
        setLoading(true);
        try {
            if (currentStep === 0) {
                // Save Personal Info
                await supabase.from("businesses").update({
                    residential_address: personalInfo.homeAddress,
                    proprietor_dob: personalInfo.dob || null,
                    proprietor_id_type: personalInfo.idType,
                    proprietor_id_url: personalInfo.idUrl,
                    passport_url: personalInfo.passportUrl,
                    phone_number: personalInfo.phone, // Update business phone? Or user profile phone? Let's assume business contact for now or just keep it in profile
                }).eq("id", businessId);

                // Also update profile if needed?
            } else if (currentStep === 1) {
                // Save Business Info
                await supabase.from("businesses").update({
                    company_address: businessInfo.address,
                    business_activities: businessInfo.activities,
                    business_category: businessInfo.category,
                }).eq("id", businessId);
            } else if (currentStep === 2) {
                // Save Partners
                if (!isSoleProprietor) {
                    // Delete existing and re-insert? Or upsert.
                    // Simple approach: Upsert if ID exists, Insert if not.
                    for (const p of partners) {
                        const payload = {
                            business_id: businessId,
                            full_name: p.full_name,
                            email: p.email,
                            phone: p.phone,
                            address: p.address,
                            passport_url: p.passport_url,
                            id_url: p.id_url,
                            ownership_percentage: p.ownership_percentage
                        };

                        if (p.id && p.id.length > 10) { // existing uuid
                            await supabase.from("business_partners").update(payload).eq("id", p.id);
                        } else {
                            await supabase.from("business_partners").insert(payload);
                        }
                    }
                }
            }

            if (currentStep < steps.length - 1) {
                setCurrentStep(prev => prev + 1);
            } else {
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to save: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const addPartner = () => {
        setPartners([...partners, {
            full_name: "",
            email: "",
            phone: "",
            address: "",
            passport_url: "",
            id_url: "",
            ownership_percentage: 0
        }]);
    };

    const updatePartner = (index: number, field: string, value: any) => {
        const newPartners = [...partners];
        newPartners[index] = { ...newPartners[index], [field]: value };
        setPartners(newPartners);
    };

    const removePartner = async (index: number) => {
        const p = partners[index];
        if (p.id) {
            await supabase.from("business_partners").delete().eq("id", p.id);
        }
        setPartners(partners.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Stepper */}
            <div className="mb-8">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                    {steps.map((step, idx) => (
                        <div key={idx} className={`flex flex-col items-center bg-white px-2 ${idx <= currentStep ? "text-sme-orange" : "text-gray-400"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mb-2 ${idx <= currentStep ? "border-sme-orange bg-orange-50" : "border-gray-200 bg-white"}`}>
                                {idx + 1}
                            </div>
                            <span className="text-xs font-medium">{step}</span>
                        </div>
                    ))}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{steps[currentStep]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* STEP 1: PERSONAL INFO */}
                    {currentStep === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input value={personalInfo.fullName} onChange={e => setPersonalInfo({ ...personalInfo, fullName: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Date of Birth</Label>
                                <Input type="date" value={personalInfo.dob} onChange={e => setPersonalInfo({ ...personalInfo, dob: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone Number</Label>
                                <Input value={personalInfo.phone} onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Email Address</Label>
                                <Input value={personalInfo.email} onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })} />
                            </div>
                            <div className="col-span-1 md:col-span-2 space-y-2">
                                <Label>Home Address</Label>
                                <Textarea value={personalInfo.homeAddress} onChange={e => setPersonalInfo({ ...personalInfo, homeAddress: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Passport Photograph</Label>
                                <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer relative">
                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'passports', url => setPersonalInfo({ ...personalInfo, passportUrl: url }))} />
                                    {personalInfo.passportUrl ? (
                                        <img src={personalInfo.passportUrl} alt="Passport" className="h-24 mx-auto object-cover rounded" />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <Upload className="h-6 w-6 mb-2" />
                                            <span className="text-xs">Upload Passport</span>
                                        </div>
                                    )}
                                    {uploading === 'passports' && <Loader2 className="animate-spin absolute top-2 right-2" />}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Means of ID</Label>
                                <select
                                    className="w-full border rounded-md p-2 text-sm"
                                    value={personalInfo.idType}
                                    onChange={e => setPersonalInfo({ ...personalInfo, idType: e.target.value })}
                                >
                                    <option value="nin">NIN</option>
                                    <option value="voters_card">Voter's Card</option>
                                    <option value="drivers_license">Driver's License</option>
                                    <option value="intl_passport">Int'l Passport</option>
                                </select>
                                <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer relative">
                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ids', url => setPersonalInfo({ ...personalInfo, idUrl: url }))} />
                                    {personalInfo.idUrl ? (
                                        <div className="text-green-600 flex items-center justify-center gap-2">
                                            <CheckCircle2 className="h-5 w-5" /> ID Uploaded
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <Upload className="h-6 w-6 mb-2" />
                                            <span className="text-xs">Upload ID Document</span>
                                        </div>
                                    )}
                                    {uploading === 'ids' && <Loader2 className="animate-spin absolute top-2 right-2" />}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: BUSINESS INFO */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Business Address</Label>
                                <Textarea value={businessInfo.address} onChange={e => setBusinessInfo({ ...businessInfo, address: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Business Activities (Short Description)</Label>
                                <Textarea value={businessInfo.activities} onChange={e => setBusinessInfo({ ...businessInfo, activities: e.target.value })} placeholder="e.g. Buying and selling of..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Nature of Business Category</Label>
                                <Input value={businessInfo.category} onChange={e => setBusinessInfo({ ...businessInfo, category: e.target.value })} placeholder="e.g. IT, Fashion, Real Estate" />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: PROPRIETORS */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <input
                                    type="checkbox"
                                    id="sole"
                                    checked={isSoleProprietor}
                                    onChange={e => setIsSoleProprietor(e.target.checked)}
                                    className="h-5 w-5 text-sme-orange"
                                />
                                <Label htmlFor="sole" className="text-base">I am the only owner (Sole Proprietor)</Label>
                            </div>

                            {!isSoleProprietor && (
                                <div className="space-y-6">
                                    {partners.map((partner, idx) => (
                                        <div key={idx} className="border rounded-xl p-4 bg-gray-50 relative">
                                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-red-500" onClick={() => removePartner(idx)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <h4 className="font-bold mb-4">Partner {idx + 1}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Full Name</Label>
                                                    <Input value={partner.full_name} onChange={e => updatePartner(idx, 'full_name', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Email</Label>
                                                    <Input value={partner.email} onChange={e => updatePartner(idx, 'email', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Phone</Label>
                                                    <Input value={partner.phone} onChange={e => updatePartner(idx, 'phone', e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Ownership %</Label>
                                                    <Input type="number" value={partner.ownership_percentage} onChange={e => updatePartner(idx, 'ownership_percentage', e.target.value)} />
                                                </div>
                                                <div className="col-span-1 md:col-span-2 space-y-2">
                                                    <Label>Address</Label>
                                                    <Input value={partner.address} onChange={e => updatePartner(idx, 'address', e.target.value)} />
                                                </div>

                                                {/* Partner Uploads */}
                                                <div className="space-y-2">
                                                    <Label>Partner Passport</Label>
                                                    <Input type="file" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'passports', url => updatePartner(idx, 'passport_url', url))} />
                                                    {partner.passport_url && <span className="text-xs text-green-600">Uploaded</span>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Partner ID</Label>
                                                    <Input type="file" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'ids', url => updatePartner(idx, 'id_url', url))} />
                                                    {partner.id_url && <span className="text-xs text-green-600">Uploaded</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <Button variant="outline" onClick={addPartner} className="w-full">
                                        <Plus className="mr-2 h-4 w-4" /> Add Partner
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg">Review Information</h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <p><strong>Name:</strong> {personalInfo.fullName}</p>
                                <p><strong>Business:</strong> {business?.name}</p>
                                <p><strong>Category:</strong> {businessInfo.category}</p>
                                <p><strong>Ownership:</strong> {isSoleProprietor ? "Sole Proprietorship" : `${partners.length} Partners`}</p>
                            </div>
                            <p className="text-gray-500 text-sm">Please ensure all details are correct before proceeding to payment.</p>
                        </div>
                    )}

                    <div className="flex justify-between mt-6 pt-4 border-t">
                        <Button variant="outline" onClick={currentStep === 0 ? onCancel : () => setCurrentStep(prev => prev - 1)}>
                            {currentStep === 0 ? "Cancel" : "Back"}
                        </Button>
                        <Button onClick={saveStep} disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {currentStep === steps.length - 1 ? "Proceed to Payment" : "Next"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
