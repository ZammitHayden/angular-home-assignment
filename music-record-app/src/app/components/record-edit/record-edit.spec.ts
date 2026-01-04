import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordEditComponent } from './record-edit';

describe('RecordEdit', () => {
  let component: RecordEditComponent;
  let fixture: ComponentFixture<RecordEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecordEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
