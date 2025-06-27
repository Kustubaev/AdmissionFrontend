export interface Applicant {
  id: number; // Уникальный идентификатор записи

  fullNameSpec: string; // Полное название специальности
  FIO: string; // ФИО абитуриента
  Telephone: string; // Номер телефона
  Kod_Depat: string; // Код департамента (тип строка, если возможны нечисловые значения)
  Kod_Spec: string; // Код специальности
  zach: number | null; // Количество зачисленных
  Plan_B: number | null; // План бюджета
}