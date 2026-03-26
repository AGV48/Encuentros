import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ForgotPassword } from './forgot-password';
import { AuthService } from '../../../services/auth.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPassword, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.forgotPasswordForm.valid).toBeFalse();
  });

  it('should call authService.forgotPassword on submit', () => {
    const spy = spyOn(authService, 'forgotPassword').and.returnValue(of({ message: 'Success' }));
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    
    component.forgotPasswordForm.setValue({ email: 'test@test.com' });
    component.onSubmit();
    
    expect(spy).toHaveBeenCalledWith('test@test.com');
  });

  it('should handle error from authService', () => {
    const spy = spyOn(authService, 'forgotPassword').and.returnValue(throwError(() => ({ error: { message: 'Error' } })));
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    
    component.forgotPasswordForm.setValue({ email: 'test@test.com' });
    component.onSubmit();
    
    expect(spy).toHaveBeenCalled();
    expect(swalSpy).toHaveBeenCalled();
  });
});
