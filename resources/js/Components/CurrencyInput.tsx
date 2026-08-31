import { ChangeEvent } from 'react';

type CurrencyInputProps = {
    id: string;
    value: number;
    onChange: (value: number) => void;
    required?: boolean;
    describedBy?: string;
};

export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export default function CurrencyInput({ id, value, onChange, required = false, describedBy }: CurrencyInputProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const digits = event.target.value.replace(/\D/g, '');

        onChange(digits === '' ? 0 : Number(digits));
    };

    return <input aria-describedby={describedBy} id={id} inputMode="numeric" onChange={handleChange} required={required} value={formatCurrency(value)} />;
}
