import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Instagram, Youtube, Facebook, Link2, ExternalLink, Loader2, Play, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const platformIcon: any = { instagram: Instagram, youtube: Youtube, facebook: Facebook };
const platformColor: any = { instagram: "text-pink-500", youtube: "text-red-500", facebook: "text-blue-500" };

const emptyForm = { title: "", video_url: "", thumbnail: "", platform: "instagram", views: "0", product_id: "", is_active: true };

const AdminReels = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [dialog, setDialog] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fetchingProfile, setFetchingProfile] = useState(false);

  const fetchFromProfile = async () => {
    setFetchingProfile(true);
    try {
      const result = await api.fetchInstagramProfile();
      toast.success(`Fetched ${result.fetched} reels, ${result.added} new added!`);
      load();
    } catch (e: any) {
      toast.error(e.message || 'Configure Instagram credentials in Social Media → API Settings');
    } finally { setFetchingProfile(false); }
  };
  useEffect(() => {
    load();
    api.getProducts().then(setProducts).catch(() => {});
  }, []);

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target?.value ?? e }));

  // Auto-fetch reel info from Instagram URL
  const fetchFromUrl = async () => {
    if (!form.video_url) return;
    setFetching(true);
    try {
      const data = await api.fetchInstagramReel(form.video_url);
      setForm(p => ({ ...p, title: data.title || p.title, thumbnail: data.thumbnail || p.thumbnail, platform: data.platform || p.platform }));
      toast.success("Reel info fetched!");
    } catch { toast.error("Could not fetch reel info — fill manually"); }
    finally { setFetching(false); }
  };

  const openAdd = () => { setForm({ ...emptyForm }); setEditId(null); setDialog(true); };
  const openEdit = (r: any) => {
    setForm({ title: r.title, video_url: r.video_url || "", thumbnail: r.thumbnail || "", platform: r.platform, views: r.views || "0", product_id: r.product_id || "", is_active: !!r.is_active });
    setEditId(r.id); setDialog(true);
  };

  const save = async () => {
    if (!form.title) return toast.error("Title required");
    setSaving(true);
    try {
      const payload = { ...form, product_id: form.product_id || null };
      if (editId) await api.updateReel(editId, payload);
      else await api.createReel(payload);
      toast.success(editId ? "Reel updated!" : "Reel added!");
      setDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this reel?")) return;
    await api.deleteReel(id).catch(() => {});
    toast.success("Deleted"); load();
  };

  const toggleActive = async (r: any) => {
    await api.updateReel(r.id, { ...r, is_active: !r.is_active }).catch(() => {});
    load();
  };

  // Extract YouTube/Instagram shortcode for embed
  const getEmbedUrl = (url: string, platform: string) => {
    if (platform === 'youtube') {
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
      return m ? `https://www.youtube.com/embed/${m[1]}` : null;
    }
    if (platform === 'instagram') {
      const m = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
      return m ? `https://www.instagram.com/p/${m[1]}/embed/` : null;
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reels & Videos</h1>
            <p className="text-sm text-muted-foreground">Manage Instagram/YouTube reels — link to products, show on homepage</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchFromProfile} disabled={fetchingProfile} variant="outline" className="gap-2">
              {fetchingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Fetch from Instagram
            </Button>
            <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Add Reel</Button>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-blue-700">Auto-fetch from Instagram</p>
            <p className="text-blue-600 text-xs mt-0.5">Configure Instagram credentials in <strong>Social Media → API Settings</strong> → then click "Fetch from Instagram" to auto-import latest reels.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Reels", value: reels.length },
            { label: "Active", value: reels.filter(r => r.is_active).length },
            { label: "Linked to Products", value: reels.filter(r => r.product_id).length },
          ].map(s => (
            <div key={s.label} className="border rounded-lg p-3 text-center">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Reels Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {reels.map(r => {
            const Icon = platformIcon[r.platform] || Instagram;
            const embedUrl = getEmbedUrl(r.video_url, r.platform);
            return (
              <div key={r.id} className={`border rounded-xl overflow-hidden bg-card ${!r.is_active ? 'opacity-50' : ''}`}>
                {/* Thumbnail / Embed preview */}
                <div className="relative aspect-[9/16] bg-muted">
                  {r.thumbnail ? (
                    <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                  )}
                  {/* Platform badge */}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full text-[10px] font-medium text-white`}>
                    <Icon className={`h-3 w-3 ${platformColor[r.platform]}`} /> {r.platform}
                  </div>
                  {/* Active toggle */}
                  <div className="absolute top-2 right-2">
                    <Switch checked={!!r.is_active} onCheckedChange={() => toggleActive(r)} className="scale-75" />
                  </div>
                  {/* Views */}
                  {r.views && r.views !== '0' && (
                    <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-full text-[10px] text-white">👁 {r.views}</div>
                  )}
                  {/* Open link */}
                  {r.video_url && (
                    <a href={r.video_url} target="_blank" rel="noreferrer" className="absolute bottom-2 right-2 bg-black/60 p-1 rounded-full">
                      <ExternalLink className="h-3 w-3 text-white" />
                    </a>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <p className="text-xs font-semibold line-clamp-2">{r.title}</p>
                  {/* Linked product */}
                  {r.product_name ? (
                    <div className="flex items-center gap-1">
                      <Link2 className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-primary font-medium truncate">{r.product_name}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">No product linked</span>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => openEdit(r)}>
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="h-7 w-7 p-0" onClick={() => del(r.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {reels.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No reels yet. Add your first reel!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? "Edit Reel" : "Add Reel"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* URL + Auto-fetch */}
            <div>
              <Label className="text-xs">Instagram / YouTube URL</Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.video_url} onChange={f('video_url')} className="text-sm" placeholder="https://www.instagram.com/reel/..." />
                <Button size="sm" variant="outline" onClick={fetchFromUrl} disabled={fetching} className="shrink-0">
                  {fetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Fetch"}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Paste URL → click Fetch to auto-fill title & thumbnail</p>
            </div>

            <div>
              <Label className="text-xs">Title *</Label>
              <Input value={form.title} onChange={f('title')} className="mt-1 text-sm" placeholder="Dell Laptop Unboxing..." />
            </div>

            <div>
              <Label className="text-xs">Thumbnail URL</Label>
              <Input value={form.thumbnail} onChange={f('thumbnail')} className="mt-1 text-sm" placeholder="https://..." />
              {form.thumbnail && <img src={form.thumbnail} alt="" className="mt-2 h-20 w-auto rounded-lg object-cover" />}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Platform</Label>
                <Select value={form.platform} onValueChange={v => setForm(p => ({ ...p, platform: v }))}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Views</Label>
                <Input value={form.views} onChange={f('views')} className="mt-1 text-sm" placeholder="12.5K" />
              </div>
            </div>

            {/* Link to product */}
            <div>
              <Label className="text-xs">Link to Product (optional)</Label>
              <Select value={form.product_id || "__none__"} onValueChange={v => setForm(p => ({ ...p, product_id: v === "__none__" ? "" : v }))}>
                <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select product..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No product</SelectItem>
                  {products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.product_id && (
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] text-green-600">Clicking reel will open product page</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
              <Label className="text-xs">Show on homepage & product pages</Label>
            </div>

            <Button onClick={save} disabled={saving} className="w-full gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editId ? "Update Reel" : "Add Reel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminReels;
