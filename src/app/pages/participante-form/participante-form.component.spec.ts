import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipanteFormComponent } from './participante-form.component';

describe('ParticipanteFormComponent', () => {
  let component: ParticipanteFormComponent;
  let fixture: ComponentFixture<ParticipanteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipanteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipanteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
