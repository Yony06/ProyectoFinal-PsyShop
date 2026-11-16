<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderReady extends Mailable
{
    use SerializesModels;

    public function __construct(public Order $order)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "¡Tu pedido #{$this->order->id} de PsyShop está listo!",
        );
    }

    public function content(): Content
    {
        // Ruta: resources/views/emails/pedidos/order-ready.blade.php
        return new Content(
            view: 'emails.pedidos.order-ready',
        );
    }
}
