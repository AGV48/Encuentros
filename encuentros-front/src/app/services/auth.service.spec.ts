import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService, AuthResponse, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: 1,
    nombre: 'Juan',
    email: 'juan@test.com',
    fechaRegistro: new Date()
  };

  const mockResponse: AuthResponse = {
    user: mockUser,
    access_token: 'fake-token'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    service.register('Juan', 'juan@test.com', '123456').subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('access_token')).toBe('fake-token');
    });

    const req = httpMock.expectOne('http://localhost:3000/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should login a user', () => {
    service.login('juan@test.com', '123456').subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(localStorage.getItem('access_token')).toBe('fake-token');
      expect(service.getCurrentUser()).toEqual(mockUser);
    });

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should logout a user', () => {
    localStorage.setItem('access_token', 'token');
    service.logout();
    expect(localStorage.getItem('access_token')).toBeNull();
    expect(service.getCurrentUser()).toBeNull();
  });

  it('should check if authenticated', () => {
    localStorage.setItem('access_token', 'token');
    expect(service.isAuthenticated()).toBeTrue();
    localStorage.removeItem('access_token');
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should forgot password', () => {
    service.forgotPassword('test@test.com').subscribe(res => {
      expect(res.message).toBe('Email sent');
    });

    const req = httpMock.expectOne('http://localhost:3000/auth/forgot-password');
    req.flush({ message: 'Email sent' });
  });

  it('should reset password', () => {
    service.resetPassword('token123', 'newpass').subscribe(res => {
      expect(res.message).toBe('Success');
    });

    const req = httpMock.expectOne('http://localhost:3000/auth/reset-password');
    req.flush({ message: 'Success' });
  });
});
