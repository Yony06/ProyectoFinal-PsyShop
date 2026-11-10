<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Mail\PedidoConfirmadoMail;
use Illuminate\Support\Facades\Mail;


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

        $order->update([
            'status' => $validated['status'],
        ]);

        // Enviar el correo solo si el estado es 'completed'
        if ($validated['status'] === 'completed') {
            // Importante: Asegúrate de que 'detalles' y 'game' sean los 
            // nombres reales de las relaciones en tu modelo Order.
            $order->load(['user', 'items.game']);
            Mail::to($order->user->email)->send(new PedidoConfirmadoMail($order));
        }

        return response()->json([
            'message' => 'Estado del pedido actualizado correctamente.',
            'order' => $order->fresh(),
        ]);
    }
}
