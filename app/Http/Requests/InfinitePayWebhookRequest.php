<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InfinitePayWebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'invoice_slug' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'integer', 'min:1'],
            'paid_amount' => ['nullable', 'integer', 'min:1'],
            'installments' => ['nullable', 'integer', 'min:1'],
            'capture_method' => ['nullable', 'string', 'max:100'],
            'transaction_nsu' => ['required', 'string', 'max:255'],
            'order_nsu' => ['required', 'string', 'max:255'],
            'receipt_url' => ['nullable', 'url', 'max:2048'],
            'items' => ['nullable', 'array'],
        ];
    }
}
