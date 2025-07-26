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
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { Reserv } from '../../../interface/Reserv';
import { ReservService } from '../../../service/api/reserv.service';
import { getInterface } from '../../../service/features/api';

@Component({
  selector: 'app-reserv-table',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    CommonModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './reserv-table.component.html',
  styleUrls: ['./reserv-table.component.scss'],
})
export class ReservTableComponent {
  protected reservService = inject(ReservService);

  // Сигналы для данных
  public reservResponse$ = toObservable(this.reservService.getReservResponse());
  public reservFiltered$ = toObservable(this.reservService.getReservFiltered());

  // Отображаемые колонки
  protected readonly displayedColumns: string[] = [
    'Nom_Folder',
    'Kod_Spec',
    'Kod_Depat',
    'actions',
  ];

  // DataSource
  protected dataSource = new MatTableDataSource<Reserv>([]);

  // Ссылки на пагинатор и сортировку
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Параметры запроса
  private pageSizeSignal = signal<number>(10);
  private currentPageSignal = signal<number>(1);
  private sortSignal = signal<string>('Nom_Folder');
  public searchQuery = signal<string>('');

  // Эффект: при изменении параметров — отправляем запрос
  constructor() {
    effect(() => {
      const params = this.paramsGets();
      this.reservService.getAll(params).subscribe();
    });
  }

  ngOnInit(): void {
    // Подписываемся на изменение данных
    this.reservFiltered$.subscribe((reservs) => {
      if (reservs) {
        this.dataSource.data = reservs;
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
      this.sortSignal.set('Nom_Folder');
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

    // Поиск по Nom_Folder, Kod_Spec, Kod_Depat
    if (this.searchQuery()) {
      const searchValue = this.searchQuery().toLowerCase();
      conditions.push(
        { name: 'Nom_Folder', comparison: 'search', value: searchValue },
        { name: 'Kod_Spec', comparison: 'search', value: searchValue },
        { name: 'Kod_Depat', comparison: 'search', value: searchValue }
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

  // Удаление записи
  onDelete(reserv: Reserv): void {
    if (!confirm(`Удалить запись для ${reserv.Nom_Folder}?`)) return;

    this.reservService
      .deleteReserv(reserv.Nom_Folder, reserv.Kod_Spec, reserv.Kod_Depat)
      .subscribe({
        next: () => {
          alert('Запись удалена');

          // ✅ Удаляем запись из dataSource.data
          const newData = this.dataSource.data.filter(
            (r) =>
              !(
                r.Nom_Folder === reserv.Nom_Folder &&
                r.Kod_Spec === reserv.Kod_Spec &&
                r.Kod_Depat === reserv.Kod_Depat
              )
          );
          this.dataSource.data = newData;

          // Обновляем paginator.length
          this.paginator.length = this.paginator.length - 1;
        },
        error: (err) => {
          alert(
            'Ошибка при удалении: ' + (err.error?.error || 'Неизвестная ошибка')
          );
        },
      });
  }
}
