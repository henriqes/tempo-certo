// elementos do DOM
const inputCidade = document.getElementById('cidade-input');
const form = document.getElementById('clima-form');
const resultado = document.getElementById('clima-resultado');
const btnBuscar = document.getElementById('btn-buscar');
const tempUnitSelect = document.getElementById('tempUnit');

// CONFIGURAÇÕES
const API_KEY = 'd238359b99b0e98124b8711631da5c25';
const STORAGE_KEY = 'historicoPesquisas';''
const STORAGE_UNIT_KEY = 'tempUnitPref';
const MAX_HISTORICO = 4;

// states
const state ={
  tempCelsius: null,
  sensacaoFormatada: null,
  cityName: '',
  desc: '',
  iconCode: '',
}

// utilitários
function celsiusToFahrenheit(c) {
  return (c * 9/5) + 32;
}

function formatTemp(celsius, unit) {
  const c = Number(celsius);
  if (Number.isNaN(c)) return '--';
  return unit === 'fahrenheit'
  ? `${celsiusToFahrenheit(c).toFixed(1)} °F`
  : `${c.toFixed(1)} °C`;
}

/* ---------------- histórico ---------------- */

function lerHistorico() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function salvarHistoricoArray(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function salvarPesquisa(cityEntry) {
  let historico = lerHistorico();
  const idx = historico.findIndex(h => h.toLowerCase() === cityEntry.toLowerCase());
  
  if (idx !== -1) historico.splice(idx, 1);
  historico.unshift(cityEntry); // adiciona no começo

  if (historico.length > MAX_HISTORICO) historico = historico.slice(0, MAX_HISTORICO); // limite de 4 itens

  salvarHistoricoArray(historico);
  mostrarHistorico();
}

function mostrarHistorico() {
  const historico = lerHistorico();
  listaHistorico.innerHTML = '';

  if (historico.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma pesquisa ainda';
    li.style.opacity = '0.7';
    li.style.cursor = 'default';
    listaHistorico.appendChild(li);
    return;
  }

  historico.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city;
    li.tabIndex = 0; // acessível via teclado
    li.addEventListener('click', () => buscarClima(city));
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') buscarClima(city);
    });
    listaHistorico.appendChild(li);
  });
}

// render - UI

function mostrarResultadoNaUI() {
  if (state.tempCelsius === null) return;

  // lê a unidade preferida (ou usa a selecionada)
  const unit = localStorage.getItem(STORAGE_UNIT_KEY) || tempUnitSelect.value;
  tempUnitSelect.value = unit;

  const tempFormatada = formatTemp(state.tempCelsius, unit);
  const sensacaoFormatada= formatTemp(state.sensacaoFormatada, unit);

  resultado.innerHTML = `
    <div class="clima-container">
      <img class="clima-icon" src="http://openweathermap.org/img/wn/${state.iconCode}@2x.png" alt="${state.desc}" />
      <div class="clima-texto">
        <p>Clima em <strong>${state.cityName}</strong>: ${tempFormatada}, ${state.desc}.</p>
        <p>Sensação térmica: ${sensacaoFormatada}</p>
      </div>
    </div>
  `;
}

// API
async function buscarClima(cidade) {
  const q = encodeURIComponent(cidade);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&appid=${API_KEY}&units=metric&lang=pt_br`;

  try {
    resultado.textContent = 'Carregando...';
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) throw new Error('Cidade não encontrada');
      if (response.status === 401) throw new Error('Chave de API inválida');
      throw new Error('Erro na API');
    }

    const data = await response.json();

    state.tempCelsius = data.main.temp;
    state.sensacaoFormatada = data.main.feels_like;
    state.desc = data.weather[0].description;
    state.iconCode = data.weather[0].icon;
    state.cityName = `${data.name}, ${data.sys.country}`;

    salvarPesquisa(state.cityName);

    const prefUnit = localStorage.getItem(STORAGE_UNIT_KEY) || tempUnitSelect.value;
    tempUnitSelect.value = prefUnit;
    localStorage.setItem(STORAGE_UNIT_KEY, prefUnit);

    mostrarResultadoNaUI();
  } catch (err) {
    resultado.textContent = err.message || 'Erro ao buscar o clima';
  }
}

/* ---------------- eventos ---------------- */
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const cidade = inputCidade.value.trim();
  if (cidade === '') {
    resultado.textContent = 'Por favor, digite o nome de uma cidade';
    return;
  }
  buscarClima(cidade);
});

// muda a unidade --> salva preferência --> atualiza a exibição (sem refazer requisição)
tempUnitSelect.addEventListener('change', () => {
  const unit = tempUnitSelect.value;
  localStorage.setItem(STORAGE_UNIT_KEY, unit);
  if (state.tempCelsius !== null) mostrarResultadoNaUI();
});

// carrega histórico e preferências
window.addEventListener('DOMContentLoaded', () => {
  const savedUnit = localStorage.getItem(STORAGE_UNIT_KEY);
  if (savedUnit) tempUnitSelect.value = savedUnit;
  mostrarHistorico();
});
