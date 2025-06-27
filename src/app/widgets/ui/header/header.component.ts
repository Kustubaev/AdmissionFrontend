import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { AdmissionService } from '../../../service/api/admission.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  protected admissionService = inject(AdmissionService);

  public applicantsResponse$ = toObservable(
    this.admissionService.getApplicantsResponse()
  );
  public applicantsFiltered$ = toObservable(
    this.admissionService.getApplicantsFiltered()
  );

  // constructor() {
  //   effect(() => {});
  // }
}
