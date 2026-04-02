
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { RegisterComponent } from './register.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, HttpClientTestingModule, FormsModule, CommonModule]
    }).compileComponents();
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener campos vacíos al inicio', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
    expect(component.nombre).toBe('');
    expect(component.apellido).toBe('');
    expect(component.telefono).toBe('');
    expect(component.direccion).toBe('');
  });

  it('debería simular el registro exitoso (integración)', () => {
    component.nombre = 'Test';
    component.apellido = 'User';
    component.telefono = '123456789';
    component.direccion = 'Calle 1';
    component.email = 'test@correo.com';
    component.password = '123456';

    component.register();

    const req = httpMock.expectOne('https://localhost/api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nombre: 'Test',
      apellido: 'User',
      telefono: '123456789',
      direccion: 'Calle 1',
      email: 'test@correo.com',
      password: '123456'
    });

    req.flush({}); // Simula respuesta exitosa
    expect(component.success).toContain('Registro exitoso');
    expect(component.loading).toBeFalse();
  });
});
