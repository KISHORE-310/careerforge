import { AlertCircle, RefreshCw } from "lucide-react";

export function LoadingPanel({ label = "Loading…" }) {
  return <div className="rounded-2xl border border-stone-800 bg-[#111] p-10 text-center text-xs text-stone-400"><RefreshCw className="mx-auto mb-3 animate-spin text-[#d4af37]" size={18} />{label}</div>;
}

export function ErrorPanel({ message = "Unable to load this data.", onRetry }) {
  return <div role="alert" className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 text-center text-xs text-rose-200"><AlertCircle className="mx-auto mb-3" size={18} /><p>{message}</p>{onRetry && <button onClick={onRetry} className="mt-3 text-[#f5d77f] underline">Retry</button>}</div>;
}

export function EmptyPanel({ title, description, action }) {
  return <div className="rounded-2xl border border-dashed border-stone-800 bg-[#111] p-10 text-center"><p className="text-sm font-medium text-stone-200">{title}</p><p className="mx-auto mt-2 max-w-md text-xs text-stone-400">{description}</p>{action}</div>;
}
