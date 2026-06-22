"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Save, Building2, Globe, DollarSign, Fuel } from "lucide-react";
import { toast } from "sonner";
import { settingsService, type CompanySettings } from "@/services/settings-service";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { pageVariants } from "@/lib/animations";

type FormState = Partial<CompanySettings>;

const TIMEZONES = ["UTC", "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Kolkata", "Asia/Kathmandu", "Asia/Tokyo", "Australia/Sydney"];
const CURRENCIES = ["USD", "EUR", "GBP", "INR", "NPR", "AUD", "CAD", "JPY", "SGD"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-2 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["settings"], queryFn: settingsService.get });
  const [form, setForm] = useState<FormState>({});

  useEffect(() => { if (data) setForm(data); }, [data]);

  const updateMutation = useMutation({
    mutationFn: (d: FormState) => settingsService.update(d),
    onSuccess: () => { toast.success("Settings saved"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: () => toast.error("Could not save settings"),
  });

  const set = (key: keyof CompanySettings) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  const input = (key: keyof CompanySettings, type = "text") => (
    <input type={type} value={(form[key] as string | number) ?? ""} onChange={set(key)}
      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
  );

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner /></div>;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        description="Company profile, currency, tax rates, and system preferences"
        action={
          <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90 disabled:opacity-60 transition-all">
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        }
      />

      <Section icon={Building2} title="Company Details">
        <Field label="Company Name">{input("name")}</Field>
        <Field label="Email">{input("email", "email")}</Field>
        <Field label="Phone">{input("phone", "tel")}</Field>
        <Field label="Tax ID / VAT Number">{input("tax_id")}</Field>
        <Field label="Website">{input("website", "url")}</Field>
        <Field label="Country">{input("country")}</Field>
        <Field label="City">{input("city")}</Field>
        <Field label="State / Province">{input("state")}</Field>
        <Field label="Postal Code">{input("postal_code")}</Field>
        <div className="sm:col-span-2">
          <Field label="Street Address">
            <textarea value={form.address ?? ""} onChange={set("address")} rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
          </Field>
        </div>
      </Section>

      <Section icon={Globe} title="Locale & Timezone">
        <Field label="Currency">
          <select value={form.currency ?? "USD"} onChange={set("currency")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Timezone">
          <select value={form.timezone ?? "UTC"} onChange={set("timezone")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
            {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </Field>
      </Section>

      <Section icon={DollarSign} title="Tax & Pricing">
        <Field label="Default Tax Rate (%)">
          <input type="number" min="0" max="100" step="0.1" value={form.tax_rate ?? 0} onChange={set("tax_rate")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
        <Field label="Fuel Price Markup (%)">
          <input type="number" min="0" max="100" step="0.1" value={form.fuel_price_markup ?? 0} onChange={set("fuel_price_markup")}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </Field>
      </Section>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-border mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted"><Fuel className="h-4 w-4 text-muted-foreground" /></div>
          <h2 className="font-semibold text-foreground">Account Info</h2>
        </div>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          {[["Slug", form.slug], ["Created", form.created_at?.slice(0, 10)], ["Updated", form.updated_at?.slice(0, 10)]].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-xs text-muted-foreground mb-0.5">{k}</dt>
              <dd className="font-mono text-foreground">{v ?? "—"}</dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  );
}
