import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewChannelModalComponent } from './new-channel-modal.component';

describe('NewChannelModalComponent', () => {
  let component: NewChannelModalComponent;
  let fixture: ComponentFixture<NewChannelModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewChannelModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewChannelModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
