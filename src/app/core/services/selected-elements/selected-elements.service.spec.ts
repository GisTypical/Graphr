import { TestBed } from '@angular/core/testing';

import { SelectedElementsService } from './selected-elements.service';

describe('SelectedElementsService', () => {
  let service: SelectedElementsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectedElementsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
