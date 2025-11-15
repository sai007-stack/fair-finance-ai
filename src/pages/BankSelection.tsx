import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Landmark } from "lucide-react";

const BankSelection = () => {
  const navigate = useNavigate();
  const [bankType, setBankType] = useState<"government" | "private" | null>(null);

  const handleBankTypeSelection = (type: "government" | "private") => {
    setBankType(type);
  };

  const handleBankSelection = (bank: string) => {
    // Store selected bank in localStorage or state management
    localStorage.setItem("selectedBank", bank);
    navigate("/apply");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Select Your Bank</CardTitle>
          <CardDescription>Choose your preferred banking partner</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!bankType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary"
                onClick={() => handleBankTypeSelection("government")}
              >
                <Landmark className="w-12 h-12 text-primary" />
                <div>
                  <div className="font-semibold text-lg">Government Bank</div>
                  <div className="text-sm text-muted-foreground">Public Sector Banks</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary"
                onClick={() => handleBankTypeSelection("private")}
              >
                <Building2 className="w-12 h-12 text-primary" />
                <div>
                  <div className="font-semibold text-lg">Private Bank</div>
                  <div className="text-sm text-muted-foreground">Private Sector Banks</div>
                </div>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {bankType === "government" ? "Government Banks" : "Private Banks"}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBankType(null)}
                >
                  ← Back
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bankType === "government" ? (
                  <>
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary"
                      onClick={() => handleBankSelection("SBI")}
                    >
                      <Landmark className="w-8 h-8 text-primary" />
                      <span className="font-semibold">State Bank of India</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary"
                      onClick={() => handleBankSelection("Grameena Bank")}
                    >
                      <Landmark className="w-8 h-8 text-primary" />
                      <span className="font-semibold">Grameena Bank</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary"
                      onClick={() => handleBankSelection("Canara Bank")}
                    >
                      <Building2 className="w-8 h-8 text-primary" />
                      <span className="font-semibold">Canara Bank</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary"
                      onClick={() => handleBankSelection("HDFC Bank")}
                    >
                      <Building2 className="w-8 h-8 text-primary" />
                      <span className="font-semibold">HDFC Bank</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankSelection;
