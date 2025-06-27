export const paramsGetRequestToString = (data?: getInterface): string => {
  let resultReq = '';
  const params: string[] = [];

  if (data?.conditions) {
    const conditionsArray = Array.isArray(data.conditions)
      ? data.conditions
      : [data.conditions];

    conditionsArray.forEach((c) => {
      const { name, comparison, value } = c;

      // Определяем префикс оператора
      const operatorPrefix = enumConditions[comparison] || '';

      /// Обрабатываем специальные случаи для eq и neq
      if (comparison === '==' || comparison === '!=') {
        const values =
          typeof value === 'string' && value.includes(',')
            ? value.split(',').map((v) => v.trim())
            : Array.isArray(value)
            ? value
            : [value];

        if (values.length > 0) {
          params.push(`${name}${operatorPrefix}=${values.join(',')}`);
        }
      } else {
        params.push(`${name}${operatorPrefix}=${value}`);
      }
    });
  }

  if (data?.pagination) {
    const { page, count } = data.pagination;

    if (page >= 1) {
      params.push(
        `page=${page}${count && count > 0 ? `&count=${count}` : '&count=10'}`
      );
    } else {
      console.error('В pagination переменная page должна быть больше 0!');
    }
  }

  if (data?.sort) {
    const sortParams = Array.isArray(data.sort)
      ? data.sort
          .map((s) => `${s.order === 'desc' ? '-' : ''}${s.value}`)
          .join(',')
      : typeof data.sort === 'string'
      ? data.sort
      : `${data.sort.order === 'asc' ? '' : '-'}${data.sort.value}`;
    params.push(`sort=${sortParams}`);
  }

  if (params.length) {
    resultReq += `?${params.join('&')}`;
  }

  return resultReq;
};

export interface getInterface {
  conditions?:
    | {
        name: string; //Для вложенных условий => 'a.b.c', для массивов => 'a[0].b'!
        comparison: '==' | '<' | '<=' | '>' | '>=' | '!=' | 'like';
        value: number | string | null | string[];
      }
    | {
        name: string; //Для вложенных условий => 'a.b.c', для массивов => 'a[0].b'!
        comparison: '==' | '<' | '<=' | '>' | '>=' | '!=' | 'like';
        value: number | string | null | string[];
      }[]
    | null;
  pagination?: {
    page: number;
    count?: number;
  } | null;
  sort?:
    | { value: string; order?: 'asc' | 'desc' }
    | { value: string; order?: 'asc' | 'desc' }[]
    | string
    | null;
}

const enumConditions: { [key: string]: string } = {
  '==': '_eq',
  '<': '_lt',
  '<=': '_lte',
  '>': '_gt',
  '>=': '_gte',
  '!=': '_neq',
  like: '_like',
};
