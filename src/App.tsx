import React from 'react';
import { Provider, useDispatch } from "react-redux";
import { configureStore } from '@reduxjs/toolkit'
import { taskMiddleware } from "react-palm/tasks";

import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import keplerGlReducer from "kepler.gl/reducers";
import {processGeojson} from 'kepler.gl/processors';

import useSwr from "swr";

const store = configureStore({
  reducer: {
    keplerGl: keplerGlReducer
  },
  middleware: [taskMiddleware]
})

function App() {
  return (
    <Provider store={store}>
      <Map />
    </Provider>
  )
}

function Map() {
  const dispatch = useDispatch();
  const { data } = useSwr("weather", async () => {
    const response = await fetch(
      "arcgisdata.json"
    );
    const data = await response.json();
    return data;
  });


  /* This is my config file for my map. This is the only way I could get it to work
  Words cannot describe how upset I am that I can't just do this:
  const mapconfig = fetch("mapconfig.json").then(response => response.json()); */
  
  const mapconfig = {
    "version": "v1",
    "config": {
      "visState": {
        "filters": [
          {
            "dataId": [
              "weather"
            ],
            "id": "0ufsvxx9b",
            "name": [
              "YEAR"
            ],
            "type": "range",
            "value": [
              1996,
              1996
            ],
            "enlarged": false,
            "plotType": "histogram",
            "animationWindow": "free",
            "yAxis": null,
            "speed": 1
          }
        ],
        "layers": [
          {
            "id": "x7rob5",
            "type": "point",
            "config": {
              "dataId": "weather",
              "label": "Point",
              "color": [
                255,
                203,
                153
              ],
              "highlightColor": [
                252,
                242,
                26,
                255
              ],
              "columns": {
                "lat": "LATITUDE",
                "lng": "LONGITUDE",
                "altitude": null
              },
              "isVisible": true,
              "visConfig": {
                "radius": 25,
                "fixedRadius": false,
                "opacity": 0.8,
                "outline": false,
                "thickness": 2,
                "strokeColor": null,
                "colorRange": {
                  "name": "ColorBrewer OrRd-6",
                  "type": "sequential",
                  "category": "ColorBrewer",
                  "colors": [
                    "#fef0d9",
                    "#fdd49e",
                    "#fdbb84",
                    "#fc8d59",
                    "#e34a33",
                    "#b30000"
                  ]
                },
                "strokeColorRange": {
                  "name": "Global Warming",
                  "type": "sequential",
                  "category": "Uber",
                  "colors": [
                    "#5A1846",
                    "#900C3F",
                    "#C70039",
                    "#E3611C",
                    "#F1920E",
                    "#FFC300"
                  ]
                },
                "radiusRange": [
                  0,
                  50
                ],
                "filled": true
              },
              "hidden": false,
              "textLabel": []
            },
            "visualChannels": {
              "colorField": {
                "name": "DEATHS_TOTAL",
                "type": "integer"
              },
              "colorScale": "quantize",
              "strokeColorField": null,
              "strokeColorScale": "quantile",
              "sizeField": null,
              "sizeScale": "linear"
            }
          }
        ],
        "interactionConfig": {
          "tooltip": {
            "fieldsToShow": {
              "weather": [
                {
                  "name": "YEAR",
                  "format": null
                },
                {
                  "name": "MONTH_NAME",
                  "format": null
                },
                {
                  "name": "BEGIN_DATE_TIME",
                  "format": null
                },
                {
                  "name": "STATE",
                  "format": null
                },
                {
                  "name": "CZ_NAME",
                  "format": null
                },
                {
                  "name": "DEATHS_DIRECT",
                  "format": null
                },
                {
                  "name": "DEATHS_INDIRECT",
                  "format": null
                },
                {
                  "name": "EVENT_TYPE",
                  "format": null
                },
                {
                  "name": "DEATHS_TOTAL",
                  "format": null
                }
              ]
            },
            "compareMode": false,
            "compareType": "absolute",
            "enabled": true
          },
          "brush": {
            "size": 0.5,
            "enabled": false
          },
          "geocoder": {
            "enabled": false
          },
          "coordinate": {
            "enabled": false
          }
        },
        "layerBlending": "normal",
        "splitMaps": [],
        "animationConfig": {
          "currentTime": null,
          "speed": 1
        }
      },
      "mapState": {
        "bearing": 0,
        "dragRotate": false,
        "latitude": 36.41240965953329,
        "longitude": -95.72754731774364,
        "pitch": 0,
        "zoom": 3.8441990099147767,
        "isSplit": false
      },
      "mapStyle": {
        "styleType": "dark",
        "topLayerGroups": {},
        "visibleLayerGroups": {
          "label": true,
          "road": true,
          "border": false,
          "building": true,
          "water": true,
          "land": true,
          "3d building": false
        },
        "threeDBuildingColor": [
          9.665468314072013,
          17.18305478057247,
          31.1442867897876
        ],
        "mapStyles": {}
      }
    }
  }

  React.useEffect(() => {
    if (data) {
      dispatch(
        addDataToMap({
          datasets: {
            info: {
              label: "WEATHER",
              id: "weather"
            },
            data: processGeojson(data)
          },
          option: {
            centerMap: true,
            readOnly: false
          },
          config: mapconfig
        })
      );
    }
  }, [dispatch, data, mapconfig]);

  return (
    <KeplerGl
      id="weather"
      mapboxApiAccessToken={"YOUR_TOKEN_HERE"}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}

export default App;