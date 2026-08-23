const BASE = 'http://localhost:8000';

const res = http.post(BASE + '/api/auth/request-code', {
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: output.email }),
});

if (res.status !== 200) {
  throw new Error('request-code respondió ' + res.status + ' → ' + res.body);
}

const data = json(res.body);

if (!data.devCode) {
  throw new Error(
    'El backend no devolvió devCode. Revisa MAIL_DRIVER=stub y NODE_ENV!=production.',
  );
}

output.code = data.devCode;
