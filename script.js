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

let rows = ''; // Для хранения объединенных данных
let allLeads = [];
let allTasks = [];

// Флаги для отслеживания окончания данных по лидам и задачам
let hasMoreLeads = true;
let hasMoreTasks = true;

// Функция для получения данных по лидерам
function fetchLeads() {
  const url = new URL(baseUrls[0]);
  const params = new URLSearchParams({ page: currentPage[0], limit: 3 });

  fetch(`${url}?${params}`, {
    method: 'GET',
    headers: headers,
    redirect: 'follow',
  })
    .then(response => response.json())
    .then(data => {
      allLeads = data._embedded.leads; // Сохраняем лидов
      if (data._links && data._links.next) {
        currentPage[0]++; // Увеличиваем страницу для лидов, если есть следующая страница
      } else {
        hasMoreLeads = false; // Устанавливаем флаг, что данных больше нет
      }
      checkAndRender(); // Проверяем и выводим, если есть данные из обеих ссылок
    })
    .catch(error => console.error('Ошибка получения лидов:', error));
}

// Функция для получения данных по задачам
function fetchTasks() {
  const url = new URL(baseUrls[1]);
  const params = new URLSearchParams({ page: currentPage[1], limit: 3 });

  fetch(`${url}?${params}`, {
    method: 'GET',
    headers: headers,
    redirect: 'follow',
  })
    .then(response => response.json())
    .then(data => {
      allTasks = data._embedded.tasks; // Сохраняем задачи
      if (data._links && data._links.next) {
        currentPage[1]++; // Увеличиваем страницу для задач, если есть следующая страница
      } else {
        hasMoreTasks = false; // Устанавливаем флаг, что данных больше нет
      }
      checkAndRender(); // Проверяем и выводим, если есть данные из обеих ссылок
    })
    .catch(error => console.error('Ошибка получения задач:', error));
}

// Функция для сопоставления данных и рендеринга
function checkAndRender() {
  if (allLeads.length && allTasks.length) {
    allLeads.forEach(( lead, index ) => {
      // Находим задачи, связанные с этим лидом
      const task = allTasks[index];
      const tasksForLead = allTasks.filter(task => task.lead_id === lead.id);

      rows += `
      <div class="accordion">
        <button class="menu-button">
          <p>Lead: ${lead.name}</p>
          <p>Price: ${lead.price}</p>
          <p>Lead ID: ${lead.id}</p>
          <span class="icon">&plus;</span>
        </button>
        <div class="content">
        ${task ? `<p>ID Задачи: ${task.id}</p>` : '<p>Нет задач</p>'}
        </div>
      </div>
      `;
      console.log(allTasks)
    });

    document.getElementById('tableRows').innerHTML = rows;

    // Добавляем функционал для аккордеонов
    const menuBtns = document.querySelectorAll(".menu-button");
    menuBtns.forEach(menuBtn => {
      menuBtn.addEventListener("click", function () {
        const activeAccordion = document.querySelector(".menu-button.open");
        if (activeAccordion && activeAccordion !== this) {
          activeAccordion.nextElementSibling.style.display = 'none';
          activeAccordion.nextElementSibling.style.height = '0'; // Set height to 0 when closed
          activeAccordion.classList.remove("open");
        }

        this.classList.toggle("open");
        const content = this.nextElementSibling;
        if (this.classList.contains("open")) {
          content.style.display = 'block';
          content.style.height = 'auto';
        } else {
          content.style.display = 'none';
          content.style.height = '0';
        }
      });
    });

    // Останавливаем обновление, если больше нет данных для обеих ссылок
    if (!hasMoreLeads && !hasMoreTasks) {
      clearInterval(timeInterval); // Остановка периодических запросов
    }
  }
}

// Таймер для периодических запросов
const timeInterval = setInterval(function () {
  if (hasMoreLeads) fetchLeads();
  if (hasMoreTasks) fetchTasks();
}, 1000);