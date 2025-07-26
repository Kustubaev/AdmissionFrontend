import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AdmissionService } from '../../../service/api/admission.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe, CommonModule, MatButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  protected admissionService = inject(AdmissionService);
  private router = inject(Router);

  public applicantsResponse$ = toObservable(
    this.admissionService.getApplicantsResponse()
  );
  public applicantsFiltered$ = toObservable(
    this.admissionService.getApplicantsFiltered()
  );

  // Сигнал для отслеживания состояния кнопки
  private buttonState = signal<number>(0);

  // Сигнал для текста кнопки
  public textButton = signal('Перейти к таблице Резерв');

  // Массив с вариантами текстов и маршрутов
  private buttonStates = [
    {
      text: 'Перейти к таблице Резерв',
      route: '/',
    },
    {
      text: 'Перейти к основной таблице',
      route: '/reserv',
    },
  ];

  ngOnInit() {
    // Определяем начальное состояние кнопки на основе текущего маршрута
    this.initializeButtonState();

    // Следим за изменениями маршрута
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateButtonStateBasedOnRoute(event.url);
      });
  }

  private initializeButtonState() {
    const currentUrl = this.router.url;
    this.updateButtonStateBasedOnRoute(currentUrl);
  }

  private updateButtonStateBasedOnRoute(url: string) {
    if (url === '/reserv') {
      // Если на странице /reserv, показываем "Перейти к основной таблице"
      this.buttonState.set(1);
      this.textButton.set(this.buttonStates[1].text);
    } else {
      // Если на любой другой странице (включая /), показываем "Перейти к таблице Резерв"
      this.buttonState.set(0);
      this.textButton.set(this.buttonStates[0].text);
    }
  }

  public rotuterButton($event: Event) {
    $event.preventDefault(); // Предотвращаем стандартное поведение

    // Получаем текущее состояние
    const currentState = this.buttonState();

    // Переход к следующему состоянию (0 -> 1, 1 -> 0)
    const nextState = (currentState + 1) % this.buttonStates.length;

    // Обновляем состояние
    this.buttonState.set(nextState);

    // Обновляем текст кнопки
    this.textButton.set(this.buttonStates[nextState].text);

    // Переходим по соответствующему маршруту
    this.router.navigate([this.buttonStates[nextState].route]);
  }
}
