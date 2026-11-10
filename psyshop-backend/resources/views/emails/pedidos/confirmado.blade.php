<x-mail::message>
# ¡Tu pedido ha sido confirmado!

Hola {{ $pedido->user->name ?? 'Cliente' }},

Hemos confirmado tu compra en **PsyShop** y ya estamos preparando tus videojuegos.

**Resumen de tu compra:**
* **N° de Orden:** {{ $pedido->id }}
* **Fecha:** {{ $pedido->created_at->format('d/m/Y') }}
* **Total pagado:** ${{ number_format($pedido->total, 2) }}

<x-mail::table>
| Videojuego | Cantidad | Subtotal |
|:-----------|:--------:|:--------:|
@foreach($pedido->items as $item)
@php
    $nombre = $item->game->title ?? 'Juego no encontrado';
    $cantidad = $item->quantity ?? $item->cantidad ?? 1;
    $precioUnitario = $item->price ?? $item->precio ?? $item->game->price ?? 0;
    $subtotal = $cantidad * $precioUnitario;
@endphp
| {{ $nombre }} | {{ $cantidad }} | ${{ number_format($subtotal, 2) }} |
@endforeach
</x-mail::table>

<x-mail::button :url="'http://localhost:5173/mis-pedidos'">
Ver estado del pedido
</x-mail::button>

Gracias por preferirnos,<br>
{{ config('app.name') }}
</x-mail::message>