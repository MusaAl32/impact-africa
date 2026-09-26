import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, RefreshCcw, Trash2, TrendingUp } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteInvestment, INVESTMENT_KINDS, listInvestments, projectValue, saveInvestment, type Investment,
} from "@/lib/investments.functions";

export const Route = createFileRoute("/_authenticated/app/investments")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Investment tracker — Nuru AI" },
      { name: "description", content: "Track your own investments and see estimated value and gains over time." },
      { property: "og:title", content: "Investment tracker — Nuru AI" },
      { property: "og:description", content: "Record investments and see estimated growth." },
    ],
  }),
  component: InvestmentsPage,
});

const KIND_LABEL: Record<Investment["kind"], string> = {
  savings: "Savings", bonds: "Bonds", shares: "Shares", business: "Business", property: "Property",
  agriculture: "Agriculture", crypto: "Crypto", other: "Other",
};

type FormState = { id?: string; name: string; kind: Investment["kind"]; amount: string; currency: string; start_date: string; expected_annual_return: string; status: Investment["status"]; notes: string };
const today = () => new Date().toISOString().slice(0, 10);
const EMPTY: FormState = { name: "", kind: "savings", amount: "", currency: "USD", start_date: today(), expected_annual_return: "8", status: "active", notes: "" };

function money(n: number, currency: string) {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(n); }
  catch { return `${currency} ${n.toFixed(2)}`; }
}

function InvestmentsPage() {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["investments"], queryFn: () => listInvestments() });
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<Investment | null>(null);

  const save = useMutation({
    mutationFn: (f: FormState) => saveInvestment({ data: {
      ...(f.id ? { id: f.id } : {}), name: f.name, kind: f.kind, amount: Number(f.amount), currency: f.currency,
      start_date: f.start_date, expected_annual_return: Number(f.expected_annual_return), status: f.status, notes: f.notes,
    } }),
    onSuccess: (_, f) => { toast.success(f.id ? "Investment updated" : "Investment added"); setForm(null); void qc.invalidateQueries({ queryKey: ["investments"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save this investment."),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteInvestment({ data: { id } }),
    onSuccess: () => { toast.success("Investment deleted"); setConfirmDelete(null); void qc.invalidateQueries({ queryKey: ["investments"] }); },
    onError: () => toast.error("Could not delete this investment."),
  });

  function validate(f: FormState) {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e["name"] = "Give it a name.";
    const amt = Number(f.amount);
    if (!f.amount || !Number.isFinite(amt) || amt <= 0) e["amount"] = "Enter an amount above 0.";
    else if (amt > 1_000_000_000) e["amount"] = "That amount is too large.";
    if (!/^[A-Za-z]{3}$/.test(f.currency)) e["currency"] = "Use a 3-letter code, e.g. USD, MWK, KES.";
    const r = Number(f.expected_annual_return);
    if (f.expected_annual_return === "" || !Number.isFinite(r) || r < -100 || r > 1000) e["expected_annual_return"] = "Enter a yearly return between -100 and 1000.";
    if (!f.start_date) e["start_date"] = "Pick a start date.";
    return e;
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!form) return;
    const e = validate(form); setErrors(e);
    if (Object.keys(e).length === 0) save.mutate(form);
  }

  const items = query.data ?? [];
  const totals = items.filter((i) => i.status === "active").reduce<Record<string, { invested: number; value: number }>>((acc, i) => {
    const p = projectValue(i); const t = acc[i.currency] ?? { invested: 0, value: 0 };
    t.invested += i.amount; t.value += p.value; acc[i.currency] = t; return acc;
  }, {});

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight"><TrendingUp className="size-5 text-primary" /> Investment tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record your investments and see their estimated value today. No money moves here.</p>
        </div>
        <Button onClick={() => { setErrors({}); setForm({ ...EMPTY, start_date: today() }); }}><Plus className="mr-1 size-4" /> Add investment</Button>
      </div>

      {query.isLoading && <div className="mt-6 space-y-3"><Skeleton className="h-24 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></div>}

      {query.isError && (
        <div role="alert" className="mt-6 rounded-2xl border border-destructive/40 p-5 text-sm">
          <p className="font-medium">We couldn't load your investments.</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}><RefreshCcw className="mr-1 size-4" /> Try again</Button>
        </div>
      )}

      {query.isSuccess && items.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center">
          <TrendingUp className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 font-medium">No investments yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Add your first one to see how it could grow. Want ideas? <Link to="/app" className="underline">Ask Nuru</Link>.</p>
        </div>
      )}

      {query.isSuccess && items.length > 0 && (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Object.entries(totals).map(([cur, t]) => (
              <div key={cur} className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs text-muted-foreground">Active · {cur}</p>
                <p className="mt-1 text-lg font-semibold">{money(t.value, cur)}</p>
                <p className="text-sm text-muted-foreground">Invested {money(t.invested, cur)} · <span className={t.value - t.invested >= 0 ? "text-emerald-600" : "text-destructive"}>{t.value - t.invested >= 0 ? "+" : ""}{money(t.value - t.invested, cur)}</span></p>
              </div>
            ))}
          </div>
          <ul className="mt-4 space-y-3">
            {items.map((i) => {
              const p = projectValue(i);
              return (
                <li key={i.id} className="rounded-2xl border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{KIND_LABEL[i.kind]} · since {i.start_date} · {i.expected_annual_return}%/yr</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${i.status === "active" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{i.status === "active" ? "Active" : "Closed"}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                    <p className="text-sm">{money(i.amount, i.currency)} → <strong>{money(p.value, i.currency)}</strong> <span className={p.gain >= 0 ? "text-emerald-600" : "text-destructive"}>({p.gain >= 0 ? "+" : ""}{money(p.gain, i.currency)})</span></p>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" aria-label={`Edit ${i.name}`} onClick={() => { setErrors({}); setForm({ id: i.id, name: i.name, kind: i.kind, amount: String(i.amount), currency: i.currency, start_date: i.start_date, expected_annual_return: String(i.expected_annual_return), status: i.status, notes: i.notes }); }}><Pencil className="size-4" /></Button>
                      <Button size="sm" variant="ghost" aria-label={`Delete ${i.name}`} onClick={() => setConfirmDelete(i)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                  {i.notes && <p className="mt-2 text-xs text-muted-foreground">{i.notes}</p>}
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">Values are estimates from the yearly return you entered, not real market prices. This is not financial advice.</p>
        </>
      )}

      <Dialog open={form !== null} onOpenChange={(o) => { if (!o && !save.isPending) setForm(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form?.id ? "Edit investment" : "Add investment"}</DialogTitle>
            <DialogDescription>Only you can see this.</DialogDescription>
          </DialogHeader>
          {form && (
            <form onSubmit={onSubmit} className="space-y-3" noValidate>
              <Field label="Name" id="inv-name" error={errors["name"]}><Input id="inv-name" value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Treasury bond 2027" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type" id="inv-kind"><Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as Investment["kind"] })}><SelectTrigger id="inv-kind"><SelectValue /></SelectTrigger><SelectContent>{INVESTMENT_KINDS.map((k) => <SelectItem key={k} value={k}>{KIND_LABEL[k]}</SelectItem>)}</SelectContent></Select></Field>
                <Field label="Status" id="inv-status"><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Investment["status"] })}><SelectTrigger id="inv-status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><Field label="Amount" id="inv-amount" error={errors["amount"]}><Input id="inv-amount" inputMode="decimal" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field></div>
                <Field label="Currency" id="inv-cur" error={errors["currency"]}><Input id="inv-cur" maxLength={3} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start date" id="inv-date" error={errors["start_date"]}><Input id="inv-date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
                <Field label="Expected return %/yr" id="inv-ret" error={errors["expected_annual_return"]}><Input id="inv-ret" type="number" step="0.1" value={form.expected_annual_return} onChange={(e) => setForm({ ...form, expected_annual_return: e.target.value })} /></Field>
              </div>
              <Field label="Notes (optional)" id="inv-notes"><Textarea id="inv-notes" maxLength={1000} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
              <DialogFooter>
                <Button type="button" variant="outline" disabled={save.isPending} onClick={() => setForm(null)}>Cancel</Button>
                <Button type="submit" disabled={save.isPending}>{save.isPending && <Loader2 className="mr-1 size-4 animate-spin" />} Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete !== null} onOpenChange={(o) => { if (!o && !remove.isPending) setConfirmDelete(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete this investment?</DialogTitle><DialogDescription>"{confirmDelete?.name}" will be removed permanently.</DialogDescription></DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={remove.isPending} onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => confirmDelete && remove.mutate(confirmDelete.id)}>{remove.isPending && <Loader2 className="mr-1 size-4 animate-spin" />} Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
