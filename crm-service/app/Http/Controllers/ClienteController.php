<?php

namespace App\Http\Controllers;

use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/clientes",
     *     tags={"Clientes"},
     *     summary="Listar clientes",
     *     @OA\Response(
     *         response=200,
     *         description="Listado de clientes"
     *     )
     * )
     */
    public function index()
    {
        try {
            $clientes = Cliente::all();
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Error al obtener clientes: ' . $e->getMessage()], 500);
        }
        return response()->json($clientes);
    }


    /**
     * @OA\Post(
     *     path="/api/v1/clientes",
     *     tags={"Clientes"},
     *     summary="Crear cliente",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"nombre","apellido","email"},
     *             @OA\Property(property="nombre", type="string", example="Juan"),
     *             @OA\Property(property="apellido", type="string", example="Pérez"),
     *             @OA\Property(property="email", type="string", example="juan@correo.com"),
     *             @OA\Property(property="telefono", type="string", example="123456789")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cliente creado"
     *     )
     * )
     */
    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:255',
                'apellido' => 'required|string|max:255',
                'email' => 'required|email|unique:clientes,email',
                'telefono' => 'nullable|string|max:20',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['status' => 'error', 'message' => 'Error de validación', 'errors' => $e->errors()], 422);
        }
        return response()->json(Cliente::create($request->all()));
    }

    /**
     * @OA\Get(
     *     path="/api/v1/clientes/{id}",
     *     tags={"Clientes"},
     *     summary="Mostrar cliente",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Datos del cliente"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Cliente no encontrado"
     *     )
     * )
     */
    public function show(int $id)
    {
        try {
            $cliente = Cliente::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Cliente no encontrado'], 404);
        }
        return $cliente;
    }

    /**
     * @OA\Put(
     *     path="/api/v1/clientes/{id}",
     *     tags={"Clientes"},
     *     summary="Actualizar cliente",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="nombre", type="string", example="Juan"),
     *             @OA\Property(property="apellido", type="string", example="Pérez"),
     *             @OA\Property(property="email", type="string", example="juan@correo.com"),
     *             @OA\Property(property="telefono", type="string", example="123456789")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cliente actualizado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Cliente no encontrado"
     *     )
     * )
     */
    public function update(Request $request, int $id)
    {
        try {
            $request->validate([
                'nombre' => 'sometimes|required|string|max:255',
                'apellido' => 'sometimes|required|string|max:255',
                'email' => 'sometimes|required|email|unique:clientes,email,' . $id,
                'telefono' => 'nullable|string|max:20',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        }

        $cliente = Cliente::find($id);

        if (!$cliente) {
            return response()->json([
                'status' => 'error',
                'message' => 'Cliente no encontrado'
            ], 404);
        }

        $cliente->update($request->only(['nombre', 'apellido', 'email', 'telefono']));

        return response()->json([
            'status' => 'success',
            'message' => 'Cliente actualizado correctamente',
            'data' => $cliente
        ]);
    }


    /**
     * @OA\Delete(
     *     path="/api/v1/clientes/{id}",
     *     tags={"Clientes"},
     *     summary="Eliminar cliente",
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Cliente eliminado"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Cliente no encontrado"
     *     )
     * )
     */
    public function destroy(int $id)
    {
        try {
            Cliente::findOrFail($id);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['status' => 'error', 'message' => 'Cliente no encontrado'], 404);
        }
        Cliente::destroy($id);
        return response()->json(['status' => 'success', 'message' => 'Cliente eliminado correctamente']);
    }
}
