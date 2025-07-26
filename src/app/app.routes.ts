import { Routes } from '@angular/router';
import { TableComponent } from './shared/ui/abit-table/abit-table.component'
import { ReservTableComponent } from './shared/ui/reserv-table/reserv-table.component';

export const routes: Routes = [
	{
    path: '',
    component: TableComponent,
  },
  { path: 'reserv', 
    component: ReservTableComponent,
  },
];
