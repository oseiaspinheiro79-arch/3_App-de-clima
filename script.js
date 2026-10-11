const campoCidade = document.getElementById("campoCidade");
const botaoBuscar = document.getElementById("botaoBuscar");
const resultado = document.getElementById("resultado");
const listaCidades = document.getElementById("listaCidades");
const distancias = document.getElementById("distancias");

const cidades = [];

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const raioTerra = 6371;

  function paraRadianos(graus) {
    return (graus * Math.PI) / 180;
  }

  const dLat = paraRadianos(lat2 - lat1);
  const dLon = paraRadianos(lon2 - lon1);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.cos(paraRadianos(lat1)) *
      Math.cos(paraRadianos(lat2)) *
      Math.pow(Math.sin(dLon / 2), 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return raioTerra * c;
}

function mostrarDistancias() {
  distancias.innerHTML = "";

  const escolhidas = cidades.filter(function (cidade) {
    return cidade.selecionada;
  });

  if (escolhidas.length < 2) {
    distancias.textContent = "Selecione 2 ou mais cidades para ver as distâncias.";
    return;
  }

  for (let i = 0; i < escolhidas.length; i++) {
    for (let j = i + 1; j < escolhidas.length; j++) {
      const a = escolhidas[i];
      const b = escolhidas[j];

      const km = calcularDistancia(a.latitude, a.longitude, b.latitude, b.longitude);

      const linha = document.createElement("p");
      linha.textContent = a.nome + " → " + b.nome + ": " + km.toFixed(0) + " km";
      distancias.appendChild(linha);
    }
  }
}

function mostrarCidades() {
  listaCidades.innerHTML = "";

  cidades.forEach(function (cidade) {
    const cartao = document.createElement("div");
    cartao.className = "cartao";

    const caixa = document.createElement("input");
    caixa.type = "checkbox";
    caixa.checked = cidade.selecionada;

    caixa.addEventListener("change", function () {
      cidade.selecionada = caixa.checked;
      mostrarDistancias();
    });

    const texto = document.createElement("span");
    texto.textContent =
      " " + cidade.nome + " (" + cidade.pais + "): " +
      cidade.temperatura + "°C, vento " + cidade.vento + " km/h";

    const botaoRemover = document.createElement("button");
    botaoRemover.textContent = "Remover";

    botaoRemover.addEventListener("click", function () {
      const posicao = cidades.indexOf(cidade);
      cidades.splice(posicao, 1);
      mostrarCidades();
      mostrarDistancias();
    });

    cartao.appendChild(caixa);
    cartao.appendChild(texto);
    cartao.appendChild(botaoRemover);
    listaCidades.appendChild(cartao);
  });
}

async function buscarClima() {
  const cidade = campoCidade.value;

  if (cidade === "") {
    return;
  }

  resultado.textContent = "Buscando...";

  try {
    const respostaCidade = await fetch(
      "https://geocoding-api.open-meteo.com/v1/search?name=" +
        encodeURIComponent(cidade) +
        "&count=1&language=pt"
    );
    const dadosCidade = await respostaCidade.json();

    if (!dadosCidade.results) {
      resultado.textContent = "Cidade não encontrada.";
      return;
    }

    const lugar = dadosCidade.results[0];

    const jaExiste = cidades.some(function (c) {
      return c.latitude === lugar.latitude && c.longitude === lugar.longitude;
    });

    if (jaExiste) {
      resultado.textContent = "Essa cidade já está na lista.";
      return;
    }

    const respostaClima = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        lugar.latitude +
        "&longitude=" +
        lugar.longitude +
        "&current=temperature_2m,wind_speed_10m"
    );
    const dadosClima = await respostaClima.json();

    cidades.push({
      nome: lugar.name,
      pais: lugar.country,
      latitude: lugar.latitude,
      longitude: lugar.longitude,
      temperatura: dadosClima.current.temperature_2m,
      vento: dadosClima.current.wind_speed_10m,
      selecionada: true
    });

    resultado.textContent = "";
    campoCidade.value = "";
    mostrarCidades();
    mostrarDistancias();
  } catch (erro) {
    resultado.textContent = "Erro ao buscar o clima.";
  }
}

botaoBuscar.addEventListener("click", buscarClima);

campoCidade.addEventListener("keydown", function (evento) {
  if (evento.key === "Enter") {
    buscarClima();
  }
});

mostrarDistancias();