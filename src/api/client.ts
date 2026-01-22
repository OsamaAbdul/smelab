import supabase from "@/utils/supabase";

/**
 * Generic fetcher for Supabase queries.
 * @param queryFn A function that returns a Supabase PostgrestBuilder or similar.
 * @returns The data from the query.
 * @throws Error if the query fails.
 */
export const supabaseFetcher = async <T>(
    queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<T> => {
    const { data, error } = await queryFn();

    if (error) {
        throw new Error(error.message || "An error occurred while fetching data");
    }

    if (data === null) {
        throw new Error("No data found");
    }

    return data;
};

// Example usage:
// const data = await supabaseFetcher(() => supabase.from('table').select('*'));
