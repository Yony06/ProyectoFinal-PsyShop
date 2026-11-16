<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pedido #{{ $order->id }} - PsyShop</title>
</head>
<body style="margin:0; padding:0; background-color:#05060f; font-family:Arial, Helvetica, sans-serif; color:#e8ecff;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#05060f; padding:24px 12px;">
    <tr>
        <td align="center">

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; background-color:#0c1024; border:1px solid #232b55;">

                {{-- Franja de color --}}
                <tr>
                    <td style="height:4px; background:linear-gradient(90deg,#19e3ff,#7a5cff,#ff3d8b); font-size:0; line-height:0;">&nbsp;</td>
                </tr>

                {{-- Logo --}}
                <tr>
                    <td style="padding:28px 28px 8px 28px; font-size:26px; font-weight:bold; color:#e8ecff;">
                        Psy<span style="color:#19e3ff;">Shop</span>
                    </td>
                </tr>

                {{-- Mensaje principal --}}
                <tr>
                    <td style="padding:8px 28px 0 28px;">
                        <h1 style="margin:0 0 12px 0; font-size:24px; line-height:1.2; color:#e8ecff;">
                            ¡Gracias por tu compra, {{ $order->customer_name }}!
                        </h1>
                        <p style="margin:0; font-size:15px; line-height:1.6; color:#aab3d6;">
                            Recibimos tu pedido <strong style="color:#19e3ff;">#{{ $order->id }}</strong>.
                            Te avisaremos por este mismo correo cuando tu pedido esté listo.
                        </p>
                    </td>
                </tr>

                {{-- Productos --}}
                <tr>
                    <td style="padding:24px 28px 0 28px;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="padding-bottom:8px; border-bottom:1px solid #232b55; font-size:12px; color:#8c95b8;">Producto</td>
                                <td align="right" style="padding-bottom:8px; border-bottom:1px solid #232b55; font-size:12px; color:#8c95b8;">Subtotal</td>
                            </tr>

                            @foreach ($order->items as $item)
                                <tr>
                                    <td style="padding:12px 0; border-bottom:1px solid #232b55; font-size:15px; color:#e8ecff;">
                                        {{ $item->game->title ?? 'Videojuego' }}
                                        <span style="color:#8c95b8;"> × {{ $item->quantity }}</span>
                                    </td>
                                    <td align="right" style="padding:12px 0; border-bottom:1px solid #232b55; font-size:15px; color:#e8ecff;">
                                        ${{ number_format($item->subtotal, 2) }}
                                    </td>
                                </tr>
                            @endforeach

                            <tr>
                                <td style="padding-top:16px; font-size:16px; font-weight:bold; color:#e8ecff;">Total</td>
                                <td align="right" style="padding-top:16px; font-size:22px; font-weight:bold; color:#19e3ff;">
                                    ${{ number_format($order->total, 2) }}
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>

                {{-- Entrega --}}
                <tr>
                    <td style="padding:24px 28px 0 28px;">
                        <p style="margin:0 0 4px 0; font-size:12px; color:#8c95b8;">Dirección de entrega</p>
                        <p style="margin:0; font-size:15px; line-height:1.5; color:#e8ecff;">{{ $order->delivery_address }}</p>
                    </td>
                </tr>

                {{-- Despedida --}}
                <tr>
                    <td style="padding:28px 28px 28px 28px;">
                        <p style="margin:0; font-size:13px; line-height:1.6; color:#8c95b8;">
                            Si tienes alguna duda sobre tu pedido, responde a este correo.
                            Que disfrutes tu próxima aventura.
                        </p>
                    </td>
                </tr>

            </table>

            <p style="margin:16px 0 0 0; font-size:12px; color:#5d6690;">© {{ date('Y') }} PsyShop</p>

        </td>
    </tr>
</table>

</body>
</html>
