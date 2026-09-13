import { ShieldCheck } from "lucide-react";

export function BackupBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
      <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
      <p>
        <span className="font-medium text-emerald-50">Your data is backed up daily; export anytime.</span>{" "}
        Hosted Postgres snapshots plus a one-click CSV export. This is not a QMS, ERP, or crib system.
      </p>
    </div>
  );
}
