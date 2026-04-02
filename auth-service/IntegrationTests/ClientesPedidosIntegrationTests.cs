using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Newtonsoft.Json;

public class ClientesPedidosIntegrationTests
{
    private readonly HttpClient _authClient;
    private readonly HttpClient _crmClient;

    public ClientesPedidosIntegrationTests()
    {
        _authClient = new HttpClient { BaseAddress = new System.Uri("http://localhost:5000/") };
        _crmClient = new HttpClient { BaseAddress = new System.Uri("http://localhost/api/v1/") };
    }

    private async Task<string> GetToken()
    {
        var loginPayload = new { username = "testuser_integration", password = "Test1234!" };
        var loginContent = new StringContent(JsonConvert.SerializeObject(loginPayload), Encoding.UTF8, "application/json");
        var loginResp = await _authClient.PostAsync("api/auth/login", loginContent);
        loginResp.EnsureSuccessStatusCode();
        var loginJson = await loginResp.Content.ReadAsStringAsync();
        dynamic loginData = JsonConvert.DeserializeObject(loginJson);
        return loginData.token;
    }

    [Fact]
    public async Task CrearClienteYListarPedidosConToken()
    {
        // Obtener token
        var token = await GetToken();
        _crmClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        // Crear cliente
        var clientePayload = new { nombre = "Cliente Integracion", email = "clienteint@demo.com" };
        var clienteContent = new StringContent(JsonConvert.SerializeObject(clientePayload), Encoding.UTF8, "application/json");
        var clienteResp = await _crmClient.PostAsync("clientes", clienteContent);
        clienteResp.EnsureSuccessStatusCode();
        var clienteJson = await clienteResp.Content.ReadAsStringAsync();
        dynamic clienteData = JsonConvert.DeserializeObject(clienteJson);
        int clienteId = clienteData.data.id;

        // Crear pedido asociado
        var pedidoPayload = new { cliente_id = clienteId, descripcion = "Pedido integración", estado = "pendiente" };
        var pedidoContent = new StringContent(JsonConvert.SerializeObject(pedidoPayload), Encoding.UTF8, "application/json");
        var pedidoResp = await _crmClient.PostAsync("pedidos", pedidoContent);
        pedidoResp.EnsureSuccessStatusCode();

        // Listar pedidos y verificar
        var pedidosResp = await _crmClient.GetAsync("pedidos?cliente_id=" + clienteId);
        pedidosResp.EnsureSuccessStatusCode();
        var pedidosJson = await pedidosResp.Content.ReadAsStringAsync();
        Assert.Contains("Pedido integración", pedidosJson);
    }
}
