// Social Media Settings Component
import { useState, useEffect } from "react";
import { CheckCircle, Eye, EyeOff, Save, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export const SocialSettings = () => {
  const { user } = useAuth();
  const isSuperAdmin = (user as any)?.role === 'superadmin';
  const [form, setForm] = useState({ meta_app_id: '', meta_app_secret: '', meta_access_token: '', meta_page_id: '', meta_ig_account_id: '' });
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<null | { valid: boolean; name?: string; error?: string }>(null);

  useEffect(() => {
    api.getSocialSettings().then(d => setForm(f => ({ ...f, ...d }))).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await api.saveSocialSettings(form);
      toast.success('Settings saved!');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const verify = async () => {
    setVerifying(true);
    try {
      const r = await api.verifySocialSettings();
      setVerified(r);
      if (r.valid) toast.success(`Connected as: ${r.name}`);
      else toast.error(r.error);
    } catch (e: any) { toast.error(e.message); }
    finally { setVerifying(false); }
  };

  const f = (k: string) => (e: any) => { if (isSuperAdmin) setForm(p => ({ ...p, [k]: e.target.value })); };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Meta API Settings
          {verified && <Badge className={verified.valid ? 'bg-green-500' : 'bg-red-500'}>{verified.valid ? `✓ ${verified.name}` : '✗ Invalid'}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">App ID</Label>
            <Input value={form.meta_app_id} onChange={f('meta_app_id')} className="mt-1 text-sm font-mono" placeholder="1234567890" />
          </div>
          <div>
            <Label className="text-xs">App Secret</Label>
            <div className="relative mt-1">
              <Input type={showSecret ? 'text' : 'password'} value={form.meta_app_secret} onChange={f('meta_app_secret')} className="text-sm font-mono pr-9" placeholder="••••••••" />
              <button onClick={() => setShowSecret(s => !s)} className="absolute right-2.5 top-2.5 text-muted-foreground">{showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
        </div>
        <div>
          <Label className="text-xs">Long-lived Access Token</Label>
          <div className="relative mt-1">
            <Input type={showToken ? 'text' : 'password'} value={form.meta_access_token} onChange={f('meta_access_token')} className="text-sm font-mono pr-9" placeholder="EAAxxxxxxx..." />
            <button onClick={() => setShowToken(s => !s)} className="absolute right-2.5 top-2.5 text-muted-foreground">{showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Facebook Page ID</Label>
            <Input value={form.meta_page_id} onChange={f('meta_page_id')} className="mt-1 text-sm font-mono" placeholder="123456789" />
          </div>
          <div>
            <Label className="text-xs">Instagram Business Account ID</Label>
            <Input value={form.meta_ig_account_id} onChange={f('meta_ig_account_id')} className="mt-1 text-sm font-mono" placeholder="987654321" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          {isSuperAdmin ? (
            <>
              <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Settings'}</Button>
              <Button onClick={verify} disabled={verifying} variant="outline" className="gap-2"><Wifi className="h-4 w-4" />{verifying ? 'Verifying...' : 'Test Connection'}</Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              🔒 Only Super Admin can edit API settings
            </div>
          )}
        </div>
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 space-y-1">
          <p className="font-medium">How to get credentials:</p>
          <p>1. <a href="https://developers.facebook.com" target="_blank" className="text-primary underline">developers.facebook.com</a> → Create App → Business</p>
          <p>2. <a href="https://developers.facebook.com/tools/explorer" target="_blank" className="text-primary underline">Graph API Explorer</a> → Generate Token with: <code>instagram_basic, instagram_content_publish, pages_manage_posts</code></p>
          <p>3. Run: <code>GET /me/accounts</code> → copy page token + page ID</p>
          <p>4. Run: <code>GET /&#123;page-id&#125;?fields=instagram_business_account</code> → copy IG account ID</p>
        </div>
      </CardContent>
    </Card>
  );
};
