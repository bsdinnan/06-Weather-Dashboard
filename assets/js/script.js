document.getElementById('city-search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const city = document.getElementById('city-input').value;
    fetchWeatherData(city);
});

function fetchWeatherData(city) {
    const apiKey = '46953422f2ae7989db1c1b39868e0037';
    const geocodingApiUrl = 'https://api.openweathermap.org/geo/1.0/direct';
    const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    fetch(`${geocodingApiUrl}?q=${city}&appid=${apiKey}`)
        .then(response => response.json())
        .then(response => {
            const { lat, lon } = response[0];

            fetch(`${apiUrl}?lat=${lat}&lon=${lon}&units=imperial&cnt=5&appid=${apiKey}`)
                .then(response => response.json())
                .then(weatherData => {
                    updateWeatherUI(weatherData, city);
                    addToSearchHistory(city, weatherData);
                    console.log(weatherData);
                })
                .catch(error => {
                    console.error('Error fetching weather data: ', error);
                });
        })
        .catch(error => {
            console.error('Error fetching coordinates: ', error);
        });
}

function updateWeatherUI(data, city) {
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = '';

    for (let i = 0; i < data.list.length; i++) {
        const { dt_txt, main, weather, wind } = data.list[i];

        const card = document.createElement('div');
        card.classList.add('weather-card');

        if (city !== '') {
            const cityName = document.createElement('h2');
            cityName.textContent = city;
            card.appendChild(cityName);
        }

        const date = new Date(dt_txt);
        const options = {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        };
        const formattedDate = date.toLocaleDateString('en-US', options);

        const dateElement = document.createElement('p');
        dateElement.textContent = formattedDate;
        card.appendChild(dateElement);

        const weatherIcon = document.createElement('img');
        weatherIcon.src = `https://openweathermap.org/img/wn/${weather[0].icon}.png`;
        weatherIcon.alt = 'Weather Icon';
        card.appendChild(weatherIcon);

        const tempElement = document.createElement('p');
        tempElement.textContent = `Temperature: ${main.temp} °F`;
        card.appendChild(tempElement);

        const humidityElement = document.createElement('p');
        humidityElement.textContent = `Humidity: ${main.humidity}%`;
        card.appendChild(humidityElement);

        const windElement = document.createElement('p');
        windElement.textContent = `Wind Speed: ${wind.speed} m/s`;
        card.appendChild(windElement);

        weatherInfo.appendChild(card);
    }
}

function addToSearchHistory(city, weatherData) {
    const searchHistory = document.getElementById('search-history');
    const searchHistoryItems = JSON.parse(localStorage.getItem('searchHistory')) || {};

    searchHistoryItems[city] = weatherData;

    localStorage.setItem('searchHistory', JSON.stringify(searchHistoryItems));

    searchHistory.innerHTML = '';

    for (const cityName in searchHistoryItems) {
        if (searchHistoryItems.hasOwnProperty(cityName)) {
            const button = document.createElement('button');
            button.textContent = cityName;
            button.classList.add('search-history-button');
            button.addEventListener('click', () => updateWeatherUI(searchHistoryItems[cityName], cityName));
            searchHistory.appendChild(button);
        }
    }
}

window.addEventListener('load', function () {
    const searchHistoryItems = JSON.parse(localStorage.getItem('searchHistory'));

    if (searchHistoryItems && Object.keys(searchHistoryItems).length > 0) {
        addToSearchHistory(searchHistoryItems);
    }
});