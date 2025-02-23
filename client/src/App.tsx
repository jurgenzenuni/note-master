import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Auth from "@/pages/auth";
import { useQuery } from "@tanstack/react-query";

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const [, setLocation] = useLocation();

  const {
    isLoading,
    data: user,
    isError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    },
    retry: false,
    staleTime: Infinity,
  });

  if (isLoading) return null;

  if (isError || !user) {
    setLocation("/auth");
    return null;
  }

  return <Component />;
}

function AuthRoute({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const [, setLocation] = useLocation();

  const { isLoading, data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) throw new Error("Not authenticated");
      return response.json();
    },
    retry: false,
  });

  if (isLoading) return null;

  if (user) {
    setLocation("/");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={() => <AuthRoute component={Auth} />} />
      <Route path="/" component={() => <ProtectedRoute component={Home} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
