const inputCidade = document.getElementById('cidade-input');
const form = document.getElementById('clima-form');
const resultado = document.getElementById('clima-resultado');
const btnBuscar = document.getElementById('btn-buscar');
const btnNovaPesquisa = document.getElementById('btn-nova-pesquisa');

function buscarClima(cidade) {
    const apiKey = 'd238359b99b0e98124b8711631da5c25';
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidade)}&appid=${apiKey}&units=metric&lang=pt_br`;

    resultado.textContent = 'Carregando...';

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Cidade não encontrada');
            return response.json();
        })
        .then(data => {
            const temperatura = data.main.temp.toFixed(1);
            const descricao = data.weather[0].description;
            const iconCode = data.weather[0].icon;
            const body = document.body;

            resultado.innerHTML = `
                <div class="clima-container">
                    <img class="clima-icon" src="http://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${descricao}" />
                    <div class="clima-texto">
                        <p>Clima em <strong>${cidade}</strong>: ${temperatura}°C, ${descricao}.</p>
                    </div>
                </div>
            `;

            inputCidade.style.display = 'none';
            btnBuscar.style.display = 'none';
            btnNovaPesquisa.style.display = 'inline-block';
        })
        .catch(err => {
            resultado.textContent = err.message;
            document.body.className = '';
        });
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    const cidade = inputCidade.value.trim();
    if (cidade === '') {
        resultado.textContent = 'Por favor, digite o nome de uma cidade';
        return;
    }
    buscarClima(cidade);
});

btnNovaPesquisa.addEventListener('click', () => {
    resultado.textContent = 'Informe uma cidade para ver o clima.';
    document.body.className = '';

    inputCidade.style.display = 'inline-block';
    btnBuscar.style.display = 'inline-block';

    btnNovaPesquisa.style.display = 'none';

    inputCidade.value = '';
    inputCidade.focus();
});
