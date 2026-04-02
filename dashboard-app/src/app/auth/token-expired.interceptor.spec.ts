import { TokenExpiredInterceptor } from './token-expired.interceptor';
import { Router } from '@angular/router';
import { HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { runInInjectionContext, EnvironmentInjector, inject } from '@angular/core';

describe('TokenExpiredInterceptor', () => {
    let routerNavigateSpy: jasmine.Spy;
    let router: Router;
    let injector: EnvironmentInjector;

    beforeEach(() => {
        routerNavigateSpy = jasmine.createSpy('navigate');
        router = { navigate: routerNavigateSpy } as any;
        // Crea un injector simulado
        injector = {
            get: (token: any) => {
                if (token === Router) return router;
                return null;
            }
        } as EnvironmentInjector;
    });

    function runInterceptorTest(testFn: () => void) {
        runInInjectionContext(injector, testFn);
    }

    it('debe redirigir al login y limpiar el token si recibe 401', (done) => {
        localStorage.setItem('token', 'dummy');
        const req = {} as HttpRequest<any>;
        const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 401 }));

        runInterceptorTest(() => {
            TokenExpiredInterceptor(req, next).subscribe({
                error: () => {
                    expect(localStorage.getItem('token')).toBeNull();
                    expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
                    done();
                }
            });
        });
    });

    it('debe redirigir al login y limpiar el token si recibe 403', (done) => {
        localStorage.setItem('token', 'dummy');
        const req = {} as HttpRequest<any>;
        const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 403 }));

        runInterceptorTest(() => {
            TokenExpiredInterceptor(req, next).subscribe({
                error: () => {
                    expect(localStorage.getItem('token')).toBeNull();
                    expect(routerNavigateSpy).toHaveBeenCalledWith(['/login']);
                    done();
                }
            });
        });
    });

    it('no debe redirigir ni limpiar el token si el error no es 401/403', (done) => {
        localStorage.setItem('token', 'dummy');
        const req = {} as HttpRequest<any>;
        const next: HttpHandlerFn = () => throwError(() => new HttpErrorResponse({ status: 500 }));

        runInterceptorTest(() => {
            TokenExpiredInterceptor(req, next).subscribe({
                error: () => {
                    expect(localStorage.getItem('token')).toBe('dummy');
                    expect(routerNavigateSpy).not.toHaveBeenCalled();
                    done();
                }
            });
        });
    });

    it('debe dejar pasar respuestas exitosas', (done) => {
        const req = {} as HttpRequest<any>;
        const next: HttpHandlerFn = () => of(new HttpResponse({ status: 200 }));

        runInterceptorTest(() => {
            TokenExpiredInterceptor(req, next).subscribe({
                next: (res) => {
                    if ('status' in res) {
                        expect(res.status).toBe(200);
                    }
                    done();
                }
            });
        });
    });
});
