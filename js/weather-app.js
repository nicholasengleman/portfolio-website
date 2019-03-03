//* ***********************************************
//* ********Event triggers for main functions
//* ***********************************************

// put in timezone detector. UTC is currently 5 hours ahead(4 in the spring I think) and they only give data every 3
// hours, making the time 6 hours ahead of us the closest forcast(in actuality this data is for 1 hours later(1 am instead of 12am)
// to find the 12 am data for the next 4 nights

$(document).ready(() => {
	navigator.geolocation.getCurrentPosition(weatherAppController.getCurrentPositionSuccess);

	$("#fahrenheit").click(function () {
		const $this = $(this);
		if (!$this.hasClass("selected")) {
			weatherAppView.helperFunctions.stopAnimation();
			weatherAppModel.temperatureSystemIsF = true;
			weatherAppModel.dailyForecastDOMData.length = 0;
			weatherAppModel.hourlyForecastDOMData.length = 0;

			weatherAppModel.updateTemperatureData();

			$this.addClass("selected");
			$("#celsius").removeClass("selected");
		}
	});

	$("#celsius").click(function () {
		const $this = $(this);
		if (!$this.hasClass("selected")) {
			weatherAppView.helperFunctions.stopAnimation();
			weatherAppModel.temperatureSystemIsF = false;
			weatherAppModel.dailyForecastDOMData.length = 0;
			weatherAppModel.hourlyForecastDOMData.length = 0;

			weatherAppModel.updateTemperatureData();

			$this.addClass("selected");
			$("#fahrenheit").removeClass("selected");
		}
	});

	const $zipcode = $("#zipcode");
	$zipcode.css("opacity", 0).animate({opacity: 1}, 3000);
	$zipcode.submit(event => {
		event.preventDefault();
		const zipinput = $("#zipcodeInput").val();
		// verifies that the input is a 5-digit number
		if (/^\d{5}$/g.test(zipinput)) {
			const zipurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipinput}`;

			$.getJSON(zipurl, zipdata => {
				try {
					weatherAppModel.latitude = zipdata.results[0].geometry.location.lat;
					weatherAppModel.longitude = zipdata.results[0].geometry.location.lng;
				} catch (error) {
					$("#zipcodeInput").val("That is not a zipcode.");
				}

				weatherAppModel.dailyForecastDOMData.length = 0;
				weatherAppModel.hourlyForecastDOMData.length = 0;

				weatherAppModel.updateCurrentWeatherData(weatherAppModel.latitude, weatherAppModel.longitude);
				weatherAppModel.updateDailyForecastData(weatherAppModel.latitude, weatherAppModel.longitude);
			});
		} else {
			$("#zipcodeInput").val("5-digit number only");
		}
	});
});

//////////////////////////////////////////////////////////////////////////////////
const weatherAppModel = {
	dailyForecastDOMData: [],
	hourlyForecastDOMData: [],
	temperatureSystemIsF: true,
	temperatureData: {
		currentTemp: 0,
		day: [
			{High: 0, Low: 0, "12:00am": 0, "6:00am": 0, "12:00pm": 0, "6:00pm": 0},
			{High: 0, Low: 0, "12:00am": 0, "6:00am": 0, "12:00pm": 0, "6:00pm": 0},
			{High: 0, Low: 0, "12:00am": 0, "6:00am": 0, "12:00pm": 0, "6:00pm": 0},
			{High: 0, Low: 0, "12:00am": 0, "6:00am": 0, "12:00pm": 0, "6:00pm": 0}
		],
	},
	latitude: 0,
	longitude: 0,

	updateCurrentWeatherData(latitude, longitude) {
		const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=4bd0296ac3468ba55671920cabb0f745`;

		$.getJSON(url, weather => {
			this.temperatureData.currentTemp = this.convertTemperature(weather.main.temp, true);
			const weatherDataObject = {
				cloudCoverage: weather.clouds.all,
				description: weather.weather[0].description,
				time: new Date(Date.now()).toLocaleTimeString(),
				city: weather.name,
				country: weather.sys.country,
				humidity: weather.main.humidity,
				windDirection: this.helperFunctions.computeWindDirection(weather.wind.deg),
				windspeed: (weather.wind.speed * 3600 * 3.28 / 5280).toFixed(0),
				visibility: Math.round((weather.visibility * 3.28) / 5280)
			};
			weatherAppView.displayCurrentWeather(weatherDataObject);
		});
	},
	updateDailyForecastData(latitude, longitude) {
		/*OpenWeatherMap 5-day Forecast API
        the API returns an inconvenient array of fourty 3-hour forecasts. To find weather forecasts for the next four
        24-hour periods, several functions are used to merge and massage the data before it is displayed.
        */
		const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=4bd0296ac3468ba55671920cabb0f745`;
		$.getJSON(url, weatherData => {
			let delayTime = 0;
			// for (let day = 0; day < 4; day++) {
			// 	this.temperatureData.day[day].High = this.helperFunctions.computeHighTemp(weatherData, day);
			// 	this.temperatureData.day[day].Low = this.helperFunctions.computeLowTemp(weatherData, day);
			// }
			this.temperatureData.day.forEach((e, day) => {
				e.High = this.helperFunctions.computeHighTemp(weatherData, day);
				e.Low = this.helperFunctions.computeLowTemp(weatherData, day);
			});

			for (let day = 0; day < 4; day++) {
				weatherAppView.displayDailyForecast(weatherData, day, delayTime);
				delayTime = delayTime + 300;
			}
		});
	},
	updateHourlyForecastData() {
		const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${weatherAppModel.latitude}&lon=${weatherAppModel.longitude}&appid=4bd0296ac3468ba55671920cabb0f745`;
		$.getJSON(url, weatherData => {
				this.findDesiredHourlyForecasts(weatherData);
			}
		);
	},
	findDesiredHourlyForecasts(weatherData) {
		for (let forecastBlock = 0, day = 0; forecastBlock < weatherData.list.length && day < 4; forecastBlock++) {
			if (weatherData.list[forecastBlock].dt_txt.includes("06:00:00")) {
				this.temperatureData.day[day]["12:00am"] = this.convertTemperature(weatherData.list[forecastBlock].main.temp, true);
			//	this.temperatureData.day[day]getHourlyForecastIcon(weatherData.list[forecastBlock][0].id, true);
				weatherAppView.displayHourlyForecast(weatherData.list[forecastBlock], "12:00am", day, 1, true);
				day++;
			}
		}
		//to display the 6am data for the next 4 days
		for (let forecastBlock = 0, day = 0; forecastBlock < weatherData.list.length && day < 4; forecastBlock++) {
			if (weatherData.list[forecastBlock].dt_txt.includes("12:00:00")) {
				this.temperatureData.day[day]["6:00am"] = this.convertTemperature(weatherData.list[forecastBlock].main.temp, true);
				weatherAppView.displayHourlyForecast(weatherData.list[forecastBlock], "6:00am", day, 2, true);
				day++;
			}
		}
		//to display the noon data for the next 4 days
		for (let forecastBlock = 0, day = 0; forecastBlock < weatherData.list.length && day < 4; forecastBlock++) {
			if (weatherData.list[forecastBlock].dt_txt.includes("18:00:00")) {
				this.temperatureData.day[day]["12:00pm"] = this.convertTemperature(weatherData.list[forecastBlock].main.temp, true);
				weatherAppView.displayHourlyForecast(weatherData.list[forecastBlock], "12:00pm", day, 3, true);
				day++;
			}
		}
		//to display the 6pm data for the next 4 nights
		for (let forecastBlock = 0, day = 0; forecastBlock < weatherData.list.length && day < 4; forecastBlock++) {
			if (weatherData.list[forecastBlock].dt_txt.includes("00:00:00")) {
				this.temperatureData.day[day]["6:00pm"] = this.convertTemperature(weatherData.list[forecastBlock].main.temp, true);
				weatherAppView.displayHourlyForecast(weatherData.list[forecastBlock], "6:00pm", day, 4, false);
				day++;
			}
		}
	},
	updateTemperatureData() {
		this.temperatureData.currentTemp = this.convertTemperature(this.temperatureData.currentTemp, false);
		for (let day = 0; day < 4; day++) {
			this.temperatureData.day[day].High = this.convertTemperature(this.temperatureData.day[day].High, false);
			this.temperatureData.day[day].Low = this.convertTemperature(this.temperatureData.day[day].Low, false);
		}
		weatherAppView.displayConvertedTemperatures();
	},
	convertTemperature(temp, fromKelvin) {
		if (fromKelvin) {
			if (weatherAppModel.temperatureSystemIsF) {
				return Math.round((temp) * (9 / 5) - 459.67);
			} else {
				return Math.round(temp - 273.15);
			}
		} else {
			if (weatherAppModel.temperatureSystemIsF) {
				return Math.round((temp * (9 / 5)) + 32);
			} else {
				return Math.round((temp - 32) * (5 / 9));
			}
		}
	},
	helperFunctions: {
		computeHighTemp(weatherData, day) {
			let maxTemp = 0;
			const startDay = day * 8;
			for (let e = startDay; e < startDay + 8; e++) {
				if (maxTemp < weatherData.list[e].main.temp_max) {
					maxTemp = weatherData.list[e].main.temp_max;
				}
			}
			if (weatherAppModel.temperatureSystemIsF) {
				return Math.round((maxTemp * (9 / 5)) - 459.67);
			} else {
				return Math.round(maxTemp - 273.15);
			}
		},
		computeLowTemp(weatherData, day) {
			let minTemp = 1000;
			const startDay = day * 8;
			for (let e = startDay; e < startDay + 8; e++) {
				if (minTemp > weatherData.list[e].main.temp_min) {
					minTemp = weatherData.list[e].main.temp_min;
				}
			}
			if (weatherAppModel.temperatureSystemIsF) {
				return Math.round((minTemp * (9 / 5)) - 459.67);
			} else {
				return Math.round(minTemp - 273.15);
			}
		},
		computeAverageCloudCoverage(weatherData, day) {
			let totalCloudCoverage = 0;
			const startDay = day * 8;
			for (let e = startDay; e < startDay + 8; e++) {
				totalCloudCoverage += weatherData.list[e].clouds.all;
			}
			return totalCloudCoverage / 9;
		},
		computeAverageWindSpeed(weatherData, day) {
			let averageWindSpeed = 0;
			const startDay = day * 8;
			for (let e = startDay; e < startDay + 8; e++) {
				averageWindSpeed += weatherData.list[e].wind.speed;
			}
			return 	Math.round((averageWindSpeed / 8) * 3.28 * 3600 / 5280);
		},
		computeWindDirection(degrees) {
			if (degrees < 23 || degrees >= 338) {
				return "N";
			}
			if (degrees < 68) {
				return "NE";
			}
			if (degrees < 113) {
				return "E";
			}
			if (degrees < 158) {
				return "SE";
			}
			if (degrees < 203) {
				return "S";
			}
			if (degrees < 248) {
				return "SW";
			}
			if (degrees < 293) {
				return "W";
			}
			if (degrees < 338) {
				return "NW";
			}
		},
		computeAverageRain(weatherData, day) {
			let averageRain = 0;
			const startDay = day * 8;
			for (let e = startDay; e < startDay + 8; e++) {
				if ((weatherData.list[e].rain) && (weatherData.list[e].rain['3h'])) {
					averageRain++;
				}
			}
			return Math.round((averageRain / 8) * 0.8 * 100);
		},
		createDescription(weatherData, day) {
			let clouds, rain;
			const averageCloudCoverage = this.computeAverageCloudCoverage(weatherData, day);
			const averageRain = this.computeAverageRain(weatherData, day);

			if (averageCloudCoverage < 10) {
				clouds = "clear";
			} else if (averageCloudCoverage < 30) {
				clouds = "few clouds";
			} else if (averageCloudCoverage < 45) {
				clouds = "scattered clouds ";
			} else if (averageCloudCoverage < 60) {
				clouds = "broken clouds";
			} else if (averageCloudCoverage < 80) {
				clouds = "cloudy";
			} else {
				clouds = "overcast";
			}
			if (averageRain === 0) {
				rain = "with no rain";
			} else if (averageRain < 15) {
				rain = "with a small chance of rain";
			} else if (averageRain < 30) {
				rain = "with a chance of rain";
			} else if (averageRain < 50) {
				rain = "with probably some rain";
			} else if (averageRain < 70) {
				rain = "with almost certainly some rain";
			} else {
				rain = "with lots of rain";
			}
			return `${clouds} ${rain}`;
		}
	}
};

////////////////////////////////////////////////////////////////////
const weatherAppView = {
	displayCurrentWeather(weatherDataObject) {
		$("#currentTemperature")
			.empty()
			.append(`<p> ${weatherAppModel.temperatureData.currentTemp}&#176</p>`);
		$("#currentDescription")
			.empty()
			.append(`<p>"${weatherDataObject.description}"</p>`);
		$("#weatherIcon")
			.empty()
			.append(`<img src='icons/${this.helperFunctions.getDailyForecastIcon(weatherDataObject.cloudCoverage, false)}'>`);
		$("#updated")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>updated as of ${weatherDataObject.time}</p>`)
			.animate({opacity: 1}, 1000);
		$("#cityName")
			.css("opacity", 0.2)
			.empty()
			.append(`<p> ${weatherDataObject.city}, ${weatherDataObject.country} </p>`)
			.animate({opacity: 1}, 1000);
		$("#currentHumidity")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>Humidity is ${weatherDataObject.humidity}%.</p>`)
			.animate({opacity: 1}, 1000);
		$("#currentWind")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>Wind is ${weatherDataObject.windDirection} at ${weatherDataObject.windspeed} mph.</p>`)
			.animate({opacity: 1}, 1000);
		$("#currentVisibility")
			.css("opacity", 0.2)
			.empty()
			.append(`<p>Visibility is ${weatherDataObject.visibility} miles.</p>`)
			.animate({opacity: 1}, 1000);
	},
	displayDailyForecast(weatherData, day, delayTime) {
		const animationDelay = 700;
		$(`#date${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<h2>${this.helperFunctions.updateForecastDates(day)[0]} ${this.helperFunctions.updateForecastDates(day)[1]}</h2>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay);
		$(`#iconForecast${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<img src='icons/${this.helperFunctions.getDailyForecastIcon(weatherAppModel.helperFunctions.computeAverageCloudCoverage(weatherData, day), weatherAppModel.helperFunctions.computeAverageRain(weatherData, day), true)}'>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay);
		$(`#maxTemp${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<p>${weatherAppModel.temperatureData.day[day].High}&#176</p>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay);
		$(`#minTemp${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<p>${weatherAppModel.temperatureData.day[day].Low}&#176</p>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay);
		$(`#description${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<p>${weatherAppModel.helperFunctions.createDescription(weatherData, day)}</p>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay);
		$(`#windForecast${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<img src="icons/wi-strong-wind.svg"><p>${weatherAppModel.helperFunctions.computeAverageWindSpeed(weatherData, day)} mph</p>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay);
		$(`#rainForecast${day}`)
			.css("opacity", 0)
			.empty()
			.append(`<img src="icons/wi-raindrops.svg"><p>${weatherAppModel.helperFunctions.computeAverageRain(weatherData, day)}%</p>`)
			.delay(delayTime)
			.animate({opacity: 1}, animationDelay, function(){
				$(`#forecastDay${day}`).on("mouseenter", {value:`${day}`}, weatherAppController.OnMouseEnter);
			});


	},
	displayHourlyForecast(weatherData, timeString, day, forecast, showDayIconOnly) {
		$(`#forecastDetailTime${day}${forecast}`)
			.empty()
			.append(`<h3>${timeString}</h3>`);
		$(`#forecastDetailIcon${day}${forecast}`)
			.empty()
			.append(`<img src='icons/${this.helperFunctions.getHourlyForecastIcon(weatherData.weather[0].id, showDayIconOnly)}'>`
			);
		$(`#forecastDetailTemp${day}${forecast}`)
			.empty()
			.append(`<p>${weatherAppModel.temperatureData.day[day][timeString]}&#176</p>`);
	},
	displayConvertedTemperatures() {
		$("#currentTemperature")
			.css("opacity", 0)
			.empty()
			.append(`<p> ${weatherAppModel.temperatureData.currentTemp}&#176</p>`)
			.animate({opacity: 1}, 2000);
		for (let day = 0; day < 4; day++) {
			$(`#maxTemp${day}`)
				.css("opacity", 0)
				.empty().append(`<p>${weatherAppModel.temperatureData.day[day].High}&#176</p>`)
				.animate({opacity: 1}, 2000);
			$(`#minTemp${day}`)
				.css("opacity", 0).empty()
				.append(`<p>${weatherAppModel.temperatureData.day[day].Low}&#176</p>`)
				.animate({opacity: 1}, 2000);
		}
	},
	helperFunctions: {
		updateForecastDates(increment) {
			const timeNow = new Date(Date.now());
			const datePlus = new Date(timeNow.setDate(timeNow.getDate() + increment));
			const datePlusDayOfWeek = this.getDayOfWeek(datePlus.getDay());

			return [datePlusDayOfWeek, datePlus.getDate()];
		},
		getDayOfWeek(day) {
			switch (day) {
				case 0:
					return "Sun";
				case 1:
					return "Mon";
				case 2:
					return "Tue";
				case 3:
					return "Wed";
				case 4:
					return "Thu";
				case 5:
					return "Fri";
				case 6:
					return "Sat";
			}
		},
		stopAnimation(day, callback) {
			if (day) {
				$(`#date${day}`).finish();
				$(`#iconForecast${day}`).finish();
				$(`#maxTemp${day}`).finish();
				$(`#minTemp${day}`).finish();
				$(`#description${day}`).finish();
				$(`#windForecast${day}`).finish();
				$(`#rainForecast${day}`).finish();
			} else {
				$('#currentTemperature').finish();
				for (let day = 0; day < 4; day++) {
					$(`#maxTemp${day}`).finish();
					$(`#minTemp${day}`).finish();
				}
			}
			if (callback) {
				callback();
			}
		},
		printHourlyForecastDOMTemplate(day) {
			return `
				<div class="forecastDetail" id="11">
					<div class="forecastDetailQuad" id="forecastDetail11">
						<div class="forecastDetailTime" id="forecastDetailTime${day}1"></div>
						<div class="forecastDetailIcon" id="forecastDetailIcon${day}1"></div>
						<div class="forecastDetailTemp" id="forecastDetailTemp${day}1"></div>
					</div>
					<div class="forecastDetailQuad" id="forecastDetail12">
						<div class="forecastDetailTime" id="forecastDetailTime${day}2"></div>
						<div class="forecastDetailIcon" id="forecastDetailIcon${day}2"></div>
						<div class="forecastDetailTemp" id="forecastDetailTemp${day}2"></div>
					</div>
					<div class="forecastDetailQuad" id="forecastDetail14">
						<div class="forecastDetailTime" id="forecastDetailTime${day}4"></div>
						<div class="forecastDetailIcon" id="forecastDetailIcon${day}4"></div>
						<div class="forecastDetailTemp" id="forecastDetailTemp${day}4"></div>
					</div>
					<div class="forecastDetailQuad" id="forecastDetail13">
						<div class="forecastDetailTime" id="forecastDetailTime${day}3"></div>
						<div class="forecastDetailIcon" id="forecastDetailIcon${day}3"></div>
						<div class="forecastDetailTemp" id="forecastDetailTemp${day}3"></div>
					</div>
				</div>`;
		},
		getDailyForecastIcon(cloudCoverage, averageRain, forecastYesNo) {
			const timeNow = new Date(Date.now());
			//	let timeOfSunrise = new Date(timeNow).setHours(0, 0, 0, 0) + new Date(apiSunriseTime).setDate(1) - 18000000;
			const timeOfSunrise = new Date(timeNow).setHours(6, 30, 0, 0);
			const timeOfSunset = new Date(timeNow).setHours(19, 30, 0, 0);

			if ((timeNow < timeOfSunrise || timeOfSunset < timeNow) && !forecastYesNo) {
				if (averageRain < 10) {
					if (cloudCoverage < 10) {
						return "night.svg";
					}
					if (cloudCoverage < 30) {
						return "cloudy-night-1.svg";
					}
					if (cloudCoverage < 60) {
						return "cloudy-night-2.svg";
					}
					if (cloudCoverage < 75) {
						return "cloudy-night-3.svg";
					}
					if (cloudCoverage) {
						return "cloudy.svg";
					}
				} else {
					if (averageRain < 30) {
						return "rainy-4.svg";
					}
					if (averageRain < 60) {
						return "rainy-5.svg"
					}
					if (averageRain) {
						return "rainy-6.svg"
					}
				}
			}
			else {
				if (averageRain < 10) {
					if (cloudCoverage < 10) {
						return "day.svg";
					}
					if (cloudCoverage < 30) {
						return "cloudy-day-1.svg";
					}
					if (cloudCoverage < 60) {
						return "cloudy-day-2.svg";
					}
					if (cloudCoverage < 75) {
						return "cloudy-day-3.svg";
					}
					if (cloudCoverage) {
						return "cloudy.svg";
					}
				}
				else {
					if (averageRain < 30) {
						return "rainy-2.svg";
					}
					if (averageRain < 60) {
						return "rainy-1.svg"
					}
					if (averageRain) {
						return "rainy-3.svg"
					}
				}
			}
		},
		getHourlyForecastIcon(id, isDay) {
			if (isDay) {
				if (id === 800) {
					return "day.svg";
				}
				if (id === 801) {
					return "cloudy-day-1.svg";
				}
				if (id === 802) {
					return "cloudy-day-2.svg";
				}
				if (id === 803) {
					return "cloudy-day-3.svg";
				}
				if (id === 804) {
					return "cloudy.svg";
				}
				if (300 <= id && id < 350) {
					return "rainy-2.svg";
				}
				if (500 <= id && id < 550) {
					return "rainy-3.svg";
				}
				if (200 <= id && id < 250) {
					return "thunder.svg";
				}
			} else {
				if (id === 800) {
					return "night.svg";
				}
				if (id === 801) {
					return "cloudy-night-1.svg";
				}
				if (id === 802) {
					return "cloudy-night-2.svg";
				}
				if (id === 803) {
					return "cloudy-night-3.svg";
				}
				if (id === 804) {
					return "cloudy.svg";
				}
				if (300 < id && id < 350) {
					return "rainy-4.svg";
				}
				if (500 <= id && id < 550) {
					return "rainy-6.svg";
				}
				if (200 <= id && id < 250) {
					return "thunder.svg";
				}
			}
			return "";
		}
	},
};

const weatherAppController = {
	getCurrentPositionSuccess(position) {
		weatherAppModel.latitude = position.coords.latitude;
		weatherAppModel.longitude = position.coords.longitude;

		weatherAppModel.updateCurrentWeatherData(weatherAppModel.latitude, weatherAppModel.longitude);
		weatherAppModel.updateDailyForecastData(weatherAppModel.latitude, weatherAppModel.longitude);
	},

	OnMouseEnter(event) {
		const $forecastDay = $(`#forecastDay${event.data.value}`);
		$("#redButton").hide();
		$forecastDay.off("mouseenter");

		if (!weatherAppModel.dailyForecastDOMData[event.data.value]) {
			weatherAppView.helperFunctions.stopAnimation(event.data.value, function () {
				weatherAppModel.dailyForecastDOMData[event.data.value] = $forecastDay.html();
			});
		}
		if (!weatherAppModel.hourlyForecastDOMData[event.data.value]) {
			$forecastDay.empty().append(weatherAppView.helperFunctions.printHourlyForecastDOMTemplate(event.data.value));
			weatherAppModel.updateHourlyForecastData();
		} else {
			$forecastDay.empty().append(weatherAppModel.hourlyForecastDOMData[event.data.value]);
		}
		$forecastDay.on("mouseleave", {value: event.data.value}, weatherAppController.OnMouseLeave);
	},
	OnMouseLeave(event) {
		const $forecastDay = $(`#forecastDay${event.data.value}`);
		$forecastDay.off("mouseleave");

		if (!weatherAppModel.hourlyForecastDOMData[event.data.value]) {
			weatherAppModel.hourlyForecastDOMData[event.data.value] = $forecastDay.html();
		}
		$forecastDay.empty().append(weatherAppModel.dailyForecastDOMData[event.data.value]);
		$forecastDay.on("mouseenter", {value: event.data.value}, weatherAppController.OnMouseEnter);
	}
};