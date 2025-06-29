const apiKey = '106d967e36fa30a0ad5a52702649bc4d'; // Replace with your OpenWeatherMap API key

        async function getWeather(options) {
            let url;
            if (options.city) {
                url = `https://api.openweathermap.org/data/2.5/weather?q=${options.city}&appid=${apiKey}&units=metric`;
            } else if (options.lat && options.lon) {
                url = `https://api.openweathermap.org/data/2.5/weather?lat=${options.lat}&lon=${options.lon}&appid=${apiKey}&units=metric`;
            } else {
                document.getElementById('weather-info').innerHTML = `<p>Please provide a city or enable location access.</p>`;
                return;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('City not found or invalid API key');
                const data = await response.json();
                const weatherInfo = `
                    <h2>${data.name}</h2>
                    <p>Temperature: ${data.main.temp}°C</p>
                    <p>Feels Like: ${data.main.feels_like}°C</p>
                    <p>Weather: ${data.weather[0].description}</p>
                    <p>Humidity: ${data.main.humidity}%</p>
                    <p>Wind Speed: ${data.wind.speed} m/s</p>
                `;
                document.getElementById('weather-info').innerHTML = weatherInfo;
                getForecast(options);
            } catch (error) {
                document.getElementById('weather-info').innerHTML = `<p>${error.message}. Please check your API key or try again.</p>`;
            }
        }

        async function getForecast(options) {
            let url;
            if (options.city) {
                url = `https://api.openweathermap.org/data/2.5/forecast?q=${options.city}&appid=${apiKey}&units=metric`;
            } else if (options.lat && options.lon) {
                url = `https://api.openweathermap.org/data/2.5/forecast?lat=${options.lat}&lon=${options.lon}&appid=${apiKey}&units=metric`;
            } else {
                return;
            }

            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error('Forecast not found');
                const data = await response.json();
                const forecastsByDay = {};
                data.list.forEach(forecast => {
                    const date = new Date(forecast.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    if (!forecastsByDay[date]) {
                        forecastsByDay[date] = {
                            date: date,
                            temps: [forecast.main.temp],
                            description: forecast.weather[0].description
                        };
                    } else {
                        forecastsByDay[date].temps.push(forecast.main.temp);
                    }
                });

                const forecastHtml = Object.values(forecastsByDay).slice(0, 5).map(day => `
                    <li class="forecast-item">
                        <h3>${day.date}</h3>
                        <p>Min: ${Math.min(...day.temps).toFixed(1)}°C</p>
                        <p>Max: ${Math.max(...day.temps).toFixed(1)}°C</p>
                        <p>${day.description}</p>
                    </li>
                `).join('');
                document.getElementById('forecast-list').innerHTML = forecastHtml;
            } catch (error) {
                document.getElementById('forecast-list').innerHTML = `<p>${error.message}</p>`;
            }
        }

        async function getWeatherByLocation() {
            if (!navigator.geolocation) {
                document.getElementById('weather-info').innerHTML = `<p>Geolocation is not supported by your browser.</p>`;
                return;
            }
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    getWeather({ lat: latitude, lon: longitude });
                },
                error => {
                    document.getElementById('weather-info').innerHTML = `<p>Location access denied. Please enter a city name.</p>`;
                }
            );
        }