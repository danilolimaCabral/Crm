import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import PlanOnboarding from "./pages/PlanOnboarding";
import AdminLeads from "./pages/AdminLeads";
import Cotacao from "./pages/Cotacao";
import Favoritos from "./pages/Favoritos";
import Cotacoes from "./pages/Cotacoes";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
       <Route path={"/onboarding"} component={PlanOnboarding} />
      <Route path={"/"} component={Home} />
      <Route path={"/cotacao"} component={Cotacao} />
      <Route path={"/cotacoes"} component={Cotacoes} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/favoritos" component={Favoritos} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
