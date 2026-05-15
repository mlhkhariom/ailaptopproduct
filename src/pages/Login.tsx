import SEOHead from "@/components/common/SEOHead";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn, Leaf, Mail, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
      <SEOHead title="Login — AI Laptop Wala" canonical="/login" noindex={true} />

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

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or continue with</span></div>
            </div>

            <Button variant="outline" className="w-full gap-2" type="button" onClick={async () => {
              try {
                const decodeJwt = (token: string) => JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
                const gRes = await new Promise<any>((resolve, reject) => {
                  // @ts-ignore
                  if (!window.google?.accounts) { toast.error('Google login not available'); reject('no google'); return; }
                  // @ts-ignore
                  window.google.accounts.id.initialize({
                    client_id: (window as any).__GOOGLE_CLIENT_ID || '',
                    callback: (response: any) => resolve(response),
                  });
                  // @ts-ignore
                  window.google.accounts.id.prompt((n: any) => { if (n.isNotDisplayed() || n.isSkippedMoment()) reject('dismissed'); });
                });
                const decoded: any = decodeJwt(gRes.credential);
                const res = await fetch('/api/auth/google', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: decoded.email, name: decoded.name, picture: decoded.picture, sub: decoded.sub }) }).then(r => r.json());
                if (res.token) { login(res.token, res.user); toast.success('Welcome!'); navigate('/'); }
                else toast.error(res.error || 'Login failed');
              } catch { toast.error('Google login cancelled'); }
            }}>
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </Button>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary font-medium hover:underline">Create Account</Link>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-primary/5 border text-center">
              <p className="text-xs text-muted-foreground">
                💻 <strong>AI Laptop Wala</strong> — Indore's trusted laptop store since 2011
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">Silver Mall, RNT Marg | +91 98934 96163</p>
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
