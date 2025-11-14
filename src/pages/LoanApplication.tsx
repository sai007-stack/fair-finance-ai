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
  age: z.number().min(18, "You must be at least 18 years old").max(100, "Please enter a valid age"),
  gender: z.string().min(1, "Please select gender"),
  income: z.number().min(0, "Income must be positive"),
  creditScore: z.number().min(300, "Credit score must be at least 300").max(850, "Credit score cannot exceed 850"),
  loanAmount: z.number().min(1000, "Loan amount must be at least $1,000"),
  loanTerm: z.number().min(1, "Loan term must be at least 1 month").max(360, "Loan term cannot exceed 360 months"),
  loanPurpose: z.string().min(1, "Please select loan purpose"),
  employmentStatus: z.string().min(1, "Please select employment status"),
  existingLoans: z.number().min(0, "Existing loans cannot be negative"),
  savingsBalance: z.number().min(0, "Savings balance cannot be negative"),
  residentialAssetsValue: z.number().min(0, "Residential assets value cannot be negative"),
  commercialAssetsValue: z.number().min(0, "Commercial assets value cannot be negative"),
  luxuryAssetsValue: z.number().min(0, "Luxury assets value cannot be negative"),
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
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-loan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process application');
      }

      const result = await response.json();

      // Navigate to results page with data
      navigate('/result', { 
        state: {
          ...result,
          dataUsed: data,
          loanId: result.applicationId,
        }
      });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process your application. Please try again.",
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
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  {...register("age", { valueAsNumber: true })}
                  placeholder="30"
                  className={errors.age ? "border-destructive" : ""}
                />
                {errors.age && (
                  <p className="text-sm text-destructive">{errors.age.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => setValue("gender", value)}>
                  <SelectTrigger className={errors.gender ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non-binary">Non-binary</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && (
                  <p className="text-sm text-destructive">{errors.gender.message}</p>
                )}
              </div>
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

            <div className="grid md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="loanPurpose">Loan Purpose</Label>
                <Select onValueChange={(value) => setValue("loanPurpose", value)}>
                  <SelectTrigger className={errors.loanPurpose ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select loan purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home-purchase">Home Purchase</SelectItem>
                    <SelectItem value="home-improvement">Home Improvement</SelectItem>
                    <SelectItem value="debt-consolidation">Debt Consolidation</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="vehicle">Vehicle</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.loanPurpose && (
                  <p className="text-sm text-destructive">{errors.loanPurpose.message}</p>
                )}
              </div>
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

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Asset Values</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residentialAssetsValue">Residential Assets Value ($)</Label>
                  <Input
                    id="residentialAssetsValue"
                    type="number"
                    {...register("residentialAssetsValue", { valueAsNumber: true })}
                    placeholder="150000"
                    className={errors.residentialAssetsValue ? "border-destructive" : ""}
                  />
                  {errors.residentialAssetsValue && (
                    <p className="text-sm text-destructive">{errors.residentialAssetsValue.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commercialAssetsValue">Commercial Assets Value ($)</Label>
                  <Input
                    id="commercialAssetsValue"
                    type="number"
                    {...register("commercialAssetsValue", { valueAsNumber: true })}
                    placeholder="50000"
                    className={errors.commercialAssetsValue ? "border-destructive" : ""}
                  />
                  {errors.commercialAssetsValue && (
                    <p className="text-sm text-destructive">{errors.commercialAssetsValue.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="luxuryAssetsValue">Luxury Assets Value ($)</Label>
                <Input
                  id="luxuryAssetsValue"
                  type="number"
                  {...register("luxuryAssetsValue", { valueAsNumber: true })}
                  placeholder="25000"
                  className={errors.luxuryAssetsValue ? "border-destructive" : ""}
                />
                {errors.luxuryAssetsValue && (
                  <p className="text-sm text-destructive">{errors.luxuryAssetsValue.message}</p>
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
