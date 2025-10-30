import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loanSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  income: z.number().min(0, "Income must be positive"),
  creditScore: z.number().min(300, "Credit score must be at least 300").max(850, "Credit score cannot exceed 850"),
  loanAmount: z.number().min(1000, "Loan amount must be at least $1,000"),
  loanTerm: z.number().min(1, "Loan term must be at least 1 month").max(360, "Loan term cannot exceed 360 months"),
  employmentStatus: z.string().min(1, "Please select employment status"),
  existingLoans: z.number().min(0, "Existing loans cannot be negative"),
  savingsBalance: z.number().min(0, "Savings balance cannot be negative"),
});

type LoanFormData = z.infer<typeof loanSchema>;

const LoanApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    
    try {
      // TODO: This will call the Hugging Face API via edge function
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - will be replaced with actual API
      const mockResult = {
        prediction: Math.random() > 0.5 ? "Approved" : "Rejected",
        confidence: Math.random() * 30 + 70, // 70-100%
        fairnessScore: Math.random() * 20 + 80, // 80-100%
        explanation: "Based on strong credit history and stable income",
        dataUsed: data,
      };

      // Navigate to results page with data
      navigate('/result', { state: mockResult });
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your application. Please try again.",
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
        <Card className="max-w-2xl mx-auto p-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Loan Application</h1>
          <p className="text-muted-foreground mb-8">
            Fill out the form below for an instant AI-powered decision
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="John Doe"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="income">Annual Income ($)</Label>
                <Input
                  id="income"
                  type="number"
                  {...register("income", { valueAsNumber: true })}
                  placeholder="50000"
                  className={errors.income ? "border-destructive" : ""}
                />
                {errors.income && (
                  <p className="text-sm text-destructive">{errors.income.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score</Label>
                <Input
                  id="creditScore"
                  type="number"
                  {...register("creditScore", { valueAsNumber: true })}
                  placeholder="720"
                  className={errors.creditScore ? "border-destructive" : ""}
                />
                {errors.creditScore && (
                  <p className="text-sm text-destructive">{errors.creditScore.message}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  {...register("loanAmount", { valueAsNumber: true })}
                  placeholder="25000"
                  className={errors.loanAmount ? "border-destructive" : ""}
                />
                {errors.loanAmount && (
                  <p className="text-sm text-destructive">{errors.loanAmount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="loanTerm">Loan Term (months)</Label>
                <Input
                  id="loanTerm"
                  type="number"
                  {...register("loanTerm", { valueAsNumber: true })}
                  placeholder="60"
                  className={errors.loanTerm ? "border-destructive" : ""}
                />
                {errors.loanTerm && (
                  <p className="text-sm text-destructive">{errors.loanTerm.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentStatus">Employment Status</Label>
              <Select onValueChange={(value) => setValue("employmentStatus", value)}>
                <SelectTrigger className={errors.employmentStatus ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select employment status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="self-employed">Self-employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentStatus && (
                <p className="text-sm text-destructive">{errors.employmentStatus.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="existingLoans">Existing Loans ($)</Label>
                <Input
                  id="existingLoans"
                  type="number"
                  {...register("existingLoans", { valueAsNumber: true })}
                  placeholder="5000"
                  className={errors.existingLoans ? "border-destructive" : ""}
                />
                {errors.existingLoans && (
                  <p className="text-sm text-destructive">{errors.existingLoans.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="savingsBalance">Savings Balance ($)</Label>
                <Input
                  id="savingsBalance"
                  type="number"
                  {...register("savingsBalance", { valueAsNumber: true })}
                  placeholder="10000"
                  className={errors.savingsBalance ? "border-destructive" : ""}
                />
                {errors.savingsBalance && (
                  <p className="text-sm text-destructive">{errors.savingsBalance.message}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing your request...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default LoanApplication;
