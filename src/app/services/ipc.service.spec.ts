import { TestBed } from '@angular/core/testing';

import { IPCService } from './ipc.service';

describe('IPCService', () => {
  let service: IPCService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IPCService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
