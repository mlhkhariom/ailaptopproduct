import { useState, useEffect, useRef, useCallback } from "react";
import { Instagram, Facebook, Youtube, Play, Upload, Send, Clock, Trash2, Edit, Plus, RefreshCw, ExternalLink, BarChart3, Heart, MessageCircle, Share2, CheckCircle, XCircle, Image, Video, X, Settings, Eye, Hash, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { SocialSettings } from "@/components/SocialSettings";
import { api } from "@/lib/api";
import { useProductStore } from "@/store/productStore";

const PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/10", grad: "from-pink-500 to-purple-600", border: "border-pink-400" },
  { id: "facebook", label: "Facebook", Icon: Facebook, color: "text-blue-600", bg: "bg-blue-600/10", grad: "from-blue-500 to-blue-700", border: "border-blue-400" },
];

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-400" },
  publishing: { label: "Publishing...", color: "bg-yellow-500" },
  published: { label: "Published", color: "bg-green-500" },
  failed: { label: "Failed", color: "bg-red-500" },
  scheduled: { label: "Scheduled", color: "bg-blue-500" },
};

const SUGGESTED_HASHTAGS = ["#ayurveda", "#naturalhealth", "#herbalremedies", "#apsoncure", "#ayurvedicmedicine", "#holistichealth", "#organiclife", "#wellness", "#healthylifestyle", "#naturalremedies"];

const defaultForm = { title: "", caption: "", hashtags: "#ayurveda #apsoncure", thumbnail: "", video_path: "", platform: "instagram", product_id: "__none__", scheduled_at: "" };

const AdminSocial = () => {
  const { products, fetchProducts } = useProductStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...defaultForm });
  const [publishTo, setPublishTo] = useState({ instagram: true, facebook: false });
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"instagram" | "facebook">("instagram");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); loadPosts(); loadStats(); }, []);

  const loadPosts = () => api.getSocialPosts().then(setPosts).catch(() => {});
  const loadStats = () => api.getSocialStats().then(setStats).catch(() => {});

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('video/')) return toast.error('Only video files allowed');
    setUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 10, 90)), 300);
    try {
      const data = await api.uploadVideo(file);
      clearInterval(interval);
      setUploadProgress(100);
      setForm(f => ({ ...f, video_path: data.path, thumbnail: '' }));
      toast.success('Video uploaded!');
    } catch (e: any) {
      clearInterval(interval);
      toast.error(e.message);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const openAdd = () => { setEditing(null); setForm({ ...defaultForm }); setPublishTo({ instagram: true, facebook: false }); setDialog(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ title: p.title || '', caption: p.caption || '', hashtags: p.hashtags || '', thumbnail: p.thumbnail || '', video_path: p.video_path || '', platform: p.platform, product_id: p.product_id || '__none__', scheduled_at: p.scheduled_at || '' }); setDialog(true); };

  const saveDraft = async () => {
    const payload = { ...form, product_id: form.product_id === '__none__' ? null : form.product_id };
    try {
      if (editing) { await api.updateSocialPost(editing.id, payload); toast.success('Updated!'); }
      else { await api.createSocialPost(payload); toast.success('Draft saved!'); }
      setDialog(false); loadPosts();
    } catch (e: any) { toast.error(e.message); }
  };

  const publish = async (postId: string, both = false) => {
    setPublishing(postId);
    try {
      if (both) {
        const r = await api.publishBoth(postId);
        if (r.errors?.length) toast.error(r.errors.join(', '));
        else toast.success('Published to Instagram + Facebook!');
      } else {
        await api.publishPost(postId);
        toast.success('Published!');
      }
      loadPosts(); loadStats();
    } catch (e: any) { toast.error(e.message); }
    finally { setPublishing(null); }
  };

  const saveAndPublish = async () => {
    const payload = { ...form, platform: publishTo.instagram ? 'instagram' : 'facebook', product_id: form.product_id === '__none__' ? null : form.product_id };
    try {
      let postId = editing?.id;
      if (editing) await api.updateSocialPost(editing.id, payload);
      else { const r = await api.createSocialPost(payload); postId = r.id; }
      setDialog(false);
      if (publishTo.instagram && publishTo.facebook) await publish(postId, true);
      else await publish(postId, false);
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await api.deleteSocialPost(id); toast.success('Deleted'); loadPosts();
  };

  const addHashtag = (tag: string) => setForm(f => ({ ...f, hashtags: f.hashtags + ' ' + tag }));

  const filtered = posts.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterPlatform !== 'all' && p.platform !== filterPlatform) return false;
    return true;
  });

  const linkedProduct = products.find(p => p.id === form.product_id);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">Social Media Manager</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Create, schedule & publish to Instagram and Facebook</p>
          </div>
          <Button onClick={openAdd} className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:opacity-90 text-white border-0 shadow-lg">
            <Plus className="h-4 w-4" /> Create Post
          </Button>
        </div>

        <Tabs defaultValue="posts">
          <TabsList className="h-9">
            <TabsTrigger value="posts" className="text-xs gap-1.5"><Send className="h-3.5 w-3.5" /> Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs gap-1.5"><Settings className="h-3.5 w-3.5" /> API Settings</TabsTrigger>
          </TabsList>

          {/* ── POSTS TAB ── */}
          <TabsContent value="posts" className="space-y-4 mt-4">
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(STATUS_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map(p => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs ml-auto" onClick={() => { loadPosts(); loadStats(); }}>
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>

            {/* Posts Grid */}
            {filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-xl">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No posts yet</p>
                <p className="text-sm mt-1 mb-4">Create your first post to get started</p>
                <Button onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" /> Create Post</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(post => {
                  const plat = PLATFORMS.find(p => p.id === post.platform) || PLATFORMS[0];
                  const st = STATUS_MAP[post.status] || STATUS_MAP.draft;
                  const isPublishing = publishing === post.id;
                  return (
                    <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all group">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted">
                        {post.thumbnail
                          ? <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                          : post.video_path
                            ? <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-muted/50"><Video className="h-10 w-10 text-muted-foreground/40" /><span className="text-xs text-muted-foreground">Video ready</span></div>
                            : <div className="w-full h-full flex items-center justify-center"><Image className="h-10 w-10 text-muted-foreground/30" /></div>
                        }
                        <div className={`absolute top-2 left-2 h-6 w-6 rounded-full ${plat.bg} flex items-center justify-center`}>
                          <plat.Icon className={`h-3.5 w-3.5 ${plat.color}`} />
                        </div>
                        <Badge className={`absolute top-2 right-2 text-[9px] text-white ${st.color}`}>{st.label}</Badge>
                        {post.video_path && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><div className="h-12 w-12 rounded-full bg-black/50 flex items-center justify-center"><Play className="h-6 w-6 text-white fill-white ml-0.5" /></div></div>}
                      </div>

                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-semibold line-clamp-1">{post.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{post.caption}</p>
                        {post.error_msg && <p className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{post.error_msg}</p>}

                        <div className="flex items-center gap-1 pt-1 flex-wrap">
                          {post.status !== 'published' && (
                            <>
                              <Button size="sm" className="h-7 text-xs gap-1 flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0"
                                disabled={isPublishing} onClick={() => publish(post.id)}>
                                {isPublishing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Instagram className="h-3 w-3" />}
                                {isPublishing ? 'Publishing...' : 'Instagram'}
                              </Button>
                              <Button size="sm" className="h-7 text-xs gap-1 flex-1 bg-blue-600 hover:bg-blue-700 text-white border-0"
                                disabled={isPublishing} onClick={async () => {
                                  // publish to facebook — update platform first
                                  await api.updateSocialPost(post.id, { ...post, platform: 'facebook' });
                                  await publish(post.id);
                                  await api.updateSocialPost(post.id, { ...post, platform: post.platform });
                                }}>
                                <Facebook className="h-3 w-3" /> Facebook
                              </Button>
                            </>
                          )}
                          {post.status === 'published' && post.meta_post_id && (
                            <Badge className="bg-green-500/10 text-green-600 text-[10px]"><CheckCircle className="h-3 w-3 mr-1" />Live</Badge>
                          )}
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(post)}><Edit className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(post.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── ANALYTICS TAB ── */}
          <TabsContent value="analytics" className="mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Instagram */}
              <Card className="border-pink-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Instagram className="h-5 w-5 text-pink-500" /> Instagram</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.instagram ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div><p className="text-2xl font-bold">{stats.instagram.followers_count?.toLocaleString()}</p><p className="text-xs text-muted-foreground">Followers</p></div>
                      <div><p className="text-2xl font-bold">{stats.instagram.media_count}</p><p className="text-xs text-muted-foreground">Posts</p></div>
                      <div><p className="text-2xl font-bold">{posts.filter(p => p.platform === 'instagram' && p.status === 'published').length}</p><p className="text-xs text-muted-foreground">Published</p></div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Configure API settings to see live stats</p>
                      <Button variant="outline" size="sm" className="mt-2" onClick={loadStats}>Load Stats</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Facebook */}
              <Card className="border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><Facebook className="h-5 w-5 text-blue-600" /> Facebook</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.facebook ? (
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div><p className="text-2xl font-bold">{stats.facebook.fan_count?.toLocaleString()}</p><p className="text-xs text-muted-foreground">Page Likes</p></div>
                      <div><p className="text-2xl font-bold">{posts.filter(p => p.platform === 'facebook' && p.status === 'published').length}</p><p className="text-xs text-muted-foreground">Published</p></div>
                      <div><p className="text-2xl font-bold">{posts.filter(p => p.status === 'failed').length}</p><p className="text-xs text-muted-foreground text-red-500">Failed</p></div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <p className="text-sm">Configure API settings to see live stats</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── SETTINGS TAB ── */}
          <TabsContent value="settings" className="mt-4">
            <SocialSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── CREATE/EDIT DIALOG ── */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              {editing ? <><Edit className="h-4 w-4" /> Edit Post</> : <><Plus className="h-4 w-4" /> Create New Post</>}
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-0 divide-x">
            {/* Left — Editor */}
            <div className="p-6 space-y-4">

              {/* Platform */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Publish To</Label>
                <div className="flex gap-2">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setPublishTo(prev => ({ ...prev, [p.id]: !prev[p.id as keyof typeof prev] }))}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all text-sm font-medium ${publishTo[p.id as keyof typeof publishTo] ? `${p.border} ${p.bg} ${p.color}` : 'border-border text-muted-foreground'}`}>
                      <p.Icon className="h-4 w-4" /> {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Upload */}
              <div>
                <Label className="text-xs font-semibold mb-2 block">Video / Reel</Label>
                <div
                  onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}>
                  <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  {uploading ? (
                    <div className="space-y-2">
                      <RefreshCw className="h-8 w-8 mx-auto text-primary animate-spin" />
                      <p className="text-sm font-medium">Uploading...</p>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  ) : form.video_path ? (
                    <div className="space-y-1">
                      <CheckCircle className="h-8 w-8 mx-auto text-green-500" />
                      <p className="text-sm font-medium text-green-600">Video ready: {form.video_path}</p>
                      <button onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, video_path: '' })); }} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="text-sm font-medium">Drag & drop video here</p>
                      <p className="text-xs text-muted-foreground">MP4, MOV, AVI • Max 200MB</p>
                      <Button variant="outline" size="sm" className="mt-1">Browse Files</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail URL */}
              <div>
                <Label className="text-xs font-semibold">Thumbnail URL (optional)</Label>
                <Input value={form.thumbnail} onChange={f('thumbnail')} className="mt-1.5 text-sm" placeholder="https://..." />
              </div>

              {/* Title */}
              <div>
                <Label className="text-xs font-semibold">Title</Label>
                <Input value={form.title} onChange={f('title')} className="mt-1.5 text-sm" placeholder="Post title..." />
              </div>

              {/* Caption */}
              <div>
                <Label className="text-xs font-semibold">Caption</Label>
                <Textarea value={form.caption} onChange={f('caption')} className="mt-1.5 text-sm resize-none" rows={3} placeholder="Write your caption..." />
                <p className="text-[10px] text-muted-foreground mt-1">{form.caption.length}/2200</p>
              </div>

              {/* Hashtags */}
              <div>
                <Label className="text-xs font-semibold">Hashtags</Label>
                <Textarea value={form.hashtags} onChange={f('hashtags')} className="mt-1.5 text-sm resize-none font-mono" rows={2} />
                <div className="flex flex-wrap gap-1 mt-2">
                  {SUGGESTED_HASHTAGS.map(tag => (
                    <button key={tag} onClick={() => addHashtag(tag)} className="text-[10px] px-2 py-0.5 rounded-full border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Link Product */}
              <div>
                <Label className="text-xs font-semibold">Link to Product</Label>
                <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                  <SelectTrigger className="mt-1.5 text-sm"><SelectValue placeholder="Select product (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— No product —</SelectItem>
                    {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — ₹{p.price}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule */}
              <div>
                <Label className="text-xs font-semibold">Schedule (optional)</Label>
                <Input type="datetime-local" value={form.scheduled_at} onChange={f('scheduled_at')} className="mt-1.5 text-sm" />
              </div>
            </div>

            {/* Right — Preview */}
            <div className="p-6 space-y-4 bg-muted/20">
              <div>
                <Label className="text-xs font-semibold mb-2 block">Live Preview</Label>
                <div className="flex gap-1 mb-3">
                  {PLATFORMS.map(p => (
                    <button key={p.id} onClick={() => setPreviewMode(p.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${previewMode === p.id ? `${p.bg} ${p.color}` : 'text-muted-foreground hover:bg-muted'}`}>
                      <p.Icon className="h-3.5 w-3.5" /> {p.label}
                    </button>
                  ))}
                </div>

                {previewMode === 'instagram' ? (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 max-w-[260px] mx-auto shadow-xl">
                    <div className="flex items-center gap-2 p-2.5 border-b">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                      <div className="flex-1"><p className="text-xs font-semibold">apsoncure_phc</p><p className="text-[9px] text-muted-foreground">Sponsored</p></div>
                    </div>
                    <div className="aspect-square bg-muted relative">
                      {form.thumbnail ? <img src={form.thumbnail} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        : <div className="w-full h-full flex items-center justify-center"><Image className="h-10 w-10 text-muted-foreground/20" /></div>}
                      {form.video_path && <div className="absolute inset-0 flex items-center justify-center"><div className="h-12 w-12 rounded-full bg-black/40 flex items-center justify-center"><Play className="h-6 w-6 text-white fill-white ml-0.5" /></div></div>}
                    </div>
                    <div className="p-2.5 space-y-1.5">
                      <div className="flex gap-3 text-muted-foreground"><Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><Share2 className="h-5 w-5" /></div>
                      <p className="text-[10px]"><span className="font-semibold">apsoncure_phc</span> {form.caption || 'Caption...'}</p>
                      <p className="text-[9px] text-primary/70">{form.hashtags}</p>
                      {linkedProduct && <div className="flex items-center gap-2 p-1.5 rounded-lg bg-muted border mt-1"><img src={linkedProduct.image} className="h-7 w-7 rounded object-cover" /><div><p className="text-[9px] font-medium">{linkedProduct.name}</p><p className="text-[9px] text-primary">₹{linkedProduct.price}</p></div></div>}
                    </div>
                  </div>
                ) : (
                  <div className="border rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 max-w-[260px] mx-auto shadow-xl">
                    <div className="flex items-center gap-2 p-2.5 border-b">
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">A</div>
                      <div><p className="text-xs font-semibold">Apsoncure PHC</p><p className="text-[9px] text-muted-foreground">Just now · 🌐</p></div>
                    </div>
                    <p className="text-[10px] px-2.5 py-2">{form.caption || 'Caption...'}</p>
                    <div className="aspect-video bg-muted relative">
                      {form.thumbnail ? <img src={form.thumbnail} alt="" className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                        : <div className="w-full h-full flex items-center justify-center"><Image className="h-8 w-8 text-muted-foreground/20" /></div>}
                      {form.video_path && <div className="absolute inset-0 flex items-center justify-center"><div className="h-10 w-10 rounded-full bg-black/40 flex items-center justify-center"><Play className="h-5 w-5 text-white fill-white ml-0.5" /></div></div>}
                    </div>
                    <div className="p-2 border-t flex justify-around text-[10px] text-muted-foreground">
                      <button className="flex items-center gap-1 hover:text-blue-600"><Heart className="h-3.5 w-3.5" /> Like</button>
                      <button className="flex items-center gap-1 hover:text-blue-600"><MessageCircle className="h-3.5 w-3.5" /> Comment</button>
                      <button className="flex items-center gap-1 hover:text-blue-600"><Share2 className="h-3.5 w-3.5" /> Share</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 gap-2 border-t mt-0">
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button variant="secondary" onClick={saveDraft} className="gap-2"><Clock className="h-4 w-4" /> Save Draft</Button>
            <Button onClick={saveAndPublish} className="gap-2 bg-gradient-to-r from-pink-500 to-blue-600 text-white border-0">
              <Send className="h-4 w-4" />
              Publish {publishTo.instagram && publishTo.facebook ? 'to Both' : publishTo.instagram ? 'to Instagram' : 'to Facebook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSocial;
