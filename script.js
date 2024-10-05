const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZjYTJjMDViZmE1MDVkYzhhZGIzODQxYzkxOTA0YzNmYzZhOTczN2ZmNTM1MzA2ZDlmMDgzNmNjMWY3YjNkNGJmMTQwOWQwNWRlODVmODQ1In0.eyJhdWQiOiIwODk0MWE2ZS1iMGVkLTRhYWQtOWU2OS0yYmRhNTQ4YTcwZWMiLCJqdGkiOiJmY2EyYzA1YmZhNTA1ZGM4YWRiMzg0MWM5MTkwNGMzZmM2YTk3MzdmZjUzNTMwNmQ5ZjA4MzZjYzFmN2IzZDRiZjE0MDlkMDVkZTg1Zjg0NSIsImlhdCI6MTcyODA2MTM0NiwibmJmIjoxNzI4MDYxMzQ2LCJleHAiOjE3MzA4NTEyMDAsInN1YiI6IjExNTgxODQyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTc5MzQ2LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNDgwNTk2M2QtMWQ1Ny00MWRmLThjNDQtMDlkZTIwZDI4ZDZjIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.NRd3efey5ZaxC6B3T12VMQTqNdzhnGOkg5HzeECBZiiGarDrUa7GAewiw-qMkGTqQqPAYFobwsP-NiTkPWWUON-Hn9VIMu2t1nFDL27w903DAI8IgL4B8LjnriwaFLvee2anR28SLYIkYDatKuRM7XPyNv4HNtohvxK_9H_Ldh7JwNjxGRdCQfnYeMUzdPenJiY7JEuK8mP8PreBLXXpUaAUIRoxI5VaRCssAbpBnBRQUFC0UO6IxlHRAZbbAw9wit1et6XSKysR_NQJJHWUkqbKFts00EJRYH8EQjpzsgqLdgMrCSPU1BHwX5-S99zyPmjJwWuFmhSGMqalbB8P7A';
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'content-type': 'application/json',
};
let preloader;
let currentPage = [1, 1];

const baseUrls = [
  'http://localhost:8010/proxy/api/v4/leads', 
  'http://localhost:8010/proxy/api/v4/tasks' 
];

let rows = ''; 
let allLeads = [];
let allTasks = [];

let hasMoreLeads = true;
let hasMoreTasks = true;

document.addEventListener("DOMContentLoaded", function() {
  preloader = document.getElementById('preloader');
  console.log(preloader);
});

function fetchNextPage() {
  if (hasMoreLeads) {
    fetchLeads();
  } else if (hasMoreTasks) {
    fetchTasks();
  } else {
    clearInterval(timeInterval);
    renderData();
  }
}

const timeInterval = setInterval(fetchNextPage, 1000);

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
      allLeads = [...allLeads, ...data._embedded.leads];
      if (data._links && data._links.next) {
        currentPage[0]++;
      } else {
        hasMoreLeads = false;
      }
      if (hasMoreTasks) fetchTasks();
    })
    .catch(error => console.error('Ошибка получения лидов:', error));
}

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
      allTasks = [...allTasks, ...data._embedded.tasks];
      if (data._links && data._links.next) {
        currentPage[1]++;
      } else {
        hasMoreTasks = false;
      }
    })
    .catch(error => console.error('Ошибка получения задач:', error));
}

let rowsArray = [];
function renderData() {
  let newRows = ''; 
  rowsArray = [];
  allLeads.forEach((lead, index) => {
    const task = allTasks[index];
    const tasksForLead = allTasks.filter(task => task.lead_id === lead.id);
    function pad(number) {
      return (number < 10 ? '0' : '') + number;
    }

    const createdAtDate = new Date(task.complete_till * 1000);
    const formattedDate = `${pad(createdAtDate.getDate())}.${pad(createdAtDate.getMonth() + 1)}.${createdAtDate.getFullYear()}`;
    const currentDate = new Date();

    
    rowsArray.push(`
      <div class="accordion">
        <button class="menu-button">
          <p>Название: ${lead.name}</p>
          <p>Цена: ${lead.price}</p>
          <p>Lead ID: ${lead.id}</p>
          <span class="icon">&plus;</span>
        </button>
        <div class="content">
        ${task ? `<p>ID Задачи: ${task.id}</p><p>Текст задачи: ${task.text}</p><p>Сделать до: ${formattedDate} </p><p>Статус ближайшей задачи: 
          ${(() => {
          const currentDate = new Date();
          if (createdAtDate.getFullYear() === currentDate.getFullYear() && createdAtDate.getMonth() === currentDate.getMonth()) {
            if (createdAtDate.getDate() === currentDate.getDate()) {
              return '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><circle fill="#78B159" cx="18" cy="18" r="18"></circle></svg>';
            } else if (createdAtDate.getDate() === currentDate.getDate() - 1) {
              return '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><circle fill="#DD2E44" cx="18" cy="18" r="18"></circle></svg>';
            }
          }
          return '<svg width="20px" height="20px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><circle fill="#FDCB58" cx="18" cy="18" r="18"></circle></svg>';
        })()}
        </p>` : '<p>Нет задач</p>'}
        </div>
      </div>
      `);
    console.log(allTasks)
  });
  rows = rowsArray.join('');
  document.getElementById('tableRows').innerHTML = rows;

  const menuBtns = document.querySelectorAll(".menu-button");
  menuBtns.forEach(menuBtn => {
    menuBtn.addEventListener("click", function () {
      const activeAccordion = document.querySelector(".menu-button.open");
      if (activeAccordion && activeAccordion !== this) {
        activeAccordion.nextElementSibling.style.display = 'none';
        activeAccordion.nextElementSibling.style.height = '0';
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

  if (!hasMoreLeads && !hasMoreTasks) {
    clearInterval(timeInterval); 
  }
  preloader.style.display = 'none';
}