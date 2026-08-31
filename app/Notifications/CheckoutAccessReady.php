<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class CheckoutAccessReady extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(public Order $order) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Seu acesso à ASEX Educação está pronto')
            ->greeting('Olá, '.$notifiable->name.'!')
            ->line('Seu pagamento foi confirmado e seu acesso à ASEX Educação está pronto.')
            ->action('Criar minha senha', URL::temporarySignedRoute(
                'checkout.access.create',
                $this->order->activation_expires_at,
                ['order' => $this->order],
            ))
            ->line('Este link é pessoal, pode ser usado uma única vez e expira em breve.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
        ];
    }
}
