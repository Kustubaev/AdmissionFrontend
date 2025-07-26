import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Reserv } from '../../interface/Reserv';
import { Pagination } from '../../interface/Pagination';
import { getInterface, paramsGetRequestToString } from '../features/api';
@Injectable({
  providedIn: 'root'
})
export class ReservService {
  protected readonly http: HttpClient = inject(HttpClient);
  private baseUrl = 'http://admission.loc';
  // Сигналы
  private reservResponse = signal<Pagination<Reserv> | null>(null);
  private reservFiltered = signal<Reserv[] | null>(null);
  // Публичные сигналы
  getReservResponse() {
    return this.reservResponse;

  }
  getReservFiltered() {
    return this.reservFiltered;

  }
  getAll(data?: getInterface): Observable<Pagination<Reserv>> {
    return this.http

      .get<Pagination<Reserv>>(

        `${this.baseUrl}/api/v1/reserv` + paramsGetRequestToString(data)

      )

      .pipe(

        tap((res) => {

          this.reservResponse.set(res);

          this.reservFiltered.set(res.data);

        })

      );

  }
 deleteReserv(Nom_Folder: string, Kod_Spec: string, Kod_Depat: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/v1/reserv/delete`, {
      body: { Nom_Folder, Kod_Spec, Kod_Depat }
    });
  }
}