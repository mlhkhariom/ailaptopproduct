import { useState } from "react";
import { Camera, Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  jobId: string;
  photosBefore: string[];
  photosAfter: string[];
  onUpdate: () => void;
}

const uploadPhoto = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('files', file);
  formData.append('folder', 'job-cards');
  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    body: formData,
  }).then(r => r.json());
  return res.files?.[0]?.url || res.url || '';
};

const savePhotos = async (jobId: string, before: string[], after: string[]) => {
  await fetch(`/api/erp/job-cards/${jobId}/photos`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    body: JSON.stringify({ photos_before: before, photos_after: after }),
  });
};

export default function JobCardPhotos({ jobId, photosBefore, photosAfter, onUpdate }: Props) {
  const [before, setBefore] = useState<string[]>(photosBefore || []);
  const [after, setAfter] = useState<string[]>(photosAfter || []);
  const [uploading, setUploading] = useState<'before' | 'after' | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(type);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadPhoto(file);
        if (url) urls.push(url);
      }
      const nb = type === 'before' ? [...before, ...urls] : before;
      const na = type === 'after' ? [...after, ...urls] : after;
      setBefore(nb); setAfter(na);
      await savePhotos(jobId, nb, na);
      toast.success('Photos saved!'); onUpdate();
    } catch { toast.error('Upload failed'); }
    setUploading(null);
    e.target.value = '';
  };

  const remove = async (type: 'before' | 'after', idx: number) => {
    const nb = type === 'before' ? before.filter((_, i) => i !== idx) : before;
    const na = type === 'after' ? after.filter((_, i) => i !== idx) : after;
    setBefore(nb); setAfter(na);
    await savePhotos(jobId, nb, na);
    onUpdate();
  };

  const Grid = ({ photos, type }: { photos: string[]; type: 'before' | 'after' }) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {type === 'before' ? 'Before Repair' : 'After Repair'}
        </p>
        <label className="cursor-pointer">
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e, type)} />
          <span className="inline-flex items-center gap-1 text-xs border rounded-lg px-2 py-1 hover:bg-muted cursor-pointer">
            {uploading === type ? <Upload className="h-3 w-3 animate-pulse" /> : <Camera className="h-3 w-3" />} Add
          </span>
        </label>
      </div>
      {photos.length === 0 ? (
        <label className="cursor-pointer block">
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e, type)} />
          <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
            <Image className="h-6 w-6 mx-auto mb-1 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Click to upload {type} photos</p>
          </div>
        </label>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((url, i) => (
            <div key={i} className="relative group aspect-square">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg border" />
              <button onClick={() => remove(type, i)}
                className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <label className="cursor-pointer aspect-square border-2 border-dashed rounded-lg flex items-center justify-center hover:border-primary/50 transition-colors">
            <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e, type)} />
            <Camera className="h-5 w-5 text-muted-foreground/40" />
          </label>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <Grid photos={before} type="before" />
      <Grid photos={after} type="after" />
    </div>
  );
}
