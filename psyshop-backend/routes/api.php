<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\GameController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;

// Autenticación
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/logout', [AuthController::class, 'logout'])
    ->middleware('auth:sanctum');

// Catálogo público para los clientes
Route::get('/games', [GameController::class, 'index']);
Route::get('/games/{game}', [GameController::class, 'show']);

// Crear pedidos: público para el proceso de compra
Route::post('/orders', [OrderController::class, 'store']);

// NUEVO: pedidos del cliente que inició sesión (cualquier usuario, no solo admin)
Route::middleware('auth:sanctum')
    ->get('/my-orders', [OrderController::class, 'myOrders']);

// Operaciones administrativas protegidas
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Administración de videojuegos
    Route::post('/games', [GameController::class, 'store']);
    Route::put('/games/{game}', [GameController::class, 'update']);
    Route::patch('/games/{game}', [GameController::class, 'update']);
    Route::delete('/games/{game}', [GameController::class, 'destroy']);

    // Administración de pedidos
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::patch('/admin/orders/{order}/status', [OrderController::class, 'updateStatus']);

    // Usuario autenticado
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});
