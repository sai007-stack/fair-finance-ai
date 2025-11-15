import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowRight, FileText, CheckCircle, Clock } from "lucide-react";

const StartApplication = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">FairFinance</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
              Start Your Loan Application
            </h1>
            <p className="text-xl text-muted-foreground">
              Get instant AI-powered decisions with complete transparency
            </p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground">How It Works</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Select Your Bank</h3>
                  <p className="text-muted-foreground">
                    Choose from government or private sector banks
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Choose Loan Type</h3>
                  <p className="text-muted-foreground">
                    Select from Home, Personal, Business, or Educational loans
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Fill Application</h3>
                  <p className="text-muted-foreground">
                    Provide your details and upload required documents
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Get Instant Decision</h3>
                  <p className="text-muted-foreground">
                    Our AI analyzes your application and provides transparent results
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-lg mb-3 text-foreground">What You'll Need</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Personal information (Name, Age, Gender, Aadhar ID)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Financial details (Income, Credit Score, Expenses)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span>Documents (ID proof, Income proof, relevant certificates)</span>
              </li>
            </ul>
          </Card>

          <Button 
            size="lg" 
            className="w-full text-lg"
            onClick={() => navigate('/bank-selection')}
          >
            Continue to Bank Selection
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StartApplication;
