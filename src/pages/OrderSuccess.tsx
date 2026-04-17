import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const orderNumber = params.get('order');
  const paymentId = params.get('payment_id');

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-14 w-14 text-green-500" />
        </div>
        <h1 className="text-3xl font-serif font-bold mb-2">Order Placed! 🎉</h1>
        <p className="text-muted-foreground mb-6">
          Thank you for shopping with AI Laptop Wala. Your order has been confirmed.
        </p>

        {orderNumber && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-2xl font-bold text-green-700">#{orderNumber}</p>
              {paymentId && <p className="text-xs text-muted-foreground mt-1">Payment ID: {paymentId}</p>}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3 text-sm text-muted-foreground mb-8">
          <p>📧 Order confirmation sent to your email</p>
          <p>🚚 Estimated delivery: 3-7 business days</p>
          <p>💬 Track your order anytime below</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderNumber && (
            <Link to={`/track-order?order=${orderNumber}`}>
              <Button className="gap-2 w-full sm:w-auto"><Package className="h-4 w-4" /> Track Order</Button>
            </Link>
          )}
          <Link to="/products">
            <Button variant="outline" className="gap-2 w-full sm:w-auto"><ArrowRight className="h-4 w-4" /> Continue Shopping</Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="gap-2 w-full sm:w-auto"><Home className="h-4 w-4" /> Home</Button>
          </Link>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default OrderSuccess;
