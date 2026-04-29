const API_KEY = "cc193bdb0458f9fc5066ab95c1ea5170";

const cityInput = document.getElementById("cityInput");
const weatherBtn = document.getElementById("weatherBtn");
const currentWeather = document.getElementById("currentWeather");
const forecastBox = document.getElementById("forecast");

weatherBtn.addEventListener("click", function () {
  const city = cityInput.value.trim();

  if (city === "") {
    currentWeather.innerHTML = "<p>Wpisz nazwę miasta.</p>";
    forecastBox.innerHTML = "";
    return;
  }

  getCurrentWeather(city);
  getForecast(city);
});

function getCurrentWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

  const xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);

  xhr.onload = function () {
    if (xhr.status === 200) {
      const data = JSON.parse(xhr.responseText);
      console.log("Current weather:", data);
      showCurrentWeather(data);
    } else {
      currentWeather.innerHTML = "<p>Nie znaleziono miasta.</p>";
    }
  };

  xhr.onerror = function () {
    currentWeather.innerHTML = "<p>Błąd połączenia z API.</p>";
  };

  xhr.send();
}

function showCurrentWeather(data) {
  currentWeather.innerHTML = `
        <h2>${data.name}</h2>
        <p><strong>Temperatura:</strong> ${Math.round(data.main.temp)}°C</p>
        <p><strong>Odczuwalna:</strong> ${Math.round(data.main.feels_like)}°C</p>
        <p><strong>Pogoda:</strong> ${data.weather[0].description}</p>
        <p><strong>Wilgotność:</strong> ${data.main.humidity}%</p>
        <p><strong>Wiatr:</strong> ${data.wind.speed} m/s</p>
    `;
}

function getForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric&lang=pl`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error("Błąd pobierania prognozy");
      }
      return response.json();
    })
    .then(data => {
      console.log("Forecast:", data);
      showForecast(data);
    })
    .catch(error => {
      forecastBox.innerHTML = "<p>Nie udało się pobrać prognozy.</p>";
      console.error(error);
    });
}


  function showForecast(data) {
    forecastBox.innerHTML = "";

    data.list.forEach(item => {
      const date = new Date(item.dt_txt);

      const card = document.createElement("div");
      card.className = "forecast-card";

      card.innerHTML = `
      <h3>${date.toLocaleDateString("pl-PL")}</h3>
      <p><strong>Godzina:</strong> ${date.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit"
      })}</p>
      <p>${item.weather[0].description}</p>
      <p><strong>${Math.round(item.main.temp)}°C</strong></p>
      <p>Odczuwalna: ${Math.round(item.main.feels_like)}°C</p>
      <p>Wilgotność: ${item.main.humidity}%</p>
      <p>Wiatr: ${item.wind.speed} m/s</p>
    `;

      forecastBox.appendChild(card);
    });
}
