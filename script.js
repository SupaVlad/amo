// Долгосрочныq токен
const link = 'http://localhost:8010/proxy/api/v4/account';
const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImZjYTJjMDViZmE1MDVkYzhhZGIzODQxYzkxOTA0YzNmYzZhOTczN2ZmNTM1MzA2ZDlmMDgzNmNjMWY3YjNkNGJmMTQwOWQwNWRlODVmODQ1In0.eyJhdWQiOiIwODk0MWE2ZS1iMGVkLTRhYWQtOWU2OS0yYmRhNTQ4YTcwZWMiLCJqdGkiOiJmY2EyYzA1YmZhNTA1ZGM4YWRiMzg0MWM5MTkwNGMzZmM2YTk3MzdmZjUzNTMwNmQ5ZjA4MzZjYzFmN2IzZDRiZjE0MDlkMDVkZTg1Zjg0NSIsImlhdCI6MTcyODA2MTM0NiwibmJmIjoxNzI4MDYxMzQ2LCJleHAiOjE3MzA4NTEyMDAsInN1YiI6IjExNTgxODQyIiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxOTc5MzQ2LCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiNDgwNTk2M2QtMWQ1Ny00MWRmLThjNDQtMDlkZTIwZDI4ZDZjIiwiYXBpX2RvbWFpbiI6ImFwaS1iLmFtb2NybS5ydSJ9.NRd3efey5ZaxC6B3T12VMQTqNdzhnGOkg5HzeECBZiiGarDrUa7GAewiw-qMkGTqQqPAYFobwsP-NiTkPWWUON-Hn9VIMu2t1nFDL27w903DAI8IgL4B8LjnriwaFLvee2anR28SLYIkYDatKuRM7XPyNv4HNtohvxK_9H_Ldh7JwNjxGRdCQfnYeMUzdPenJiY7JEuK8mP8PreBLXXpUaAUIRoxI5VaRCssAbpBnBRQUFC0UO6IxlHRAZbbAw9wit1et6XSKysR_NQJJHWUkqbKFts00EJRYH8EQjpzsgqLdgMrCSPU1BHwX5-S99zyPmjJwWuFmhSGMqalbB8P7A';
const headers = {
    'Authorization': `Bearer ${access_token}`
};

fetch(link, {
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
    console.log(data); 
})
.catch(error => {
    console.error('Ошибка:', error.message);
    console.error('Код ошибки:', error.cause);
});

