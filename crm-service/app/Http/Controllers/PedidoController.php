<?php

namespace App\Http\Controllers;

use App\Models\Pedido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PedidoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $pedidos = Pedido::with(['detalles', 'cliente'])
                ->when($request->estado, fn($q) => $q->where('estado', $request->estado))
                ->when($request->cliente_id, fn($q) => $q->where('cliente_id', $request->cliente_id))
                ->when($request->fecha_desde, fn($q) => $q->whereDate('created_at', '>=', $request->fecha_desde))
                ->when($request->fecha_hasta, fn($q) => $q->whereDate('created_at', '<=', $request->fecha_hasta))
                ->when($request->cliente, function ($q) use ($request) {
                    $q->whereHas('cliente', function ($q2) use ($request) {
                        $q2->where('nombre', 'like', '%' . $request->cliente . '%');
                    });
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json($pedidos);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener pedidos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'estado' => 'required|in:pendiente,completado,cancelado',
            'detalles' => 'required|array|min:1',
            'detalles.*.producto' => 'required|string',
            'detalles.*.cantidad' => 'required|integer|min:1',
            'detalles.*.precio' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {
            $pedido = Pedido::create([
                'cliente_id' => $request->cliente_id,
                'estado' => $request->estado,
                'total' => 0
            ]);

            $total = 0;

            foreach ($request->detalles as $item) {
                $subtotal = $item['cantidad'] * $item['precio'];
                $total += $subtotal;

                $pedido->detalles()->create([
                    'producto' => $item['producto'],
                    'cantidad' => $item['cantidad'],
                    'precio' => $item['precio'],
                    'subtotal' => $subtotal
                ]);
            }

            $pedido->update(['total' => $total]);

            DB::commit();

            return response()->json($pedido->load('detalles'), 201);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Error al crear pedido'
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $pedido = Pedido::with(['detalles', 'cliente'])->find($id);

        if (!$pedido) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pedido no encontrado'
            ], 404);
        }

        return response()->json($pedido);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pedido no encontrado'
            ], 404);
        }

        // 🔥 Validación flexible
        $request->validate([
            'estado' => 'sometimes|in:pendiente,completado,cancelado',
            'detalles' => 'sometimes|array|min:1',
            'detalles.*.producto' => 'required_with:detalles|string',
            'detalles.*.cantidad' => 'required_with:detalles|integer|min:1',
            'detalles.*.precio' => 'required_with:detalles|numeric|min:0',
        ]);

        DB::beginTransaction();

        try {

            // 🟡 1. Actualizar estado (si viene)
            if ($request->filled('estado')) {
                $pedido->estado = $request->estado;
            }

            // 🔵 2. Actualizar detalles (si vienen)
            if ($request->has('detalles')) {

                // borrar detalles actuales
                $pedido->detalles()->delete();

                $total = 0;

                foreach ($request->detalles as $item) {
                    $subtotal = $item['cantidad'] * $item['precio'];
                    $total += $subtotal;

                    $pedido->detalles()->create([
                        'producto' => $item['producto'],
                        'cantidad' => $item['cantidad'],
                        'precio' => $item['precio'],
                        'subtotal' => $subtotal
                    ]);
                }

                // actualizar total solo si se modifican detalles
                $pedido->total = $total;
            }

            $pedido->save();

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Pedido actualizado correctamente',
                'data' => $pedido->load('detalles', 'cliente')
            ]);
        } catch (\Exception $e) {

            DB::rollBack();

            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar pedido'
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $pedido = Pedido::find($id);

        if (!$pedido) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pedido no encontrado'
            ], 404);
        }

        $pedido->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Pedido eliminado'
        ]);
    }
}
