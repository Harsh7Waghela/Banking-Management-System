// Base URL of your controller (@RequestMapping on AccountController)
const API = '/api/accounts';

const $ = (id) => document.getElementById(id);

function show(text) {
  $('msg').textContent = text;
}

// Fill the bank card with an account's details
function showCard(acc) {
  $('bal').textContent = '₹ ' + Number(acc.balance).toLocaleString('en-IN');
  $('who').textContent = acc.accountHolderName;
  $('idv').textContent = '#' + acc.id;
}

function resetCard() {
  $('bal').textContent = '₹ 0';
  $('who').textContent = 'No account';
  $('idv').textContent = '—';
}

// One helper that talks to the backend
async function send(path, method, body) {
  try {
    const res = await fetch(API + path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      show('Request failed. Check the account ID and amount.');
      return null;
    }
    const text = await res.text();
    try { return JSON.parse(text); } catch (e) { return text; }
  } catch (e) {
    show('Cannot reach the server. Is the app running?');
    return null;
  }
}

async function createAccount() {
  const name = $('nm').value.trim();
  const balance = $('ib').value;
  if (!name || balance === '') return show('Enter a holder name and initial balance.');

  const acc = await send('', 'POST', { accountHolderName: name, balance: Number(balance) });
  if (acc) { showCard(acc); show('Account created'); }
}

async function checkAccount() {
  const id = $('aid').value;
  if (!id) return show('Enter an account ID.');

  const acc = await send('/' + id, 'GET');
  if (acc) { showCard(acc); show('Account found'); }
}

async function deposit() {
  const id = $('aid').value;
  const amount = Number($('amt').value);
  if (!id || amount <= 0) return show('Enter an account ID and an amount above 0.');

  const acc = await send('/' + id + '/deposit', 'PUT', { amount: amount });
  if (acc) { showCard(acc); show('Money deposited'); }
}

async function withdraw() {
  const id = $('aid').value;
  const amount = Number($('amt').value);
  if (!id || amount <= 0) return show('Enter an account ID and an amount above 0.');

  const acc = await send('/' + id + '/withdraw', 'PUT', { amount: amount });
  if (acc) { showCard(acc); show('Money withdrawn'); }
}

async function deleteAccount() {
  const id = $('aid').value;
  if (!id) return show('Enter an account ID.');
  if (!confirm('Delete account ' + id + '?')) return;

  const done = await send('/' + id, 'DELETE');
  if (done !== null) { resetCard(); show('Account deleted'); }
}
