<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ValidateExternalJwt
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        Log::info('[JWT] Token recibido:', ['token' => $token]);
        if (!$token) {
            Log::warning('[JWT] Token no enviado');
            return response()->json([
                'status' => 'error',
                'message' => 'Token no enviado'
            ], 401);
        }

        try {
            $secret = config('services.jwt.secret');
            Log::info('[JWT] Usando secret:', ['secret' => $secret]);
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));

            Log::info('[JWT] Token decodificado correctamente', ['payload' => (array) $decoded]);

            // Guardar datos útiles en request
            $request->attributes->set('jwt_user', (array) $decoded);

            // Si además quieres sesión Laravel:
            session([
                'jwt_user' => (array) $decoded,
                'jwt_token' => $token
            ]);

            return $next($request);
        } catch (\Throwable $e) {
            Log::error('[JWT] Error al validar token', [
                'error' => $e->getMessage(),
                'token' => $token
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Token inválido',
                'detail' => $e->getMessage(),
            ], 401);
        }
    }
}
