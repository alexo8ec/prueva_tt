<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Cliente;

class ClienteTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function puede_crear_cliente()
    {
        $payload = [
            'nombre' => 'Juan',
            'apellido' => 'Pérez',
            'email' => 'juan.perez@example.com',
            'telefono' => '123456789',
        ];

        $response = $this->postJson('/api/v1/clientes', $payload);

        $response->assertStatus(200)
                 ->assertJsonFragment([
                     'nombre' => 'Juan',
                     'apellido' => 'Pérez',
                     'email' => 'juan.perez@example.com',
                     'telefono' => '123456789',
                 ]);

        $this->assertDatabaseHas('clientes', [
            'email' => 'juan.perez@example.com',
        ]);
    }
}
