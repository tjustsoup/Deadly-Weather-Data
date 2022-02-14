# 🌪 Deadly Weather Data 🌩

This React App has taken the NOAA storm data from ArcGIS and plugged it into the mapping tool Kepler.gl.
This will allow us to visualize all the storms in the US that have occurred since 1996 that have directly or indirectly contributed to deaths.
While morbid, I found this data to be significant in showing the areas of the US that have been, and continue to be, the most devastated by storms.

This ReadMe will tell you how to get started, how to make the map look good, and some of my development process.

 
## 💾 How to get started
### 1.  Install using `npm install`.
This will install all the dependencies required and listed in the package.json, as well as run a post-install build-script "arcgis.js" (explained further down).
You may have to run `npm install --force` to force the dependencies. It's okay, they don't mind.

### 2. Add your mapbox token.
In the index.tsx file at the end of the code, copy and paste your mapbox token.

### 3. Start using `npm start`.
This will pull up your browser on localhost:3000.  Webpack has been persnickety recently, so the .env file should bypass the warning it likes to pop up with.  If not, the console will tell you what to do.

### 4. Have fun!


# 🧪 Dev Process ⚗
## 🌌The Core - index.tsx
### Build React App ⚛
`npx create-react-app APP_NAME --template typescript`
Normally, the .gitignore file would ignore the .env file, but I need that for the one script it has.
Webpack is being weird

### Import Kepler.gl Documentation 🗺
Using a combination of [Kepler.gl Documentation](https://docs.kepler.gl/docs/api-reference/get-started) and a [Youtube walkthrough](https://www.youtube.com/watch?v=BEZjt08Myxs), I set up the bare bones of Kepler to work in the React app.
This includes the reducer, the data store, and the data dispatcher.

=imports added=
    ```
    import KeplerGl from 'kepler.gl';
    import keplerGlReducer from 'kepler.gl/reducers';
    import {addDataToMap} from 'kepler.gl/actions';
    import {createStore, applyMiddleware} from 'redux';
    import {taskMiddleware} from 'react-palm/tasks';
    ```

### Inside `function Map()` ⌨
For this part, I mostly used that Youtube Walkthrough.
Started by adding the <Keplergl> chunk from the documentation, and I slapped my mapbox token in there as well.
I set a `const { data } = useSwr( ... )`.
Inside, this pulls in the data from a link, then json-ifies it, and returns data.
I took the dispatcher from Kepler, threw it inside of the `Map()` function, and amended it a bit.
- Wrapped it in `React.useEffect(() => { THE_WHOLE_DISPATCHER }, [dispatch, data]);`
- Within the dispatcher, added `processGeojson(data)` so it would allow geojson.
- Later on, we come mess with the "config"

=imports added=
    ```
    import useSwr from 'swr';
    import {processGeojson} from 'kepler.gl/processors';
    ```

### Export 🚀
    ```
    export function App() {
    return  (
        <Provider store={store}>
        <Map />
        </Provider>
    );
    }
    ```

### tsconfig.tsx and package.json 📦
Before this can be troubleshooted (-shot?), tsconfig.tsx package.json needs to be updated.
There's also a file structure that declares the modules that are imported (this is a typescript thing).
Just copy-paste or download those files. After that, run `npm install`.
At this point, once everything worked, I made a small query on ArcGIS, took the URL, put it into that `useSwr()` function, and ran `npm start` to test.

 
# 📂 The Data - arcgis.json Build File
This is the only part of the code I actually "wrote from scratch."
This file serves a few purposes:
- Pulls and caches the data from ArcGIS using a preset query.
- Tweaks the formatting of the data to be formatted correctly for our task.
- Runs on post-install to make life easier and faster later

ArcGIS is slooooooowww.
In our index.tsx file, I could have easily plopped in a link to a query but that would take a long time to load whenever we load the page.
To get around that, I could've saved the data and hosted it on github, but that's manual and requires work, which is gross.
You can see this in the comments of the code, but the first part matches everything we need to fill out on the normal ArcGIS query form and submits it.
Here comes our first dilemma - ArcGIS maxes out at 2000 entries.

To fix that, I told it to offset at 2000 elements in the array, and then keep going after that and concatenate what it finds.
I also made sure to chop off the top bit of every geojson query.

The next part was to format the data that we get as it comes in.
The reason this is necessary is because ArcGIS doesn't provide us with the explicit "LONGITUDE", "LATITUDE", or "DEATHS_TOTAL", so I wrote a forEach loop to run through every object in the array, find the LONG and LAT from the geometry, and add that as a property to that same object so that Kepler.gl can read it properly (this allows us to use Point and Heatmap).
Once I figured out how to do that, I figured it was easy enough to do the same to make DEATHS_TOTAL.

After all that jazz, it saves the file to the public folder where it can be accessed by the app. And since it's a post-install script, it only runs once.
Whenever you run the program, this data is saved and comes right up!

I am very proud of this. Gold star for me ⭐


# Map Config Insertion
Once the app is up and running, and you've fiddled with the layers, filters, and interractions to your liking, next up is setting the default map config.
In the app, in the top left corner, click "Share" > map format "json" > copy the "Map Config".
Back in the App.tsx, at line 43 I created a variable "mapconfig" and set it equal to this block of text.
Down below in the `React.useEffect()`, I put `config: mapconfig`, and at the very bottom I added it to `[dispatch, data, mapconfig]`.
While this works, it results in a "Compiled with warnings," plus it not clean coding - more on this later.


# 🤷‍♂️ Data Dilemmas and Potential Improvements
### Data Formats
First off, I've noticed that Kepler seems to really prefer CSV over JSON.
Most view types are viewable through regular CSV format, but only a few are viewable through JSON, and only 1 (Polygon) is viewable with GeoJSON.
Problem here is that the NOAA Storm Data only comes out in JSON or GeoJSON.
On top of that, we already had to finagle our formatting to make Kepler use certain view types.
Probably best to just convert the JSON/GeoJSON into CSV.
Main reason I haven't done that is because I like JSON, and throughout the process of building this app, I've been learning a ton about Objects and JSON...

In this instance, I can't quite say, "If it ain't broke don't fix it,"
But how about, "If you fixed it to the point where it ain't broke, don't touch it" ?

### Color Gradients / Data outliers
In the default config for the map that I've setup, we have 1 year at a time, points with a gradient fill color based on DEATHS_TOTAL.
As it displays now - and as it should - the darker/more red the dot is, the more deaths have occured in that one report.
The problem lies in having data outliers, such as incidents Hurricane Katrina, Louisana 2005, or Hurricane Sandy, New York 2012.
Kepler.gl automatically adjusts the legend to your dataset, but you can change that (kinda) in the "color scale" option - I have it set to quantize.
The dilemma is that any time you get an outlier (approx. 10+ deaths) in a single report, the legend's scale start to change because we have SO many reports of 1 or 2 deaths.

To solve this, I wanted to make a custom legend/scale for the data so that I could put any outliers in their own category and have a smooth transition for the normal data bits.
I looked to see if there was a way to do that with Kepler and as it turns out, this was a feature that was in development back in 2020, but to my knowledge has yet to be finished.
So until then, to show the data how I want it to be shown, the current config is the best I could come up with.
Not happy about it, but at least it works.

### Troubles With Map Config
My original intent with the mapconfig was to have content copy-pasted into a mapconfig.json file in public (I still have it there).
I wanted to `fetch()` that into the code and set it as a variable, then use that varaible assigned to the config.
I tried tons of different things but I think it comes down to a syntax error.
The most success I had was:
```
const mapconfig = fetch("mapconfig.json").then(response => response.json()).then(data => console.log(data));
```
When I read the console, I saw the data I wanted!  But for some reason mapconfig still didn't work.
The way I have it set currently isn't pretty or clean, but it does work.
There is a clean way to input the mapconfig into the code, but I just couldn't figure it out.


### Thanks for reading!

For questions, shoot me a line on github!