const axios = require('axios');
const qs = require('qs');
const fs = require('fs');

async function getArcGIS(offset = 0) {
    console.log('getting at offset: ' + offset);
    let options = {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        data: qs.stringify({
            where: "YEAR>=1996 AND (DEATHS_DIRECT>0 OR DEATHS_INDIRECT>0)",
            outFields: "YEAR, MONTH_NAME, BEGIN_DATE_TIME, STATE, CZ_NAME, EVENT_TYPE, DEATHS_DIRECT, DEATHS_INDIRECT",
            f: "pgeojson",
            resultOffset: offset
        }),
        url: 'https://services.arcgis.com/jIL9msH9OI208GCb/ArcGIS/rest/services/NOAA_Storm_Events_Database_1950-2021_v2/FeatureServer/0/query/'
    };

    let response = await axios(options);
    let data = response.data.features;
    // This formats the data to put LONG and LAT inside of the "properties"
    // We don't have to rely on just geoJSON geometry, we can now use Points and Heatmaps
    data.forEach((a) => {
        if (a.geometry != null) { 
          a.properties.LONGITUDE = a.geometry.coordinates[0];
          a.properties.LATITUDE = a.geometry.coordinates[1];
        }
        // This makes a better metric for the statistics - Deaths Total can now be tracked as a property
        if (a.properties != null) {
          a.properties.DEATHS_TOTAL = a.properties.DEATHS_DIRECT + a.properties.DEATHS_INDIRECT;
        }
        // Adds WEATHER_CATEGORY to supertype the EVENT_TYPE
        if (a.properties != null) {
            if (a.properties.EVENT_TYPE != null) {
                switch (a.properties.EVENT_TYPE) {
                    // Coastal
                        case 'Coastal Flood':
                            a.properties.WEATHER_CATEGORY = 'Coastal'
                            break;
                        case 'High Surf':
                            a.properties.WEATHER_CATEGORY = 'Coastal'
                            break;
                        case 'Rip Current':
                            a.properties.WEATHER_CATEGORY = 'Coastal'
                            break;
                        case 'Sneakerwave':
                            a.properties.WEATHER_CATEGORY = 'Coastal'
                            break;
                        case 'Storm Surge/Tide':
                            a.properties.WEATHER_CATEGORY = 'Coastal'
                            break;
                    
                    // Flooding
                        case 'Flash Flood':
                            a.properties.WEATHER_CATEGORY = 'Flooding'
                            break;
                        case 'Flood':
                            a.properties.WEATHER_CATEGORY = 'Flooding'
                            break;
                        case 'Lakeshore Flood':
                            a.properties.WEATHER_CATEGORY = 'Flooding'
                            break;
                    
                    // Heat
                        case 'Excessive Heat':
                            a.properties.WEATHER_CATEGORY = 'Heat/Fire'
                            break;
                        case 'Heat':
                            a.properties.WEATHER_CATEGORY = 'Heat/Fire'
                            break;
                        case 'Wildfire':
                            a.properties.WEATHER_CATEGORY = 'Heat/Fire'
                            break;

                    // Lightning
                        case 'Lightning':
                            a.properties.WEATHER_CATEGORY = 'Lightning'
                            break;
                    
                    // Marine
                        case 'Marine Dense Fog':
                            a.properties.WEATHER_CATEGORY = 'Marine'
                            break;
                        case 'Marine High Wind':
                            a.properties.WEATHER_CATEGORY = 'Marine'
                            break;
                        case 'Marine Strong Wind':
                            a.properties.WEATHER_CATEGORY = 'Marine'
                            break;
                        case 'Marine Thunderstorm Wind':
                            a.properties.WEATHER_CATEGORY = 'Marine'
                            break;
                        case 'Waterspout':
                            a.properties.WEATHER_CATEGORY = 'Marine'
                            break;

                    // Other
                        case 'Debris Flow':
                            a.properties.WEATHER_CATEGORY = 'Other'
                            break;
                        case 'Dense Fog':
                            a.properties.WEATHER_CATEGORY = 'Other'
                            break;
                        case 'Dust Storm':
                            a.properties.WEATHER_CATEGORY = 'Other'
                            break;

                    // Precipitation
                        case 'Hail':
                            a.properties.WEATHER_CATEGORY = 'Precipitation'
                            break;
                        case 'Heavy Rain':
                            a.properties.WEATHER_CATEGORY = 'Precipitation'
                            break;
                        case 'Sleet':
                            a.properties.WEATHER_CATEGORY = 'Precipitation'
                            break;

                    // Storm
                        case 'Hurricane':
                            a.properties.WEATHER_CATEGORY = 'Storm'
                            break;
                        case 'Hurricane (Typhoon)':
                            a.properties.WEATHER_CATEGORY = 'Storm'
                            break;
                        case 'Tropical Depression':
                            a.properties.WEATHER_CATEGORY = 'Storm'
                            break;
                        case 'Tropical Storm':
                            a.properties.WEATHER_CATEGORY = 'Storm'
                            break;

                    // Winds
                        case 'High Wind':
                            a.properties.WEATHER_CATEGORY = 'Winds'
                            break;
                        case 'Strong Wind':
                            a.properties.WEATHER_CATEGORY = 'Winds'
                            break;
                        case 'Thunderstorm Wind':
                            a.properties.WEATHER_CATEGORY = 'Winds'
                            break;
                        case 'Tornado':
                            a.properties.WEATHER_CATEGORY = 'Winds'
                            break;

                    // Winter Weather
                        case 'Avalanche':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Blizzard':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Cold/Wind Chill':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Extreme Cold/Wind Chill':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Freezing Fog':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Frost/Freeze':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Heavy Snow':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Ice Storm':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Lake Effect Snow':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Winter Storm':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                        case 'Winter Weather':
                            a.properties.WEATHER_CATEGORY = 'Winter Weather'
                            break;
                    default:
                        break;
                }
            }
        }

      });

    if (response.data.properties) {
        if (response.data.properties.exceededTransferLimit) {
            return data.concat(await getArcGIS(offset + 2000))
        }
    } else {
        return data;
    }
}

getArcGIS()
    .then(data => {
        let filepath = "public/arcgisdata.json"
        // let data = "content"
        function finisher(err) {
            if (err) {
                throw err;
            } else {
                console.log('We did it!');
            }
        }
        fs.writeFile(
            filepath, 
            JSON.stringify({
                "type" : "FeatureCollection", 
                "features" : data
            }),
            finisher
        )
    });