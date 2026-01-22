import supabase from "@/utils/supabase";

export const initializeChecklist = async (userId: string, type: "new" | "old", businessId?: string) => {
    const newBusinessSteps = [
        { step_key: 'profile', title: 'Idea & Strategy', description: 'Define your business goals and target audience.', action_url: '/dashboard/onboarding' },
        { step_key: 'registration', title: 'Business Registration', description: 'Register your business with CAC.', action_url: '/dashboard/registration' },
        { step_key: 'branding', title: 'Brand Identity', description: 'Create your logo and marketing materials.', action_url: '/dashboard/ai-tools' },
        { step_key: 'compliance', title: 'Compliance Setup', description: 'Get your tax and regulatory requirements sorted.', action_url: '/dashboard/compliance' },
    ];

    const existingBusinessSteps = [
        { step_key: 'verification', title: 'Business Verification', description: 'Verify your existing business details.', action_url: '/dashboard/existing-business' },
        { step_key: 'compliance', title: 'Compliance Audit', description: 'Check your current compliance status.', action_url: '/dashboard/compliance' },
        { step_key: 'digital', title: 'Digital Upgrade', description: 'Refresh your brand and digital presence.', action_url: '/dashboard/marketing' },
        { step_key: 'growth', title: 'Growth Consulting', description: 'Book a session with an expert.', action_url: '/dashboard/consulting' },
    ];

    const steps = type === 'new' ? newBusinessSteps : existingBusinessSteps;

    const { error } = await supabase
        .from('onboarding_checklist')
        .insert(steps.map(step => ({
            user_id: userId,
            business_id: businessId || null, // Link to business if provided
            ...step
        })));

    if (error) throw new Error(error.message);
};

export const updateProfileBusinessType = async ({
    userId,
    choice
}: {
    userId: string;
    choice: "new" | "old";
}) => {
    // 1. Update Profile
    const { error: profileError } = await supabase
        .from("profiles")
        .update({ business_type: choice })
        .eq("id", userId);

    if (profileError) throw new Error(profileError.message);

    // 2. Initialize Checklist
    await initializeChecklist(userId, choice);
};

export const updateChecklistStatus = async (id: number, status: string) => {
    const { error } = await supabase
        .from("onboarding_checklist")
        .update({ status })
        .eq("id", id);

    if (error) throw new Error(error.message);
};
