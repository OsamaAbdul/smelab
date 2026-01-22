import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { UserProvider } from './context/useContext.tsx';
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
        <UserProvider>
            <App />
        </UserProvider>
        <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
);
