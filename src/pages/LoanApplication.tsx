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
  loanType: z.string().min(1, "Please select loan type"),
  // Home Loan fields
  annualIncome: z.number().optional(),
  loanAmount: z.number().optional(),
  loanTerm: z.number().optional(),
  cibilScore: z.number().optional(),
  propertyValue: z.number().optional(),
  downPayment: z.number().optional(),
  monthlyExpenses: z.number().optional(),
  // Other loan type fields (kept for future use)
  name: z.string().optional(),
  age: z.number().optional(),
  gender: z.string().optional(),
  employmentStatus: z.string().optional(),
  existingLoans: z.number().optional(),
  savingsBalance: z.number().optional(),
}).refine((data) => {
  if (data.loanType === "home-loan") {
    return (
      data.annualIncome !== undefined &&
      data.loanAmount !== undefined &&
      data.loanTerm !== undefined &&
      data.cibilScore !== undefined &&
      data.propertyValue !== undefined &&
      data.downPayment !== undefined &&
      data.monthlyExpenses !== undefined
    );
  }
  return true;
}, {
  message: "Please fill in all required fields",
  path: ["loanType"],
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
    watch,
    formState: { errors },
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
  });

  const selectedLoanType = watch("loanType");

  const onSubmit = async (data: LoanFormData) => {
    setIsSubmitting(true);
    
    try {
      // Map fields based on loan type
      let mappedData;
      
      if (data.loanType === "home-loan") {
        mappedData = {
          name: "Home Loan Applicant", // Default name
          income: data.annualIncome,
          loanAmount: data.loanAmount,
          loanTerm: data.loanTerm,
          creditScore: data.cibilScore,
          residentialAssetsValue: data.propertyValue,
          commercialAssetsValue: 0,
          luxuryAssetsValue: 0,
          savingsBalance: data.downPayment,
          loanType: data.loanType,
          age: 30, // Default values for unused fields
          gender: "prefer-not-to-say",
          employmentStatus: "full-time",
          existingLoans: 0,
        };
      } else {
        // For other loan types, pass data as-is (for future implementation)
        mappedData = data;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-loan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mappedData),
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
          dataUsed: mappedData,
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
              <Label htmlFor="loanType">Loan Type</Label>
              <Select onValueChange={(value) => setValue("loanType", value)}>
                <SelectTrigger className={errors.loanType ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent className="bg-background z-50">
                  <SelectItem value="home-loan">Home Loan</SelectItem>
                  <SelectItem value="personal-loan">Personal Loan</SelectItem>
                  <SelectItem value="business-loan">Business Loan</SelectItem>
                  <SelectItem value="educational-loan">Educational Loan</SelectItem>
                </SelectContent>
              </Select>
              {errors.loanType && (
                <p className="text-sm text-destructive">{errors.loanType.message}</p>
              )}
            </div>

            {selectedLoanType === "home-loan" && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income ($)</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      {...register("annualIncome", { valueAsNumber: true })}
                      placeholder="75000"
                      className={errors.annualIncome ? "border-destructive" : ""}
                    />
                    {errors.annualIncome && (
                      <p className="text-sm text-destructive">{errors.annualIncome.message}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanAmount">Loan Amount ($)</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        {...register("loanAmount", { valueAsNumber: true })}
                        placeholder="250000"
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
                        placeholder="360"
                        className={errors.loanTerm ? "border-destructive" : ""}
                      />
                      {errors.loanTerm && (
                        <p className="text-sm text-destructive">{errors.loanTerm.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cibilScore">CIBIL Score</Label>
                    <Input
                      id="cibilScore"
                      type="number"
                      {...register("cibilScore", { valueAsNumber: true })}
                      placeholder="750"
                      className={errors.cibilScore ? "border-destructive" : ""}
                    />
                    {errors.cibilScore && (
                      <p className="text-sm text-destructive">{errors.cibilScore.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Property Details</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="propertyValue">Property Value ($)</Label>
                      <Input
                        id="propertyValue"
                        type="number"
                        {...register("propertyValue", { valueAsNumber: true })}
                        placeholder="300000"
                        className={errors.propertyValue ? "border-destructive" : ""}
                      />
                      {errors.propertyValue && (
                        <p className="text-sm text-destructive">{errors.propertyValue.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="downPayment">Down Payment ($)</Label>
                      <Input
                        id="downPayment"
                        type="number"
                        {...register("downPayment", { valueAsNumber: true })}
                        placeholder="50000"
                        className={errors.downPayment ? "border-destructive" : ""}
                      />
                      {errors.downPayment && (
                        <p className="text-sm text-destructive">{errors.downPayment.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyExpenses">Monthly Expenses ($)</Label>
                    <Input
                      id="monthlyExpenses"
                      type="number"
                      {...register("monthlyExpenses", { valueAsNumber: true })}
                      placeholder="2000"
                      className={errors.monthlyExpenses ? "border-destructive" : ""}
                    />
                    {errors.monthlyExpenses && (
                      <p className="text-sm text-destructive">{errors.monthlyExpenses.message}</p>
                    )}
                  </div>
                </div>
              </>
            )}

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
