import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Search } from './search';
import Swal from 'sweetalert2';

describe('Search', () => {
  let component: Search;
  let fixture: ComponentFixture<Search>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, nombre: 'Test User' }));
    
    await TestBed.configureTestingModule({
      imports: [Search, FormsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Search);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should search users with debounce', fakeAsync(() => {
    component.searchTerm = 'juan';
    component.doSearch();
    
    tick(350); // wait for debounce
    
    const req = httpMock.expectOne('http://localhost:3000/users/search_user?q=juan&currentUser=1');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 2, nombre: 'Juan' }]);
    
    expect(component.results.length).toBe(1);
    expect(component.results[0].nombre).toBe('Juan');
  }));

  it('should send friend request with confirmation from Swal', () => {
    const swalSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    
    component.currentUserId = 1;
    component.results = [{ id: 2, nombre: 'Juan' }];
    
    component.sendRequest(2);
    
    const req = httpMock.expectOne('http://localhost:3000/users/friend-request');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
    
    expect(swalSpy).toHaveBeenCalled();
  });

  it('should not search if term is empty', () => {
    component.searchTerm = '';
    component.doSearch();
    expect(component.results.length).toBe(0);
  });
});
