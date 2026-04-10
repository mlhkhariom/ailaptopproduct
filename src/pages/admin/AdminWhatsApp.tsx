import { useState } from "react";
import { MessageCircle, Plus, Edit, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { whatsappTemplates, products } from "@/data/mockData";

const AdminWhatsApp = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(whatsappTemplates[0]);
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  const getPreview = () => {
    let msg = selectedTemplate.message;
    selectedTemplate.variables.forEach((v) => {
      msg = msg.replace(`{{${v}}}`, previewValues[v] || `[${v}]`);
    });
    return msg;
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-serif font-bold">WhatsApp Integration</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Template</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Template</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Template Name</Label><Input className="mt-1" placeholder="e.g. Product Inquiry" /></div>
              <div><Label>Message</Label><Textarea className="mt-1" rows={4} placeholder="Use {{variable}} for dynamic content..." /></div>
              <p className="text-xs text-muted-foreground">Variables: {"{{product_name}}"}, {"{{order_id}}"}, {"{{customer_name}}"}</p>
              <Button className="w-full">Save Template</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-semibold">Message Templates</h2>
          {whatsappTemplates.map((t) => (
            <Card
              key={t.id}
              className={`cursor-pointer transition-all ${selectedTemplate.id === t.id ? "ring-2 ring-primary" : "hover:shadow-md"}`}
              onClick={() => { setSelectedTemplate(t); setPreviewValues({}); }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm">{t.name}</h3>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                <div className="flex gap-1 mt-2">
                  {t.variables.map((v) => (
                    <Badge key={v} variant="secondary" className="text-xs">{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h2 className="font-semibold">Preview & Send</h2>
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Eye className="h-5 w-5" /> {selectedTemplate.name}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate.variables.map((v) => (
                <div key={v}>
                  <Label className="text-sm capitalize">{v.replace(/_/g, " ")}</Label>
                  {v === "product_name" ? (
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      value={previewValues[v] || ""}
                      onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })}
                    >
                      <option value="">Select product</option>
                      {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  ) : (
                    <Input className="mt-1" placeholder={`Enter ${v.replace(/_/g, " ")}`} value={previewValues[v] || ""} onChange={(e) => setPreviewValues({ ...previewValues, [v]: e.target.value })} />
                  )}
                </div>
              ))}

              <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 border border-green-200 dark:border-green-900">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400">WhatsApp Preview</span>
                </div>
                <p className="text-sm leading-relaxed">{getPreview()}</p>
              </div>

              <Button className="w-full gap-2 bg-green-600 hover:bg-green-700"><Send className="h-4 w-4" /> Send via WhatsApp</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminWhatsApp;
