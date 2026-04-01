<?php

use App\Http\Controllers\ClienteController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PedidoController;
use Illuminate\Support\Facades\Route;

Route::middleware('external.jwt')->prefix('v1')->group(function () {
    Route::apiResource('clientes', ClienteController::class);
    Route::apiResource('pedidos', PedidoController::class);
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
