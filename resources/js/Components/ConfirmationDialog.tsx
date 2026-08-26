import { ReactNode } from 'react';

type Props = {
    confirmLabel: string;
    description: ReactNode;
    destructive?: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    open: boolean;
    processing?: boolean;
    title: string;
};

export default function ConfirmationDialog({ confirmLabel, description, destructive = true, onCancel, onConfirm, open, processing = false, title }: Props) {
    if (!open) {
        return null;
    }

    return (
        <div aria-modal="true" className="fixed inset-0 z-50 grid place-items-center bg-ink/55 p-4" role="dialog" aria-labelledby="confirmation-dialog-title">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h2 id="confirmation-dialog-title" className="text-xl font-black text-ink">{title}</h2>
                <div className="mt-3 text-sm leading-6 text-ink/65">{description}</div>
                <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button type="button" className="rounded-lg border border-ink/15 px-4 py-2.5 text-sm font-bold text-ink hover:bg-sand disabled:opacity-50" disabled={processing} onClick={onCancel}>Cancelar</button>
                    <button type="button" className={`rounded-lg px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 ${destructive ? 'bg-rose-700 hover:bg-rose-800' : 'asex-gradient'}`} disabled={processing} onClick={onConfirm}>{processing ? 'Salvando…' : confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
