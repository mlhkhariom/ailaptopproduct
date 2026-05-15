import { Building2, Award, User, Hash, Calendar, Briefcase, MapPin, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const details = [
  { icon: Award, label: "Brand Name", value: "AI Laptop Wala" },
  { icon: Building2, label: "Legal Name", value: "Asati Infotech" },
  { icon: User, label: "Founder", value: "Bhagwan Das Asati" },
  { icon: Briefcase, label: "CEO & Manager", value: "Nitin Asati" },
  { icon: Hash, label: "GST Number", value: "23ATNPA4415H1Z2" },
  { icon: Calendar, label: "Established", value: "2011" },
  { icon: MapPin, label: "Main Branch", value: "Silver Mall, RNT Marg, Indore" },
  { icon: Phone, label: "Contact", value: "+91 98934 96163" },
];

const BusinessDetails = () => (
  <section className="py-12 bg-muted/30">
    <div className="container mx-auto px-4 max-w-3xl">
      <h2 className="text-2xl font-bold text-center mb-2">Business Details</h2>
      <p className="text-muted-foreground text-center text-sm mb-8">Asati Infotech — Registered Business</p>
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {details.map((d) => (
              <div key={d.label} className="text-center p-3 rounded-xl hover:bg-primary/5 transition-colors">
                <d.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{d.label}</p>
                <p className="text-xs font-semibold">{d.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
);

export default BusinessDetails;
