<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Ruta: database/migrations/2026_11_07_000000_add_user_id_to_orders_table.php
// (puedes crearla con: php artisan make:migration add_user_id_to_orders_table --table=orders
//  y pegar dentro solo el contenido de up() y down())

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // nullable: los pedidos que ya existen quedan con user_id vacío
            // nullOnDelete: si se borra un usuario, sus pedidos se conservan
            $table->foreignId('user_id')
                ->nullable()
                ->after('id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
        });
    }
};
