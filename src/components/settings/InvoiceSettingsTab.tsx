import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  s: (key: string) => string;
  setS: (key: string, value: string) => void;
  saving: boolean;
  saveAppSettings: (cat: string) => void;
}

export default function InvoiceSettingsTab({ s, setS, saving, saveAppSettings }: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Invoice Branding</CardTitle>
          <CardDescription className="text-xs">Appears on all generated invoices (PDF + WhatsApp)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="text-xs">Company Name</Label><Input className="mt-1 h-9" value={s('inv_company_name')} onChange={e => setS('inv_company_name', e.target.value)} placeholder="AI Laptop Wala" /></div>
          <div><Label className="text-xs">Tagline</Label><Input className="mt-1 h-9" value={s('inv_tagline')} onChange={e => setS('inv_tagline', e.target.value)} placeholder="Buy, Sell & Repair Laptops" /></div>
          <div><Label className="text-xs">Address</Label><Input className="mt-1 h-9" value={s('inv_address')} onChange={e => setS('inv_address', e.target.value)} placeholder="Silver Mall, LB-21, RNT Marg, Indore" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={s('inv_phone')} onChange={e => setS('inv_phone', e.target.value)} placeholder="+91 98934 96163" /></div>
            <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={s('inv_email')} onChange={e => setS('inv_email', e.target.value)} placeholder="info@ailaptopwala.com" /></div>
          </div>
          <div><Label className="text-xs">Logo URL</Label><Input className="mt-1 h-9" value={s('inv_logo')} onChange={e => setS('inv_logo', e.target.value)} placeholder="https://ailaptopwala.com/assets/logo.jpeg" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">GSTIN</Label><Input className="mt-1 h-9 font-mono" value={s('inv_gstin')} onChange={e => setS('inv_gstin', e.target.value)} placeholder="23ATNPA4415H1Z2" /></div>
            <div><Label className="text-xs">PAN</Label><Input className="mt-1 h-9 font-mono" value={s('inv_pan')} onChange={e => setS('inv_pan', e.target.value)} placeholder="ATNPA4415H" /></div>
          </div>
          <div><Label className="text-xs">Invoice Prefix</Label><Input className="mt-1 h-9" value={s('inv_prefix')} onChange={e => setS('inv_prefix', e.target.value)} placeholder="ALW-INV-" /></div>
          <div><Label className="text-xs">Footer Note</Label><Input className="mt-1 h-9" value={s('inv_footer')} onChange={e => setS('inv_footer', e.target.value)} placeholder="Thank you for your business!" /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Bank Account Details</CardTitle>
          <CardDescription className="text-xs">Printed on invoices for bank transfer payments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="text-xs">Account Holder Name</Label><Input className="mt-1 h-9" value={s('bank_holder_name')} onChange={e => setS('bank_holder_name', e.target.value)} placeholder="AI Laptop Wala / Asati Infotech" /></div>
          <div><Label className="text-xs">Account Number</Label><Input className="mt-1 h-9 font-mono" value={s('bank_account_number')} onChange={e => setS('bank_account_number', e.target.value)} placeholder="1234567890123456" /></div>
          <div><Label className="text-xs">IFSC Code</Label><Input className="mt-1 h-9 font-mono" value={s('bank_ifsc')} onChange={e => setS('bank_ifsc', e.target.value)} placeholder="SBIN0001234" /></div>
          <div><Label className="text-xs">Bank Name</Label><Input className="mt-1 h-9" value={s('bank_name')} onChange={e => setS('bank_name', e.target.value)} placeholder="State Bank of India" /></div>
          <div><Label className="text-xs">Branch</Label><Input className="mt-1 h-9" value={s('bank_branch')} onChange={e => setS('bank_branch', e.target.value)} placeholder="Vijay Nagar, Indore" /></div>
          <div><Label className="text-xs">UPI ID (for QR on invoice)</Label><Input className="mt-1 h-9 font-mono" value={s('bank_upi')} onChange={e => setS('bank_upi', e.target.value)} placeholder="ailaptopwala@ybl" /></div>
          <div className="flex items-center gap-2 pt-2 border-t">
            <Switch checked={s('inv_show_bank') === 'true'} onCheckedChange={v => setS('inv_show_bank', String(v))} />
            <Label className="text-xs">Show bank details on invoice</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={s('inv_show_upi_qr') === 'true'} onCheckedChange={v => setS('inv_show_upi_qr', String(v))} />
            <Label className="text-xs">Show UPI QR code on invoice</Label>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tax & Format Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Tax Type</Label>
              <Select value={s('inv_tax_type') || 'gst'} onValueChange={v => setS('inv_tax_type', v)}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gst">GST (CGST + SGST)</SelectItem>
                  <SelectItem value="igst">IGST (Interstate)</SelectItem>
                  <SelectItem value="none">No Tax</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">Tax Rate (%)</Label><Input className="mt-1 h-9" type="number" value={s('inv_tax_rate') || '18'} onChange={e => setS('inv_tax_rate', e.target.value)} /></div>
            <div>
              <Label className="text-xs">Invoice Format</Label>
              <Select value={s('inv_format') || 'detailed'} onValueChange={v => setS('inv_format', v)}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="detailed">Detailed (with tax breakup)</SelectItem>
                  <SelectItem value="simple">Simple (total only)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Switch checked={s('inv_auto_number') !== 'false'} onCheckedChange={v => setS('inv_auto_number', String(v))} />
              <Label className="text-xs">Auto-generate invoice numbers</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={s('inv_include_warranty') === 'true'} onCheckedChange={v => setS('inv_include_warranty', String(v))} />
              <Label className="text-xs">Include warranty terms on invoice</Label>
            </div>
          </div>
          <div><Label className="text-xs">Warranty Text</Label><Input className="mt-1 h-9" value={s('inv_warranty_text')} onChange={e => setS('inv_warranty_text', e.target.value)} placeholder="90-day warranty on all repairs. 6-month warranty on refurbished laptops." /></div>
          <div><Label className="text-xs">Terms & Conditions</Label><Input className="mt-1 h-9" value={s('inv_terms')} onChange={e => setS('inv_terms', e.target.value)} placeholder="Goods once sold will not be returned without valid reason..." /></div>
          <Button className="gap-1.5 w-full mt-2" disabled={saving} onClick={() => saveAppSettings('Invoice')}><Save className="h-4 w-4" /> Save Invoice Settings</Button>
        </CardContent>
      </Card>
    </div>
  );
}
