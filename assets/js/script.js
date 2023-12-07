var currentWeatherEl = document.getElementById("current-weather");
var forecastEl = document.getElementById("card-container");

const units = "imperial";
const unitSuffix = "°F";


function urlByCoords(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`;
}
function urlByCity(city) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${city}&units=${units}&appid=${API_KEY}`;  
}

function saveQuery(key, queryJSON) {
    localStorage.setItem(key, JSON.stringify(queryJSON));
}

// Either returns a json object parsed from a string or null.
// Returns null when the key wasn't found in local storage i.e.
// the query has not been made before
function loadCachedQuery(key) {
    return JSON.parse(localStorage.getItem(key));
}

function getIconURL(iconString) {
    return `https://openweathermap.org/img/wn/${iconString}@2x.png`
}

function capitalizeString(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderCurrentWeather(city, data) {
    console.log("icon: ", data);
    document.getElementById("current-weather").innerHTML = `
        <div id="text">
            <h2>${capitalizeString(city)} (${dayjs.unix(data.dt).format("dddd - MM/DD/YYYY")})</h2>
            <p>
                Current Temperature: ${data.main.temp}${unitSuffix}
            </p>
            <p>
                High Temperature: ${data.main.temp_max}${unitSuffix}
            </p>
            <p>
                Low Temperature: ${data.main.temp_min}${unitSuffix}
            </p>
            <p>
                Humidity: ${data.main.humidity}%
            </p>
        </div>
        <div id="image">
            <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" width=100 height=100>
        </div>
        `
        ;
}

function renderFiveDayForecast(data) {
    console.log(data.list);
    var days = [];

    // These three variables are a running average of the forecast
    // weather conditions at each 3 hour interval
    var tempAvg = 0;
    var windAvg = 0;
    var humidityAvg = 0;
    var date;

    for (let day=0; day<5; day++) {
        
        for (let n=0; n<8; n++) {
            var d = data.list[8*day + n];
            date = dayjs(d.dt_txt.split(' ')[0]).format('MM/DD/YYYY');
            tempAvg += d.main.temp;
            windAvg += d.wind.speed;
            humidityAvg += d.main.humidity;
        }
        tempAvg /= 8;
        windAvg /= 8;
        humidityAvg /= 8;

        document.getElementById(`day${day+1}`).innerHTML = `
        <h2>(${date})</h2>
        <div>
            <p>Temp: ${tempAvg.toFixed(2)} ${unitSuffix}</p>
            <p>Wind: ${windAvg.toFixed(2)} mph</p>
            <p>Humidity: ${humidityAvg.toFixed(0)} %</p>
        </div>
        <div>
            <img src="${getIconURL(d.weather[0].icon)}" width=100 height=100>
        </div>
        `;
    }



    /*
    for (let i=1; i<data.list.length+1; i++) {
        var d = data.list[i-1];
        var date = dayjs(d.dt_txt.split(' ')[0]).format('MM/DD/YYYY');
        if (!days.includes(date)) {
            console.log("avg temp = ", tempAvg);
            days.push(date);
            tempAvg = d.main.temp;
            windAvg = d.wind.spped;
            humidityAvg = d.main.humidity;
        } else {
            //tempAvg = (((i%8 + 1) * tempAvg) + d.main.temp) / ((i%8)+2);
            console.log(i);
        }
    }
    console.log("days = ", days);
    */
}


function renderWeatherAPI(city) {
    fetch(urlByCity(city)).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                console.log(`The city: ${city} was found at ${lat} latitude and ${lon} longitude`);
                fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${API_KEY}`).then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            renderCurrentWeather(city, data);
                        });
                    }
                });


                fetch(urlByCoords(lat, lon)).then(function(response) {
                    if (response.ok) {
                        response.json().then(function(data) {
                            console.log(`Data has been loaded from the API for ${city}`);
                            renderFiveDayForecast(data);
                        });
                    }
                });
            });
        }
    });
}

function renderWeatherCache(city) {
    renderCurrentWeather(city, localStorage.getItem(city));
}



// Helper function for determining if a cached query is >1hr old and therefore
// the API has since replaced the cached data. If the cached query is younger than
// 1hr old then no API query is made and simply what the user gets back is the
// cached query in local storage
function isTimeToRefresh(cachedTime) {
    return (dayjs().unix() - cachedTime) >= 3600;
}

var queryCache = {};
function loadCachedQueries() {
    for (let i=0; i<localStorage.length; i++) {
        queryCache[localStorage.key(i)] = localStorage[i];
    }
}






function getData(city) {
    city = city.toLowerCase().trim();
    console.log(`Attempting to fetch data for the city of ${city}`);
    if (!Object.hasOwn(queryCache, city)) {
        console.log(`The city of ${city} does not have data in the cache.`)
        queryAPI(city);
    } else {
        console.log(`Data for ${city} is already cached. Attempting to use cached data`);
    }
    let cityData = localStorage.getItem(city);
    console.log(cityData);
    let queryData = JSON.parse();
    console.log(queryData.dt);
    if (isTimeToRefresh(queryData.dt)) {
        console.log("The data appears to be old")
    }
}

renderWeatherAPI("chicago");
// loadCachedQueries();
//console.log(queryAPI(`http://api.openweathermap.org/geo/1.0/direct?q=chicago&limit=1&appid=${API_KEY}`));

/*
    var coords = getCoords(city);
    console.log(coords);
    var lat = coords[0];
    var lon = coords[1];
    console.log(`lat = ${lat}`);
    console.log(`lon = ${lon}`);
    var queryCoordsURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    return fetch(queryCoordsURL).then(function(response) {
        return response.json().then(function(data) {
            console.log(`Data has been loaded from the API for ${city}`);
            return data;
        });
    });
*/
