import supabase from "@/utils/supabase";
import { supabaseFetcher } from "./client";

export const fetchUserProfile = async (userId: string) => {
    return supabaseFetcher(() =>
        supabase.from("profiles").select("*").eq("id", userId).single()
    );
};

export const fetchUserBusiness = async (userId: string) => {
    // We use maybeSingle() because a user might not have a business yet
    const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
};

export const fetchUserChecklist = async (userId: string) => {
    const { data, error } = await supabase
        .from("onboarding_checklist")
        .select("*")
        .eq("user_id", userId)
        .order("id", { ascending: true });

    if (error) throw new Error(error.message);
    return data || [];
};

export const fetchRecentAssets = async (userId: string) => {
    const { data, error } = await supabase
        .from("assets")
        .select("type, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

    if (error) throw new Error(error.message);
    return data || [];
};
