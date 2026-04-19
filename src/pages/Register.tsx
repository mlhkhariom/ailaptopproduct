import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Leaf, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) { toast.error("Please fill all required fields"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { toast.error("Passwords don't match"); return; }
    if (!agreed) { toast.error("Please accept terms & conditions"); return; }
    setLoading(true);
    const result = await register(name.trim(), email.trim(), password, phone.trim() || undefined);
    setLoading(false);
    if (result.success) {
      toast.success("Account created! Welcome to AI Laptop Wala 🌿");
      navigate("/");
    } else {
      toast.error(result.error || "Registration failed");
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
          <h1 className="text-3xl font-serif font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-1">Create your AI Laptop Wala account</p>
        </div>

        <Card className="shadow-xl border-border/50">
          <CardContent className="p-6 space-y-5">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label className="text-xs font-medium">Full Name *</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-11" placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Email Address *</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-11" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium">Phone (Optional)</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9 h-11" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium">Password *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9 h-11" placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} type={showPass ? "text" : "password"} />
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-medium">Confirm *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9 h-11" placeholder="Re-enter" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type={showPass ? "text" : "password"} />
                  </div>
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setShowPass(!showPass)}>
                {showPass ? <><EyeOff className="h-3 w-3 mr-1" /> Hide</> : <><Eye className="h-3 w-3 mr-1" /> Show</>} password
              </Button>
              <div className="flex items-start gap-2">
                <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} className="mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  I agree to the <Link to="/terms" className="text-primary underline">Terms</Link> & <Link to="/privacy" className="text-primary underline">Privacy Policy</Link>
                </p>
              </div>
              <Button type="submit" className="w-full h-11 gap-2" disabled={loading}>
                {loading ? "Creating Account..." : <><UserPlus className="h-4 w-4" /> Create Account</>}
              </Button>
            </form>

            <Separator />
            <p className="text-sm text-muted-foreground text-center">
              Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
