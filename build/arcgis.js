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