import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Applicant } from '../../interface/Applicant';
import { Pagination } from '../../interface/Pagination';
import { getInterface, paramsGetRequestToString } from '../features/api';

@Injectable({
  providedIn: 'root',
})
export class AdmissionService {
  protected readonly http: HttpClient = inject(HttpClient);
  private baseUrl = 'http://admission.loc';

  applicantsResponse = signal<Pagination<Applicant> | null>(null);
  applicantsFiltered = signal<Applicant[] | null>(null);

  getApplicants(data?: getInterface): Observable<Pagination<Applicant>> {
    return this.http
      .get<Pagination<Applicant>>(
        `${this.baseUrl}/api/v1/person` + paramsGetRequestToString(data)
      )
      .pipe(
        tap((res) => {
          this.applicantsResponse.set(res);
          this.applicantsFiltered.set(res.data);
        })
      );
  }

  getApplicant(id: number): Observable<Applicant> {
    return this.http.get<Applicant>(`${this.baseUrl}/api/v1/applicants/${id}`);
  }

  // Геттеры для сигналов (signals)
  getApplicantsResponse() {
    return this.applicantsResponse;
  }

  getApplicantsFiltered() {
    return this.applicantsFiltered;
  }

addToReserv(data: { Nom_Folder: string; Kod_Spec: string; Kod_Depat: string }): Observable<any> {
  return this.http.post(`${this.baseUrl}/api/v1/reserv`, data);
}
}
