using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Newtonsoft.Json;

public class RegisterAndLoginIntegrationTests
{
    private readonly HttpClient _authClient;
    private readonly HttpClient _crmClient;

    public RegisterAndLoginIntegrationTests()
    {
        _authClient = new HttpClient { BaseAddress = new System.Uri("http://localhost:5000/") };
        _crmClient = new HttpClient { BaseAddress = new System.Uri("http://localhost/api/v1/") };
    }

    [Fact]
    public async Task RegistroYLoginDevuelveJwtValidoYPermiteAccesoProtegido()
    {
        // Usuario único por timestamp
        var username = $"testuser_{System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";
        var password = "Test1234!";

        // 1. Registrar usuario
        var registerPayload = new { username, password };
        var registerContent = new StringContent(JsonConvert.SerializeObject(registerPayload), Encoding.UTF8, "application/json");
        var registerResp = await _authClient.PostAsync("api/auth/register", registerContent);
        registerResp.EnsureSuccessStatusCode();

        // 2. Login
        var loginPayload = new { username, password };
        var loginContent = new StringContent(JsonConvert.SerializeObject(loginPayload), Encoding.UTF8, "application/json");
        var loginResp = await _authClient.PostAsync("api/auth/login", loginContent);
        loginResp.EnsureSuccessStatusCode();
        var loginJson = await loginResp.Content.ReadAsStringAsync();
        dynamic loginData = JsonConvert.DeserializeObject(loginJson);
        string token = loginData.token;
        Assert.False(string.IsNullOrEmpty(token), "El login no devolvió un token JWT válido.");

        // 3. Acceso a endpoint protegido en CRM
        _crmClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        var crmResp = await _crmClient.GetAsync("clientes");
        Assert.True(crmResp.IsSuccessStatusCode, "No se pudo acceder al endpoint protegido de CRM con el token JWT emitido por AuthService.");
    }
}
