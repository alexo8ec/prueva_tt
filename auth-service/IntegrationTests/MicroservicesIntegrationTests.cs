using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Newtonsoft.Json;

public class MicroservicesIntegrationTests
{
    private readonly HttpClient _authClient;
    private readonly HttpClient _crmClient;

    public MicroservicesIntegrationTests()
    {
        // Apunta a los servicios levantados por Docker Compose
        _authClient = new HttpClient { BaseAddress = new System.Uri("http://localhost:5000/") };
        _crmClient = new HttpClient { BaseAddress = new System.Uri("http://localhost/api/v1/") };
    }

    [Fact]
    public async Task AuthToken_AllowsAccessToCrmProtectedEndpoint()
    {
        // 1. Registrar usuario (ajusta el endpoint y payload según tu API)
        var registerPayload = new
        {
            username = "testuser_integration",
            password = "Test1234!"
        };
        var registerContent = new StringContent(JsonConvert.SerializeObject(registerPayload), Encoding.UTF8, "application/json");
        await _authClient.PostAsync("api/auth/register", registerContent);

        // 2. Login para obtener token
        var loginPayload = new
        {
            username = "testuser_integration",
            password = "Test1234!"
        };
        var loginContent = new StringContent(JsonConvert.SerializeObject(loginPayload), Encoding.UTF8, "application/json");
        var loginResp = await _authClient.PostAsync("api/auth/login", loginContent);
        loginResp.EnsureSuccessStatusCode();
        var loginJson = await loginResp.Content.ReadAsStringAsync();
        dynamic loginData = JsonConvert.DeserializeObject(loginJson);
        string token = loginData.token;

        // 3. Usar token para acceder a endpoint protegido en CRM
        _crmClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var crmResp = await _crmClient.GetAsync("clientes");
        Assert.True(crmResp.IsSuccessStatusCode, "No se pudo acceder al endpoint protegido de CRM con el token JWT emitido por AuthService.");
    }
}
