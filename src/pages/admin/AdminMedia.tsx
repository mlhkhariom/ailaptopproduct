import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Trash2, Copy, Search, Image, Video, FileText, RefreshCw, FolderOpen, X, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const FOLDERS = ['general', 'products', 'blog', 'banners', 'reels'];
const TYPE_ICON: any = { image: Image, video: Video, document: FileText };

const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const AdminMedia = () => {
  const [media, setMedia] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [editAlt, setEditAlt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const params: any = {};
    if (folder !== 'all') params.folder = folder;
    if (typeFilter !== 'all') params.type = typeFilter;
    try {
      const [m, s] = await Promise.all([api.getMedia(params), api.getMediaStats()]);
      setMedia(m); setStats(s);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [folder, typeFilter]);

  const handleUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;
    setUploading(true); setUploadProgress(0);
    const interval = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 200);
    try {
      const uploaded = await api.uploadMedia(files, folder === 'all' ? 'general' : folder);
      clearInterval(interval); setUploadProgress(100);
      toast.success(`${uploaded.length} file(s) uploaded!`);
      load();
    } catch (e: any) { clearInterval(interval); toast.error(e.message); }
    finally { setUploading(false); setTimeout(() => setUploadProgress(0), 1000); }
  }, [folder]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(`http://localhost:5000${url}`);
    toast.success('URL copied!');
  };

  const remove = async (id: string) => {
    await api.deleteMedia(id); toast.success('Deleted'); load();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.length} files?`)) return;
    await Promise.all(selected.map(id => api.deleteMedia(id)));
    setSelected([]); toast.success('Deleted'); load();
  };

  const saveAlt = async () => {
    if (!preview) return;
    await api.updateMedia(preview.id, { alt: editAlt, folder: preview.folder });
    toast.success('Saved'); setPreview(null); load();
  };

  const toggleSelect = (id: string) => setSelected(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id]);

  const filtered = media.filter(m => m.original_name?.toLowerCase().includes(search.toLowerCase()) || m.alt?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Media Library</h1>
            <p className="text-sm text-muted-foreground">
              {stats ? `${stats.total} files · ${formatSize(stats.totalSize)}` : 'Loading...'}
            </p>
          </div>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button variant="destructive" size="sm" className="h-8 gap-1.5 text-xs" onClick={bulkDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete ({selected.length})
              </Button>
            )}
            <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden"
              onChange={e => e.target.files && handleUpload(e.target.files)} />
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            {(stats.byType || []).map((t: any) => {
              const Icon = TYPE_ICON[t.type] || FileText;
              return (
                <Card key={t.type} className="cursor-pointer hover:border-primary/50" onClick={() => setTypeFilter(typeFilter === t.type ? 'all' : t.type)}>
                  <CardContent className="p-3 flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <div><p className="text-sm font-bold">{t.count}</p><p className="text-[10px] text-muted-foreground capitalize">{t.type}s</p></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Drag & Drop Upload */}
        <div onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/40 hover:bg-muted/20'}`}>
          {uploading ? (
            <div className="space-y-2 max-w-xs mx-auto">
              <RefreshCw className="h-8 w-8 mx-auto text-primary animate-spin" />
              <p className="text-sm font-medium">Uploading...</p>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <div>
              <Upload className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm font-medium">Drag & drop files here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Images, Videos, Documents · Max 50MB each</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search files..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger className="w-32 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Folders</SelectItem>
              {FOLDERS.map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-28 h-9 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
              <SelectItem value="document">Docs</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
        </div>

        {/* Folder tabs */}
        <div className="flex gap-1 flex-wrap">
          {['all', ...FOLDERS].map(f => (
            <button key={f} onClick={() => setFolder(f)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${folder === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}>
              <FolderOpen className="h-3 w-3" /> {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-xl">
            <Image className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>No files found. Upload some!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {filtered.map(m => {
              const isSelected = selected.includes(m.id);
              const fullUrl = `http://localhost:5000${m.url}`;
              return (
                <div key={m.id} className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected ? 'border-primary' : 'border-transparent hover:border-muted-foreground/30'}`}
                  onClick={() => toggleSelect(m.id)}>
                  <div className="aspect-square bg-muted">
                    {m.type === 'image'
                      ? <img src={fullUrl} alt={m.alt || m.original_name} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                      : m.type === 'video'
                        ? <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-blue-500/20"><Video className="h-8 w-8 text-purple-500" /></div>
                        : <div className="w-full h-full flex items-center justify-center bg-muted"><FileText className="h-8 w-8 text-muted-foreground" /></div>
                    }
                  </div>
                  {/* Selected overlay */}
                  {isSelected && <div className="absolute inset-0 bg-primary/20 flex items-center justify-center"><Check className="h-6 w-6 text-primary" /></div>}
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                    <button onClick={e => { e.stopPropagation(); setPreview(m); setEditAlt(m.alt || ''); }} className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center"><Eye className="h-3.5 w-3.5 text-white" /></button>
                    <button onClick={e => { e.stopPropagation(); copyUrl(m.url); }} className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center"><Copy className="h-3.5 w-3.5 text-white" /></button>
                    <button onClick={e => { e.stopPropagation(); remove(m.id); }} className="h-7 w-7 rounded-full bg-red-500/60 hover:bg-red-500 flex items-center justify-center"><Trash2 className="h-3.5 w-3.5 text-white" /></button>
                  </div>
                  {/* File info */}
                  <div className="p-1.5">
                    <p className="text-[10px] truncate text-muted-foreground">{m.original_name}</p>
                    <p className="text-[9px] text-muted-foreground/60">{formatSize(m.size)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="text-sm truncate">{preview?.original_name}</DialogTitle></DialogHeader>
          {preview && (
            <div className="space-y-3">
              {preview.type === 'image' && (
                <img src={`http://localhost:5000${preview.url}`} alt={preview.alt} className="w-full rounded-lg max-h-64 object-contain bg-muted" />
              )}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{preview.type}</p></div>
                <div><p className="text-muted-foreground">Size</p><p className="font-medium">{formatSize(preview.size)}</p></div>
                <div><p className="text-muted-foreground">Folder</p><p className="font-medium capitalize">{preview.folder}</p></div>
                <div><p className="text-muted-foreground">Uploaded</p><p className="font-medium">{new Date(preview.created_at).toLocaleDateString('en-IN')}</p></div>
              </div>
              <div>
                <Label className="text-xs">URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={`http://localhost:5000${preview.url}`} readOnly className="text-xs font-mono" />
                  <Button size="sm" variant="outline" onClick={() => copyUrl(preview.url)}><Copy className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Alt Text</Label>
                <Input value={editAlt} onChange={e => setEditAlt(e.target.value)} className="mt-1 text-sm" placeholder="Describe this image..." />
              </div>
              <div className="flex gap-2">
                <Button onClick={saveAlt} size="sm" className="flex-1">Save</Button>
                <Button variant="destructive" size="sm" onClick={() => { remove(preview.id); setPreview(null); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminMedia;
