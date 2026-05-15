import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

export default function EMICalculator() {
  const [amount, setAmount] = useState(20000);
  const [tenure, setTenure] = useState(6);

  const rates = [
    { months: 3, rate: 0, label: "No Cost EMI" },
    { months: 6, rate: 0, label: "No Cost EMI" },
    { months: 9, rate: 12, label: "12% p.a." },
    { months: 12, rate: 14, label: "14% p.a." },
    { months: 18, rate: 16, label: "16% p.a." },
    { months: 24, rate: 18, label: "18% p.a." },
  ];

  const calcEMI = (p: number, r: number, n: number) => {
    if (r === 0) return Math.round(p / n);
    const monthlyRate = r / 12 / 100;
    return Math.round((p * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1));
  };

  return (
    <CustomerLayout>
      <SEOHead title="EMI Calculator | AI Laptop Wala" description="Calculate EMI for laptops. No Cost EMI available on 3 & 6 months. Bajaj Finance EMI in Indore." canonical="/emi-calculator" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">💳 EMI <span className="gradient-text">Calculator</span></h1>
          <p className="text-muted-foreground text-sm">No Cost EMI on 3 & 6 months • Bajaj Finance available</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Calculator className="h-5 w-5" /> Calculate Your EMI</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Laptop Price (₹)</Label>
                <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="mt-1" />
              </div>
              <div>
                <Label>Tenure (months)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {rates.map(r => (
                    <Button key={r.months} size="sm" variant={tenure === r.months ? "default" : "outline"}
                      onClick={() => setTenure(r.months)}>
                      {r.months}M
                    </Button>
                  ))}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border-2 border-primary/20 text-center">
                <p className="text-sm text-muted-foreground">Monthly EMI</p>
                <p className="text-3xl font-black text-primary">₹{calcEMI(amount, rates.find(r => r.months === tenure)?.rate || 0, tenure).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1">{rates.find(r => r.months === tenure)?.label} × {tenure} months</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">All EMI Options for ₹{amount.toLocaleString('en-IN')}</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rates.map(r => (
                    <div key={r.months} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <span className="font-medium text-sm">{r.months} months</span>
                        <span className="text-xs text-muted-foreground ml-2">{r.label}</span>
                      </div>
                      <span className="font-bold">₹{calcEMI(amount, r.rate, r.months).toLocaleString('en-IN')}/mo</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-bold text-sm mb-2">EMI Available On:</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✅ Bajaj Finance (Indore, 60km radius, age 25+)</li>
                  <li>✅ Credit Cards (Visa, MasterCard, RuPay)</li>
                  <li>✅ Debit Cards (select banks)</li>
                  <li>✅ Cardless EMI (ZestMoney, FlexiPay)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-3">📞 Call +91 98934 96163 for EMI assistance</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
