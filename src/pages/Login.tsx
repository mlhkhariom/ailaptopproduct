import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Leaf, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) { toast.error("Please fill all fields"); return; }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
          </Link>
          <h1 className="text-3xl font-serif font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your AI Laptop Wala account</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Email Address</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-11" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Password</Label>
                  <button type="button" className="text-[10px] text-primary hover:underline">Forgot Password?</button>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 pr-9 h-11" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} type={showPass ? "text" : "password"} />
                  <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-11 w-11" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                {loading ? "Signing in..." : <><LogIn className="h-4 w-4" /> Sign In</>}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">Create Account</Link>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border space-y-2">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => { setEmail("admin@ailaptopwala.com"); setPassword("admin123"); }} className="text-left p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Badge variant="default" className="text-[8px] mb-1">Admin</Badge>
                  <p className="text-[10px] text-muted-foreground">admin@ailaptopwala.com</p>
                </button>
                <button onClick={() => { setEmail("priya@email.com"); setPassword("user123"); }} className="text-left p-2 rounded-lg border hover:bg-muted/50 transition-colors">
                  <Badge variant="secondary" className="text-[8px] mb-1">Customer</Badge>
                  <p className="text-[10px] text-muted-foreground">priya@email.com</p>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          By signing in, you agree to our <Link to="/terms" className="underline">Terms</Link> & <Link to="/privacy" className="underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
