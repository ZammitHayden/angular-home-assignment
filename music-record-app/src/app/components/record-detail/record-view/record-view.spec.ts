import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordViewComponent } from './record-view';

describe('RecordView', () => {
  let component: RecordViewComponent;
  let fixture: ComponentFixture<RecordViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
