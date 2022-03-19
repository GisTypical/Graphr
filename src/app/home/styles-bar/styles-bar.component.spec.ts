import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StylesBarComponent } from './styles-bar.component';

describe('StylesBarComponent', () => {
  let component: StylesBarComponent;
  let fixture: ComponentFixture<StylesBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StylesBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StylesBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
