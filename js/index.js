// Get all heatmap form vals
var hm_cont = EID("heatmapContainerWrapper");
var hm_tooltip = EID("heatmapTooltip");
var hm_range = EID("heatmapRange");

var filter_start = EID("start");
var filter_end = EID("end");

// minimal heatmap instance configuration
var heatmapInstance = h337.create({
    // only container is required, the rest will be defaults
    container: hm_cont,
    maxOpacity: .6,
    radius: 16,
    blur: 0.2,
    // backgroundColor with alpha so you can see through it
    backgroundColor: 'rgba(0, 0, 58, 0.00)',
    // update the legend whenever there's an extrema change
    onExtremaChange: function onExtremaChange(data) {
        HM_UpdateLegend(data);
    }
});

// Get a basic var for the heatmap data
var hm_data = {
    max: 1,
    min: 0,
    data: []
};

var hm_width = hm_cont.offsetWidth;
var hm_height = hm_cont.offsetHeight;

// Declare some basic values for the legend as well, including gradiant config
var legendCanvas = document.createElement('canvas');
legendCanvas.width = 100;
legendCanvas.height = 10;

var legendCtx = legendCanvas.getContext('2d');
var gradientCfg = {};

// Variable to hold ALL data from flask
var fdata;
var fdataMax;
var fkeys;
var hm_start;
var hm_end;

// Get data from python and update the heatmap
GetData();
HM_UpdateRange();
HM_GetData();

// Function on button press to get data from python
function GetData() {

    // Send an AJAX request to get loaded data data
    $.ajax({
        type: "POST",
        // Route path
        url: "/casedata",
        dataType: "json",
        async: false,
        //data: JSON.stringify('you can put in a variable in here to send data with the request'),
        contentType: 'application/json;charset=UTF-8',
        success: function (pointdict) {

            // Set the data store to the given var
            fdata = pointdict
            fkeys = Object.keys(fdata)

        }

    });

};

function HM_GetData(key = null) {

    if (key == null) {
        // Keys are sorted by date, can just go from last to first
        // Get key based on slider pos
        key = fkeys[hm_range.value]

        //console.log(fdata["2020-03-31"])
        //var points = fdata["2020-03-31"]
    }

    // Set the current date to the key
    EID('date').innerHTML = key

    var points = JSON.parse(JSON.stringify(fdata[key]));

    //var points = allpoints
    //console.log(allpoints)

    // Plot the data on the heatmap and refresh it


    /*
        Need to adjust for longitude/latitude, equation will be as follows
        x = ((x - min_x) / diff_x) * width
    */

    // Moves points up/down
    var min_y = 41.8
    // Moves points left/right
    var min_x = -96
    // Spreads points vertically
    var diff_y = 9
    // Spreads points horizontally
    var diff_x = 22

    //make sure points are in the right position on the screen
    hm_width = hm_cont.offsetWidth;
    hm_height = hm_cont.offsetHeight;

    for (i = 0; i < points.length; i++) {
        points[i].x = Math.floor(((points[i].x - min_x) / diff_x) * hm_width);
        points[i].y = hm_height - Math.floor(((points[i].y - min_y) / diff_y) * hm_height);
    };




    // Update and display new vals
    HM_UpdateData(points);

}

function HM_UpdateRange(startdate = null, enddate = null) {

    // Get startdate if null or does not exist
    if (startdate == null || !(fkeys.includes(startdate))) {

        startdate = fkeys[0]

    }

    // Get enddate if null or does not exist
    if (enddate == null || !(fkeys.includes(enddate))) {

        enddate = fkeys[fkeys.length - 1]

    }

    hm_start = startdate
    hm_end = enddate


    // Set range to support this new date range
    hm_range.max = fkeys.indexOf(hm_end)
    hm_range.min = fkeys.indexOf(hm_start)


}

function HM_UpdateData(data) {
    // With the given list of points, update the max and data vals
    hm_data.max = Math.max.apply(Math, data.map(function (o) { return o.value; }))
    hm_data.data = data

    heatmapInstance.setData(hm_data);
};

function HM_UpdateLegend(data) {
    // the onExtremaChange callback gives us min, max, and the gradientConfig
    // so we can update the legend

    // Get the min/max of the full dataset
    EID('min').innerHTML = data.min;
    EID('max').innerHTML = Math.floor(data.max);
    // regenerate gradient image
    if (data.gradient != gradientCfg) {
        gradientCfg = data.gradient;
        var gradient = legendCtx.createLinearGradient(0, 0, 100, 1);
        for (var key in gradientCfg) {
            gradient.addColorStop(key, gradientCfg[key]);
        }

        legendCtx.fillStyle = gradient;
        legendCtx.fillRect(0, 0, 100, 10);
        EID('gradient').src = legendCanvas.toDataURL();
    }
}

// Function to update tooltip value and position
function HM_UpdateTooltip(x, y, value) {
    // + 15 for distance to cursor
    var translation = 'translate(' + (x + 100) + 'px, ' + (y + 100) + 'px)';
    hm_tooltip.style.webkitTransform = translation;
    hm_tooltip.innerHTML = value;
}

// Function to change data used based on slidebar pos
hm_range.oninput = function () {
    // Get new key
    var newkey = fkeys[hm_range.value]
    HM_GetData(newkey)
    updateBarChart()
}

// PAGE EVENTS / UTIL

// Shorthand for get element by id
function EID(id) {
    return document.getElementById(id);
};

// When mousing over the container
hm_cont.onmousemove = function (ev) {

    var x = ev.layerX;
    var y = ev.layerY;
    // Get value from heatmap pos
    var value = heatmapInstance.getValueAt({
        x: x,
        y: y
    });

    hm_tooltip.style.display = 'block';

    HM_UpdateTooltip(x, y, value);
}

// When start date is edited
// filter_start.onchange = function (ev) {
//     hm_start = filter_start.value;
//     HM_UpdateRange(hm_start, hm_end)
//     HM_UpdateData()
// }

// filter_end.onchange = function (ev) {
//     hm_end = filter_end.value;
//     HM_UpdateRange(hm_start, hm_end)
//     HM_UpdateData()
// }


// When the mouse leaves the container
hm_cont.onmouseout = function () {
    hm_tooltip.style.display = 'none';
}




////////////////////////////////////////


var cases = {}
cases["All"] = []
var rolling = {}
rolling["All"] = []
var rateofchange = {}
rateofchange["All"] = []
for (var date in fdata) {
    cases["All"].push(0)
    rolling["All"].push(0)
    rateofchange["All"].push(0)

    for (var i in fdata[date]) {
        var city = fdata[date][i]
        if (!(city["loc"] in cases)) {
            cases[city["loc"]] = []
            rolling[city["loc"]] = []
            rateofchange[city["loc"]] = []
        }
        cases[city["loc"]].push(city["value"])
        rolling[city["loc"]].push(city["rolling_ave"])
        rateofchange[city["loc"]].push(city["rate_of_change"])

        cases["All"][cases["All"].length - 1] += city["value"]
        rolling["All"][rolling["All"].length - 1] += city["rolling_ave"]
        rateofchange["All"][rateofchange["All"].length - 1] += city["rate_of_change"]
    }
}
var locations = Object.keys(cases);
locations.sort();

for (i in locations) {
    var loc = locations[i];
    $("select#locations").append($("<option>")
        .val(loc)
        .html(loc)
    )
}

var locations_elem = document.getElementById("locations");
locations_elem.options[locations_elem.selectedIndex].value = "All";
locations_elem.options[locations_elem.selectedIndex].text = "All";

function updateLineChart() {
    var place = locations_elem.options[locations_elem.selectedIndex].value;
    var trace1 = {
        x: fkeys,
        y: cases[place],
        type: 'scatter',
        name: 'number of cases'
    };
    var trace2 = {
        x: fkeys,
        y: rolling[place],
        type: 'scatter',
        name: 'rolling average'
    };
    var trace3 = {
        x: fkeys,
        y: rateofchange[place],
        type: 'scatter',
        name: 'rate of change',
        visible: 'legendonly'
    };

    var data = [trace1, trace2, trace3];

    var layout = {
        title: 'Cases Time Series',
        showlegend: true,
    };

    Plotly.newPlot('linechart', data, layout, { scrollZoom: true });
}
updateLineChart()


function updateBarChart() {
    var _date = Number(hm_range.value)

    _cases = []
    _aves = []
    _roc = []
    for (i in locations) {
        loc = locations[i]
        _cases.push(cases[loc][_date])
        _aves.push(rolling[loc][_date])
        _roc.push(rateofchange[loc][_date])
    }
    var trace1 = {
        x: locations,
        y: _cases,
        type: 'bar',
        name: 'number of cases'
    };
    var trace2 = {
        x: locations,
        y: _aves,
        type: 'bar',
        name: 'rolling average'
    };
    var trace3 = {
        x: locations,
        y: _roc,
        type: 'bar',
        name: 'rate of change',
        visible: 'legendonly'
    };

    var traces = [trace1, trace2, trace3];
    var layout = { barmode: 'group' };

    Plotly.newPlot('barchart', traces, layout);
}
updateBarChart()

locations_elem.onchange = updateLineChart
