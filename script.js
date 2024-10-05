// Долгосрочный токен
const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZjYTJjMDViZmE1MDVkYzhhZGIzODQxYzkxOTA0YzNmYzZhOTczN2ZmNTM1MzA2ZDlmMDgzNmNjMWY3YjNkNGJmMTQwOWQwNWRlODVmODQ1In0.eyJhdWQiOiIwODk0MWE2ZS1iMGVkLTRhYWQtOWU2OS0yYmRhNTQ4YTcwZWMiLCJqdGkiOiJmY2EyYzA1YmZhNTA1ZGM4YWRiMzg0MWM5MTkwNGMzZmM2YTk3MzdmZjUzNTMwNmQ5ZjA4MzZjYzFmN2IzZDRiZjE0MDlkMDVkZTg1Zjg0NSIsImlhdCI6MTcyODA2MTM0NiwibmJmIjoxNzI4MDYxMzQ2LCJleHAiOjE3MzA4NTEyMDAsInN1YiI6IjExNTgxODQyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTc5MzQ2LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNDgwNTk2M2QtMWQ1Ny00MWRmLThjNDQtMDlkZTIwZDI4ZDZjIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.NRd3efey5ZaxC6B3T12VMQTqNdzhnGOkg5HzeECBZiiGarDrUa7GAewiw-qMkGTqQqPAYFobwsP-NiTkPWWUON-Hn9VIMu2t1nFDL27w903DAI8IgL4B8LjnriwaFLvee2anR28SLYIkYDatKuRM7XPyNv4HNtohvxK_9H_Ldh7JwNjxGRdCQfnYeMUzdPenJiY7JEuK8mP8PreBLXXpUaAUIRoxI5VaRCssAbpBnBRQUFC0UO6IxlHRAZbbAw9wit1et6XSKysR_NQJJHWUkqbKFts00EJRYH8EQjpzsgqLdgMrCSPU1BHwX5-S99zyPmjJwWuFmhSGMqalbB8P7A';
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'content-type': 'application/json',
};

let currentPage = [1, 1]; // Хранит номера страниц для двух ссылок

const baseUrls = [
  'http://localhost:8010/proxy/api/v4/leads', // первая ссылка
  'http://localhost:8010/proxy/api/v4/tasks' // вторая ссылка
];

let rows = ['', '']; // Для хранения данных из двух запросов

function fetchWithDynamicParams(baseUrl, paramsObj, index) {
  const url = new URL(baseUrl);
  const params = new URLSearchParams(paramsObj);

  fetch(`${url}?${params}`, {
    method: 'GET',
    headers: headers,
    redirect: 'follow',
  })
    .then(response => {
      const code = response.status;
      if (code < 200 || code > 204) {
        const errors = {
          400: 'Bad request',
          401: 'Unauthorized',
          403: 'Forbidden',
          404: 'Not found',
          500: 'Internal server error',
          502: 'Bad gateway',
          503: 'Service unavailable',
        };
        throw new Error(errors[code] || 'Undefined error', { cause: code });
      }
      return response.json();
    })
    .then(data => {
      console.log(data._embedded.leads || data._embedded.tasks); // Здесь нужно указать, как называется массив данных для второй ссылки

      // Определяем, какие данные обрабатывать в зависимости от индекса
      const leads = data._embedded.leads || data._embedded.tasks;
      leads.forEach(lead => {

        if (!rows[index]) {
          rows[index] = ''; // или можно задать любой другой базовый формат
        }
       //rows[index] += `<tr><td>${lead.name}</td><td>${lead.price}</td><td>${lead.id}</td></tr>`;  // Форматируем строки для вывода
       rows[index] += `
  <div class="accordion">
    <button class="menu-button">
      <p>${lead.name}</p>
      <p>${lead.price}</p>
      <p>${lead.id}</p>
      <span class="icon">&plus;</span>
    </button>
    <div class="content">
      ${index === 0 ? '' : data._embedded.tasks.map(task => `<p>${task.id}</p>`).join('')}
    </div>
  </div>
`;
      });

      // Обновляем HTML элемент для этой ссылки
      document.getElementById(`tableRows${index}`).innerHTML = rows[index];
      
      console.log(leads.length);

      // Проверяем, есть ли следующая страница
      if (data._links.next) {
        currentPage[index]++; // Увеличиваем номер страницы для текущей ссылки
      } else {
        clearInterval(timeInterval);
      }

      const menuBtns = document.querySelectorAll(".menu-button");

      menuBtns.forEach((menuBtn) => {
        menuBtn.addEventListener("click", function () {
          //----- open only one menu --------------
          const activeAccordion = document.querySelector(".menu-button.open");
          if (activeAccordion && activeAccordion !== this) {
            activeAccordion.nextElementSibling.style.height = 0;
            activeAccordion.classList.remove("open");
          }
          //------------------------------------------------

          this.classList.toggle("open");
          const content = this.nextElementSibling;
          if (this.classList.contains("open")) {
            content.style.height = content.scrollHeight + "px";
          } else {
            content.style.height = 0;
          }
        });
      });
      console.log(menuBtns)

    })
    .catch(error => {
      console.error('Ошибка:', error.message);
      console.error('Код ошибки:', error.cause);
      clearInterval(timeInterval);
    });
}

// Таймер для периодических запросов
const timeInterval = setInterval(function () {
  baseUrls.forEach((baseUrl, index) => {
    const dynamicParams = {
      page: currentPage[index],
      limit: 3
    };
    fetchWithDynamicParams(baseUrl, dynamicParams, index); // Передаем индекс для идентификации ссылки
  });
}, 1000);


