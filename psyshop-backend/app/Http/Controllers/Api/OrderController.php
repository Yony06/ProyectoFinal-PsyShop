<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\OrderPlaced;
use App\Mail\OrderReady;
use App\Models\Game;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    // Listado de administración (todos los pedidos)
    public function index()
    {
        $orders = Order::with(['items.game'])
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }

    // NUEVO: pedidos del cliente que inició sesión
    public function myOrders(Request $request)
    {
        $user = $request->user();

        $orders = Order::with(['items.game'])
            ->where(function ($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhere('customer_email', $user->email);
            })
            ->latest()
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:30'],
            'delivery_address' => ['required', 'string', 'max:2000'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.game_id' => ['required', 'integer', 'distinct', 'exists:games,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $order = DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $game = Game::whereKey($item['game_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$game || !$game->is_active) {
                    throw ValidationException::withMessages([
                        'items' => [
                            'Uno de los videojuegos ya no está disponible.',
                        ],
                    ]);
                }

                if ($game->stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => [
                            "Stock insuficiente para {$game->title}.",
                        ],
                    ]);
                }

                $unitPrice = (float) $game->price;
                $lineSubtotal = round(
                    $unitPrice * $item['quantity'],
                    2
                );

                $subtotal += $lineSubtotal;

                $orderItems[] = [
                    'game' => $game,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'subtotal' => $lineSubtotal,
                ];
            }

            $order = Order::create([
                // NUEVO: liga el pedido a la cuenta (null si compra como invitado)
                'user_id' => auth('sanctum')->id(),
                'customer_name' => $validated['customer_name'],
                'customer_email' => $validated['customer_email'],
                'customer_phone' => $validated['customer_phone'],
                'delivery_address' => $validated['delivery_address'],
                'subtotal' => $subtotal,
                'total' => $subtotal,
                'status' => 'pending',
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create([
                    'game_id' => $item['game']->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal' => $item['subtotal'],
                ]);

                $item['game']->decrement(
                    'stock',
                    $item['quantity']
                );
            }

            return $order->load('items.game');
        });

        // NUEVO: correo de confirmación. Si el correo falla (SMTP caído, mala
        // configuración...), el pedido YA está guardado y no se pierde.
        try {
            Mail::to($order->customer_email)->send(new OrderPlaced($order));
        } catch (\Throwable $e) {
            Log::warning("No se pudo enviar el correo del pedido #{$order->id}: " . $e->getMessage());
        }

        return response()->json([
            'message' => 'Pedido registrado correctamente.',
            'order' => $order,
        ], 201);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                'in:pending,completed,cancelled',
            ],
        ]);

        $previousStatus = $order->status;

        $order->update([
            'status' => $validated['status'],
        ]);

        // NUEVO: aviso al cliente cuando el pedido PASA a "completed".
        // Si ya estaba completado y se guarda otra vez, no se repite el correo.
        $emailSent = false;

        if ($validated['status'] === 'completed' && $previousStatus !== 'completed') {
            try {
                $order->load('items.game');
                Mail::to($order->customer_email)->send(new OrderReady($order));
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::warning("No se pudo enviar el aviso de pedido listo #{$order->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Estado del pedido actualizado correctamente.',
            'order' => $order->fresh(),
            'email_sent' => $emailSent,
        ]);
    }
}
