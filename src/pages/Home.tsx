import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, TrendingUp, Users, ArrowRight, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">FairFinance</span>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            Welcome to FairFinance
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4">
            Ethical AI Banking
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience transparent, fair, and AI-powered loan decisions that put ethics first
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
          <Card 
            className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/80"
            onClick={() => navigate('/apply')}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Apply for Loan</h2>
              <p className="text-muted-foreground">
                Get instant AI-powered loan decisions with complete transparency
              </p>
              <Button className="mt-2 group-hover:scale-105 transition-transform">
                Start Application <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/80"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Users className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Employee Dashboard</h2>
              <p className="text-muted-foreground">
                Monitor fairness analytics and ensure ethical AI decisions
              </p>
              <Button variant="secondary" className="mt-2 group-hover:scale-105 transition-transform">
                View Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Ethical AI Info Section */}
        <Card className="max-w-4xl mx-auto p-8 bg-success-light/30 border-success/30">
          <div className="flex items-start gap-4">
            <Shield className="h-12 w-12 text-success flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                How FairFinance Ensures Ethical AI Decisions
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span><strong>No Bias:</strong> We never use sensitive data like gender, race, or region in our predictions</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span><strong>Full Transparency:</strong> You can see exactly what data was used in your loan decision</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span><strong>Fairness Score:</strong> Every decision includes a fairness metric to ensure equitable treatment</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span><strong>Appeal Process:</strong> Rejected applications can request a fairness recheck</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span><strong>Continuous Monitoring:</strong> Our employee dashboard tracks and prevents bias patterns</span>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Home;
