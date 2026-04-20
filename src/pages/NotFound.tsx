import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, Laptop, Wrench, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/CustomerLayout";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <CustomerLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* 404 visual */}
          <div className="relative mb-8">
            <p className="text-[120px] md:text-[160px] font-black text-primary/10 leading-none select-none">404</p>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Laptop className="h-10 w-10 text-primary" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-black mb-3">Page Not Found</h1>
          <p className="text-muted-foreground mb-2">
            The page <code className="bg-muted px-1.5 py-0.5 rounded text-sm">{location.pathname}</code> doesn't exist.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            It may have been moved, deleted, or you may have typed the URL incorrectly.
          </p>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { icon: Laptop, label: "Buy Laptops", to: "/products" },
              { icon: Wrench, label: "Repair", to: "/services" },
              { icon: Search, label: "Track Order", to: "/track-order" },
              { icon: Phone, label: "Contact", to: "/contact" },
            ].map(({ icon: Icon, label, to }) => (
              <Link key={to} to={to}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium">
                <Icon className="h-5 w-5 text-primary" />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Go Back
            </Button>
            <Button asChild className="gap-2">
              <Link to="/"><Home className="h-4 w-4" /> Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default NotFound;
