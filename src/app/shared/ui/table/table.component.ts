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
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Applicant } from '../../../interface/Applicant';
import { AdmissionService } from '../../../service/api/admission.service';
import { getInterface } from '../../../service/features/api';

@Component({
  standalone: true,
  selector: 'app-table',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
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
    'id',
    'fullNameSpec',
    'zach',
    'Plan_B',
    'FIO',
    'Telephone',
    'Kod_Depat',
    'Kod_Spec',
  ];

  protected dataSource = new MatTableDataSource<Applicant>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private pageSizeSignal = signal<number>(10);
  private currentPageSignal = signal<number>(1);
  private sortSignal = signal<string>('id');

  private paramsGets = computed<getInterface>(() => ({
    pagination: {
      page: this.currentPageSignal(),
      count: this.pageSizeSignal(),
    },
    sort: this.sortSignal(),
    conditions: [
      // {
      //   name: 'id',
      //   comparison: '==',
      //   value: ['6', '2', '7', '4', '5'],
      // },
      // {
      //   name: 'comment',
      //   comparison: 'like',
      //   value: ' третий ',
      // },
      // {
      //   name: 'countScore',
      //   comparison: '>=',
      //   value: 168,
      // },
    ],
  }));

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
    // this.dataSource.sort = this.sort;
  }

  // Функция для пагинации
  handlePageEvent(e: PageEvent) {
    this.pageSizeSignal.set(e.pageSize);
    this.currentPageSignal.set(e.pageIndex + 1);
  }

  // Функция для сортировки {active: 'fio', direction: 'asc'}
    announceSortChange(sortState: Sort) {
        console.log("sortState", sortState);
        
    if (sortState.direction === '') {
      this.sortSignal.set('');
    } else {
      this.sortSignal.set(
        `${sortState.direction === 'asc' ? '' : '-'}${sortState.active}`
      );
    }
  }
}
