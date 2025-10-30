import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle2, XCircle, Info, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const LoanResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state as {
    prediction: string;
    confidence: number;
    fairnessScore: number;
    explanation: string;
    dataUsed: any;
  } | null;

  if (!result) {
    navigate('/');
    return null;
  }

  const isApproved = result.prediction === "Approved";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">FairFinance</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Card */}
          <Card className={`p-8 border-2 ${isApproved ? 'border-success bg-success-light/20' : 'border-destructive bg-destructive-light/20'}`}>
            <div className="flex items-center gap-4 mb-6">
              {isApproved ? (
                <CheckCircle2 className="h-16 w-16 text-success flex-shrink-0" />
              ) : (
                <XCircle className="h-16 w-16 text-destructive flex-shrink-0" />
              )}
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Loan {result.prediction}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {isApproved ? "Congratulations! Your loan has been approved." : "We're unable to approve your loan at this time."}
                </p>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Metrics */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Confidence</span>
                  <span className="text-sm font-bold text-foreground">{result.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={result.confidence} className="h-3" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Fairness Score</span>
                  <span className="text-sm font-bold text-foreground">{result.fairnessScore.toFixed(1)}%</span>
                </div>
                <Progress value={result.fairnessScore} className="h-3" />
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-card/50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Decision Explanation
              </h3>
              <p className="text-muted-foreground">{result.explanation}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {isApproved ? (
                <>
                  <Button className="flex-1" size="lg">
                    View Loan Details
                  </Button>
                  <Button variant="secondary" className="flex-1" size="lg" onClick={() => navigate('/')}>
                    Return Home
                  </Button>
                </>
              ) : (
                <>
                  <Button className="flex-1" size="lg">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Request Fairness Recheck
                  </Button>
                  <Button variant="secondary" className="flex-1" size="lg" onClick={() => navigate('/apply')}>
                    Try Another Application
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Transparency Card */}
          <Card className="p-6 bg-muted/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Data Used in Decision
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              For complete transparency, here's the data that was analyzed for your loan decision:
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-foreground">Income:</span>
                <span className="text-muted-foreground ml-2">${result.dataUsed.income?.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Credit Score:</span>
                <span className="text-muted-foreground ml-2">{result.dataUsed.creditScore}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Loan Amount:</span>
                <span className="text-muted-foreground ml-2">${result.dataUsed.loanAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Loan Term:</span>
                <span className="text-muted-foreground ml-2">{result.dataUsed.loanTerm} months</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Employment:</span>
                <span className="text-muted-foreground ml-2">{result.dataUsed.employmentStatus}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Existing Loans:</span>
                <span className="text-muted-foreground ml-2">${result.dataUsed.existingLoans?.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Savings:</span>
                <span className="text-muted-foreground ml-2">${result.dataUsed.savingsBalance?.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              Note: No sensitive data like gender, race, or location was used in this decision.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default LoanResult;
