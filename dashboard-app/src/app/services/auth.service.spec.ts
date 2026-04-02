import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    // Evita reload real en pruebas
    service.reloadFn = () => {};
  });

  it('debería enviar email y password al endpoint de login', () => {
    service.login('test@mail.com', '1234').subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@mail.com', password: '1234' });
    req.flush({ token: 'abc123' });
  });

  it('debería guardar el token en localStorage al hacer login', () => {
    spyOn(localStorage, 'setItem');
    service.login('test@mail.com', '1234').subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ token: 'abc123' });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
  });

  afterEach(() => {
    httpMock.verify();
  });
});
