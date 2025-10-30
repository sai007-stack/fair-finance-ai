import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, TrendingUp, AlertTriangle, Users, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const EmployeeDashboard = () => {
  const navigate = useNavigate();

  // Mock data - would come from backend
  const analytics = {
    averageFairnessScore: 87.3,
    totalApplications: 1247,
    approvalRate: 64.2,
    approvalByIncome: [
      { range: "< $30k", rate: 42, count: 124 },
      { range: "$30k-$60k", rate: 68, count: 412 },
      { range: "$60k-$100k", rate: 78, count: 486 },
      { range: "> $100k", rate: 85, count: 225 },
    ],
    biasAlerts: [
      { type: "Low approval rate for low-income applicants", severity: "medium" },
    ],
  };

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
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Employee Dashboard</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Monitor fairness analytics and ensure ethical AI decisions
          </p>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-card to-primary/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Fairness Score</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.averageFairnessScore}%</p>
                </div>
              </div>
              <Progress value={analytics.averageFairnessScore} className="h-2" />
            </Card>

            <Card className="p-6 bg-gradient-to-br from-card to-success/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-success/10">
                  <Users className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.totalApplications.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-card to-accent/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approval Rate</p>
                  <p className="text-3xl font-bold text-foreground">{analytics.approvalRate}%</p>
                </div>
              </div>
              <Progress value={analytics.approvalRate} className="h-2" />
            </Card>
          </div>

          {/* Approval by Income */}
          <Card className="p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Approval Rate by Income Group
            </h2>
            <div className="space-y-4">
              {analytics.approvalByIncome.map((group) => (
                <div key={group.range}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground w-24">{group.range}</span>
                      <span className="text-xs text-muted-foreground">({group.count} applications)</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">{group.rate}%</span>
                  </div>
                  <Progress value={group.rate} className="h-3" />
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 italic">
              Monitoring income-based approval patterns to ensure fairness across all applicant groups
            </p>
          </Card>

          {/* Bias Alerts */}
          {analytics.biasAlerts.length > 0 && (
            <Card className="p-6 border-2 border-destructive/30 bg-destructive-light/10">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-6 w-6" />
                Bias Alerts
              </h2>
              <div className="space-y-3">
                {analytics.biasAlerts.map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{alert.type}</p>
                      <span className={`text-xs px-2 py-1 rounded-full inline-block mt-2 ${
                        alert.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                        alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {alert.severity.toUpperCase()} SEVERITY
                      </span>
                    </div>
                    <Button variant="outline" size="sm">
                      Investigate
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
