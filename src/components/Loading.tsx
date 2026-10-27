import { LoaderCircle } from 'lucide-react';
export function InlineLoading({ label = 'Loading…' }: { label?: string }) { return <span className="inline-loading"><LoaderCircle className="spin" size={15} />{label}</span>; }
