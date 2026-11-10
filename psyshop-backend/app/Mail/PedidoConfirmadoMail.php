<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Queue\SerializesModels;

class PedidoConfirmadoMail extends Mailable
{
    use Queueable, SerializesModels;

    public $pedido; // Variable pública obligatoria

    public function __construct($pedido)
    {
        $this->pedido = $pedido;
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.pedidos.confirmado',
        );
    }
}
