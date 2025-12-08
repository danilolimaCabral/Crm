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
import Auth from "./pages/Auth";
import LiveLanding from "./pages/LiveLanding";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/auth"} component={Auth} />
      <Route path={"/onboarding"} component={PlanOnboarding} />
      <Route path={"/"} component={Home} />
      <Route path={"/cotacao"} component={Cotacao} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/admin/leads" component={AdminLeads} />
      <Route path="/live" component={LiveLanding} />
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
