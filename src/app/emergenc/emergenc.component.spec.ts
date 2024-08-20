import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencComponent } from './emergenc.component';

describe('EmergencComponent', () => {
  let component: EmergencComponent;
  let fixture: ComponentFixture<EmergencComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmergencComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmergencComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
