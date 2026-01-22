import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import supabase from "@/utils/supabase";

const ProtectedRoutes = ({ children }: { children: JSX.Element }) => {
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  const user = sessionData?.user;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-sme-orange" />
          <p className="text-gray-600 font-medium">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default ProtectedRoutes;
