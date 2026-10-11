const campoCidade = document.getElementById("campoCidade");
const botaoBuscar = document.getElementById("botaoBuscar");
const resultado = document.getElementById("resultado");

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

    const respostaClima = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=" +
        lugar.latitude +
        "&longitude=" +
        lugar.longitude +
        "&current=temperature_2m,wind_speed_10m"
    );
    const dadosClima = await respostaClima.json();

    resultado.textContent =
      lugar.name +
      ": " +
      dadosClima.current.temperature_2m +
      "°C, vento " +
      dadosClima.current.wind_speed_10m +
      " km/h";
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