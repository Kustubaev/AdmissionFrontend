import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Applicant } from '../../../interface/Applicant';
import { AdmissionService } from '../../../service/api/admission.service';
import { getInterface } from '../../../service/features/api';

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './abit-table.component.html',
  styleUrls: ['./abit-table.component.scss'],
})
export class TableComponent {
  protected admissionService = inject(AdmissionService);

  // Сигналы для данных
  public applicantsResponse$ = toObservable(
    this.admissionService.getApplicantsResponse()
  );
  public applicantsFiltered$ = toObservable(
    this.admissionService.getApplicantsFiltered()
  );

  // Отображаемые колонки (в нужном порядке)
  protected readonly displayedColumns: string[] = [
    'fullNameSpec',
    'Nom_Folder',
    'zach',
    'Plan_B',
    'Zapis',
    'FIO',
    'Telephone',
    'actions',
  ];

  // DataSource для Material Table
  protected dataSource = new MatTableDataSource<Applicant>([]);

  // Ссылки на компоненты пагинации и сортировки
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Параметры запроса
  private pageSizeSignal = signal<number>(10);
  private currentPageSignal = signal<number>(1);
  private sortSignal = signal<string>('fullNameSpec');
  public searchQuery = signal<string>('');

  // Эффект: при изменении параметров — отправляем запрос
  constructor() {
    effect(() => {
      const params = this.paramsGets();
      this.admissionService.getApplicants(params).subscribe();
    });
  }

  ngOnInit(): void {
    // Подписываемся на изменение данных
    this.applicantsFiltered$.subscribe((applicants) => {
      if (applicants) {
        this.dataSource.data = applicants;
      }
    });
  }

  ngAfterViewInit(): void {
    // Привязываем пагинацию и сортировку к dataSource
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  // Обработка изменения страницы
  handlePageEvent(e: PageEvent): void {
    this.pageSizeSignal.set(e.pageSize);
    this.currentPageSignal.set(e.pageIndex + 1);
  }

  // Обработка сортировки
  announceSortChange(sortState: Sort): void {
    if (sortState.direction === '') {
      this.sortSignal.set('');
    } else {
      this.sortSignal.set(
        `${sortState.direction === 'asc' ? '' : '-'}${sortState.active}`
      );
    }
  }

  // Обработка поиска
  onSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchQuery.set(input.trim());
  }

  // Формируем параметры запроса
  private paramsGets = computed<getInterface>(() => {
    const conditions = [];

    // Поиск по FIO, fullNameSpec, Telephone
    if (this.searchQuery()) {
      const searchValue = this.searchQuery().toLowerCase();
      conditions.push(
        { name: 'FIO', comparison: 'search', value: searchValue },
        { name: 'fullNameSpec', comparison: 'search', value: searchValue },
        { name: 'Telephone', comparison: 'search', value: searchValue },
        { name: 'Nom_Folder', comparison: 'search', value: searchValue }
      );
    }

    return {
      pagination: {
        page: this.currentPageSignal(),
        count: this.pageSizeSignal(),
      },
      sort: this.sortSignal(),
      conditions: conditions.length > 0 ? conditions : null,
    };
  });

  onAdd(applicant: Applicant): void {
    const reservData = {
      Nom_Folder: applicant.Nom_Folder,
      Kod_Spec: applicant.Kod_Spec,
      Kod_Depat: applicant.Kod_Depat,
    };

    if (!confirm(`Добавить абитуриента ${applicant.FIO} в резерв?`)) {
      return;
    }

    this.admissionService.addToReserv(reservData).subscribe({
      next: (response) => {
        console.log('Успешно добавлено:', response);
        alert('Абитуриент успешно добавлен в резерв!');

        this.admissionService.getApplicants(this.paramsGets()).subscribe();
      },
      error: (err) => {
        console.error('Ошибка при добавлении:', err);
        const errorMsg = err.error?.error || 'Не удалось добавить в резерв';
        alert(`Ошибка: ${errorMsg}`);
      },
    });
  }
}
