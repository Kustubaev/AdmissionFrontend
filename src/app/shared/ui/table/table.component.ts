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
  ],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  protected admissionService = inject(AdmissionService);

  public applicantsResponse$ = toObservable(
    this.admissionService.getApplicantsResponse()
  );
  public applicantsFiltered$ = toObservable(
    this.admissionService.getApplicantsFiltered()
  );

  protected readonly displayedColumns: string[] = [
    'fullNameSpec',
    'zach',
    'Plan_B',
    'FIO',
    'Telephone',
    // 'Kod_Depat',
    // 'Kod_Spec',
  ];

  protected dataSource = new MatTableDataSource<Applicant>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private pageSizeSignal = signal<number>(10);
  private currentPageSignal = signal<number>(1);
  private sortSignal = signal<string>('fullNameSpec');
  public searchQuery = signal<string>('');

  constructor() {
    effect(() => {
      const currentParams = this.paramsGets();
      this.admissionService.getApplicants(currentParams).subscribe();
    });
  }

  ngOnInit(): void {
    this.applicantsFiltered$.subscribe((applicantsFiltered) => {
      if (applicantsFiltered) {
        this.dataSource.data = applicantsFiltered;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  handlePageEvent(e: PageEvent) {
    this.pageSizeSignal.set(e.pageSize);
    this.currentPageSignal.set(e.pageIndex + 1);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction === '') {
      this.sortSignal.set('');
    } else {
      this.sortSignal.set(
        `${sortState.direction === 'asc' ? '' : '-'}${sortState.active}`
      );
    }
  }

  onSearchInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    this.searchQuery.set(input.trim());
  }

  private paramsGets = computed<getInterface>(() => {
    const conditions = [];

    // Если есть текст в поиске — добавляем условия _search
    if (this.searchQuery()) {
      const searchValue = this.searchQuery().toLowerCase();

      conditions.push(
        { name: 'FIO', comparison: 'search', value: searchValue },
        { name: 'fullNameSpec', comparison: 'search', value: searchValue },
        { name: 'Telephone', comparison: 'search', value: searchValue }
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
}
