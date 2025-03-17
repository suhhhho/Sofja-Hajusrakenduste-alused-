fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=59.437&lon=24.7535')
  .then(res => res.json())
  .then(res => {
      for(let i = 0; i < 5 && res.properties.timeseries.length; i++) {
          console.log(res.properties.timeseries[i].time, res.properties.timeseries[i].data.instant.details.air_temperature + "C");
      }
  });