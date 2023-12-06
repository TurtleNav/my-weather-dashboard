const lat = "40.78";
const lon = "-73.88";
var queryURL = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
const baseURL = "http://api.openweathermap.org/data/2.5/weather";


var currentWeatherEl = document.getElementById("current-weather");


// console.log(fetch(queryURL);

var units = {
    standard: "standard",
    metric: "metric",
    imperial: "imperial"
}

const unitSuffix = {
    standard: "K",
    metric: "°C",
    imperial: "°F"
}


var baseUnits = Object();
function setBaseUnit(unit) {
    switch (unit) {
        case units.metric:
            baseUnits.units = units.metric;
            baseUnits.unitSuffix = unitSuffix.metric;
            break;
        case units.imperial:
            baseUnits.units = units.imperial;
            baseUnits.unitSuffix = unitSuffix.imperial;
            break;
        default:
            baseUnits.units = units.standard;
            baseUnits.unitSuffix = unitSuffix.standard;
    }
}

setBaseUnit(units.imperial);

function constructQueryByCoords(lat, lon) {
    return `${baseURL}?lat=${lat}&lon=${lon}&units=${baseUnits.units}&appid=${API_KEY}`;
}
function constructQuery(city) {
    return `${baseURL}?q=${city}&units=${baseUnits.units}&appid=${API_KEY}`;  
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
    return `https://openweathermap.org/img/wn/${iconString}2x.png`
}



function renderCurrentWeather(city, data, units) {
    document.getElementById("current-weather").innerHTML = `
        <h2>${city} (${dayjs.unix(data.dt).format("dddd - MM/DD/YYYY")})</h2>
        <p>
            Current Temperature: ${data.main.temp}${[unitSuffix[units]]}
        </p>
        <p>
            High Temperature: ${data.main.temp_max}${[unitSuffix[units]]}
        </p>
        <p>
            Low Temperature: ${data.main.temp_min}${[unitSuffix[units]]}
        </p>
        <p>
            Humidity: ${data.main.humidity}%
        </p>
        ${data.next_update}

        `
        ;
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

function queryAPI(city) {
    fetch(constructQuery(city)).then(function(response) {
        if (response.ok) {
            response.json().then(function(data) {
                console.log("Data has been loaded from the API");
                localStorage.setItem(city, JSON.stringify(data));
            });
        }
    });
}


function getData(city) {
    city = city.toLowerCase().trim();
    if (!Object.hasOwn(queryCache, city)) {
        queryAPI();
    } else {
        console.log("Data is being loaded from the cache");
    }
    var queryData = JSON.parse(localStorage.getItem(city));



}
loadCachedQueries();
getData("Chicago");
/*
queryAPI(constructQueryByCoords(lat, lon));
var cityname = "nyc"
renderCurrentWeather(cityname, loadCachedQuery(cityname), "imperial");
*/
