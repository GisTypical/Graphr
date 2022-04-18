import { TestBed } from '@angular/core/testing';

import { CanvasScaleService } from './canvas-scale.service';

describe('CanvasScaleService', () => {
  let service: CanvasScaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasScaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
