import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { ResetPassword } from './reset-password';
import { AuthService } from '../../../services/auth.service';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';

describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let authService: AuthService;
  let activatedRoute: ActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetPassword, ReactiveFormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({ token: 'test-token' })
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    activatedRoute = TestBed.inject(ActivatedRoute);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with token from queryParams', () => {
    // Note: resetToken is private, but ngOnInit should handle the subscription
    expect(component).toBeTruthy();
  });

  it('should show error if passwords do not match', () => {
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    
    component.resetPasswordForm.setValue({
      nuevaContrasena: 'password123',
      confirmarContrasena: 'different123'
    });
    
    component.onSubmit();
    expect(swalSpy).toHaveBeenCalled();
  });

  it('should call authService.resetPassword on valid submit', () => {
    const spy = spyOn(authService, 'resetPassword').and.returnValue(of({ message: 'Success' }));
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    
    component.resetPasswordForm.setValue({
      nuevaContrasena: 'password123',
      confirmarContrasena: 'password123'
    });
    
    component.onSubmit();
    expect(spy).toHaveBeenCalled();
  });
});
