import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComponentsBarComponent } from './components-bar.component';

describe('ComponentsBarComponent', () => {
  let component: ComponentsBarComponent;
  let fixture: ComponentFixture<ComponentsBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentsBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentsBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
