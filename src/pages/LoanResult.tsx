import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, CheckCircle2, XCircle, Info, RefreshCw, FileText, Brain, Sparkles, Bell } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const LoanResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmittingAppeal, setIsSubmittingAppeal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  
  const result = location.state as {
    prediction: string;
    confidence: number;
    fairnessScore: number;
    explanation: string;
    dataUsed: any;
    loanId?: string;
    predictionMethod?: string;
  } | null;

  if (!result) {
    navigate('/');
    return null;
  }

  const isApproved = result.prediction.toUpperCase() === "APPROVED";

  useEffect(() => {
    if (result?.dataUsed?.name && isApproved) {
      fetchNotifications();
    }
  }, [result?.dataUsed?.name, isApproved]);

  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', result.dataUsed.name)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleAppeal = async () => {
    setIsSubmittingAppeal(true);
    try {
      const { data, error } = await supabase.functions.invoke('handle-appeal', {
        body: {
          loanId: result.loanId,
          userId: result.dataUsed.name,
          reasonCodes: {
            prediction: result.prediction,
            confidence: result.confidence,
            fairnessScore: result.fairnessScore,
            explanation: result.explanation
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Appeal Submitted",
        description: data.message,
      });

      // Navigate to customer dashboard
      navigate('/customer-dashboard', { state: { customerName: result.dataUsed.name } });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingAppeal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold text-foreground">FairFinance</span>
            </div>
          </div>
          
          {isApproved && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <Badge variant="secondary">{unreadCount} unread</Badge>
                    )}
                  </div>
                  <ScrollArea className="h-[300px] pr-4">
                    {loadingNotifications ? (
                      <p className="text-sm text-muted-foreground">Loading...</p>
                    ) : notifications.length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You'll receive EMI reminders here every month
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <Card 
                            key={notification.id}
                            className={`p-3 ${notification.read ? 'bg-secondary/10' : 'bg-primary/5 border-primary/20'}`}
                          >
                            <div className="space-y-2">
                              <p className="text-sm text-foreground">{notification.message}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                                {!notification.read && (
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    className="h-6 text-xs"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    Mark as read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Result Card */}
          <Card className={`p-8 border-2 ${isApproved ? 'border-success bg-success-light/20' : 'border-destructive bg-destructive-light/20'}`}>
            {/* Prediction Method Badge */}
            <div className="mb-4 flex items-center gap-2">
              {result.predictionMethod === 'huggingface' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-primary">ML Model Prediction</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 border border-border/50">
                  <Sparkles className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">AI Analysis</span>
                </div>
              )}
            </div>

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
                  <Button 
                    className="flex-1" 
                    size="lg" 
                    onClick={handleAppeal}
                    disabled={isSubmittingAppeal}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    {isSubmittingAppeal ? 'Submitting...' : 'Appeal Decision'}
                  </Button>
                  <Button className="flex-1" size="lg" onClick={() => navigate('/apply')} variant="outline">
                    <RefreshCw className="mr-2 h-5 w-5" />
                    Apply Again
                  </Button>
                  <Button variant="secondary" className="flex-1" size="lg" onClick={() => navigate('/')}>
                    Return Home
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
                <span className="text-muted-foreground ml-2">₹{result.dataUsed.income?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Credit Score:</span>
                <span className="text-muted-foreground ml-2">{result.dataUsed.creditScore}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Loan Amount:</span>
                <span className="text-muted-foreground ml-2">₹{result.dataUsed.loanAmount?.toLocaleString('en-IN')}</span>
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
                <span className="text-muted-foreground ml-2">₹{result.dataUsed.existingLoans?.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Savings:</span>
                <span className="text-muted-foreground ml-2">₹{result.dataUsed.savingsBalance?.toLocaleString('en-IN')}</span>
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
