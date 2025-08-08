import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeoProvider } from "@/components/seo/Seo";
import { WalletProvider } from "@/components/wallet/WalletContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreateProject from "./pages/CreateProject";
import MyInvestments from "./pages/MyInvestments";
import TokenManagement from "./pages/TokenManagement";

const queryClient = new QueryClient();

const App = () => (
  <SeoProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateProject />} />
              <Route path="/investments" element={<MyInvestments />} />
              <Route path="/tokens" element={<TokenManagement />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </SeoProvider>
);

export default App;
