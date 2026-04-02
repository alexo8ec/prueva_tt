<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FlujoCriticoNegocioTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function flujo_completo_registro_login_cliente_pedido_dashboard()
    {
        // 1. Registrar usuario en AuthService
        $registerResponse = $this->postJson('http://auth-service:5000/api/auth/register', [
            'username' => 'php_integration_'.time(),
            'password' => 'Test1234!'
        ]);
        $registerResponse->assertStatus(201)->or($registerResponse->assertStatus(200));

        // 2. Login para obtener token
        $loginResponse = $this->postJson('http://auth-service:5000/api/auth/login', [
            'username' => $registerResponse['username'] ?? 'php_integration_'.time(),
            'password' => 'Test1234!'
        ]);
        $loginResponse->assertStatus(200);
        $token = $loginResponse['token'];
        $this->assertNotEmpty($token);

        // 3. Crear cliente en CRM
        $clienteResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token
        ])->postJson('/api/v1/clientes', [
            'nombre' => 'Cliente Flujo PHP',
            'email' => 'flujo_php_'.time().'@demo.com'
        ]);
        $clienteResponse->assertStatus(201);
        $clienteId = $clienteResponse['data']['id'];

        // 4. Crear pedido asociado
        $pedidoResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token
        ])->postJson('/api/v1/pedidos', [
            'cliente_id' => $clienteId,
            'descripcion' => 'Pedido Flujo PHP',
            'estado' => 'pendiente'
        ]);
        $pedidoResponse->assertStatus(201);

        // 5. Consultar dashboard
        $dashboardResponse = $this->withHeaders([
            'Authorization' => 'Bearer '.$token
        ])->getJson('/api/v1/dashboard');
        $dashboardResponse->assertStatus(200);
        $this->assertArrayHasKey('total_pedidos', $dashboardResponse['data']);
        $this->assertGreaterThanOrEqual(1, $dashboardResponse['data']['total_pedidos']);
    }
}
