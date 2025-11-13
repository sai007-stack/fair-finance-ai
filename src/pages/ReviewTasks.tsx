import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, ArrowLeft, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const ReviewTasks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appeals, setAppeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppeal, setSelectedAppeal] = useState<any>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [finalDecision, setFinalDecision] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingAppeals();
  }, []);

  const fetchPendingAppeals = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('appeals')
        .select(`
          *,
          loan_applications (
            id,
            name,
            loan_amount,
            prediction,
            explanation
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAppeals(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewComment || !finalDecision) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke('review-appeal', {
        body: {
          appealId: selectedAppeal.id,
          reviewComment,
          finalDecision
        }
      });

      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "The customer has been notified.",
      });

      setSelectedAppeal(null);
      setReviewComment("");
      setFinalDecision("");
      fetchPendingAppeals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
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
          <h1 className="text-4xl font-bold mb-2 text-foreground">Review Tasks</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Review pending loan appeals from customers
          </p>

          {loading ? (
            <Card className="p-6">
              <p className="text-muted-foreground">Loading appeals...</p>
            </Card>
          ) : appeals.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground">No pending appeals at this time.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {appeals.map((appeal) => (
                <Card key={appeal.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground mb-1">
                          {appeal.loan_applications.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Loan ID: {appeal.loan_id.slice(0, 8)}... | Applied: {new Date(appeal.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">AI Decision</p>
                          <p className={`font-semibold ${appeal.loan_applications.prediction === 'Approved' ? 'text-green-500' : 'text-red-500'}`}>
                            {appeal.loan_applications.prediction}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
                          <p className="font-semibold text-foreground">
                            ${appeal.loan_applications.loan_amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">AI Explanation</p>
                        <p className="text-sm text-foreground bg-secondary/20 p-3 rounded-md">
                          {appeal.loan_applications.explanation}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Reason Codes</p>
                        <pre className="text-xs bg-secondary/20 p-3 rounded-md overflow-auto">
                          {JSON.stringify(appeal.reason_codes, null, 2)}
                        </pre>
                      </div>
                    </div>

                    <Button 
                      className="ml-4"
                      onClick={() => setSelectedAppeal(appeal)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Review Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedAppeal} onOpenChange={() => setSelectedAppeal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Appeal</DialogTitle>
            <DialogDescription>
              Review the loan appeal and provide your decision
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="review-comment">Review Comments</Label>
              <Textarea
                id="review-comment"
                placeholder="Enter your review comments..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Final Decision</Label>
              <RadioGroup value={finalDecision} onValueChange={setFinalDecision}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="approved_after_review" id="approve" />
                  <Label htmlFor="approve" className="cursor-pointer">
                    Approve after Review
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rejected_ai_stands" id="reject" />
                  <Label htmlFor="reject" className="cursor-pointer">
                    Reject – AI Result Stands
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAppeal(null)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewTasks;