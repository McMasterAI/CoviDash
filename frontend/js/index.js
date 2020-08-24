// Get all heatmap form vals
var hm_cont = EID("heatmapContainerWrapper");
var hm_tooltip = EID("heatmapTooltip");
var hm_range = EID("heatmapRange");

// minimal heatmap instance configuration
var heatmapInstance = h337.create({
    // only container is required, the rest will be defaults
    container: hm_cont,
    maxOpacity: .6,
    radius: 30,
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

// Get data from python and update the heatmap
GetData();
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
        key = fkeys[fkeys.length - (8 - hm_range.value)]

        //console.log(fdata["2020-03-31"])
        //var points = fdata["2020-03-31"]
    }

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
    EID('max').innerHTML = data.max;
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
    var translation = 'translate(' + (x + 15) + 'px, ' + (y + 15) + 'px)';
    hm_tooltip.style.webkitTransform = translation;
    hm_tooltip.innerHTML = value;
}

// Function to change data used based on slidebar pos
hm_range.oninput = function () {
    // Get new key
    var newkey = fkeys[fkeys.length - (8 - hm_range.value)]
    HM_GetData(newkey)
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


// When the mouse leaves the container
hm_cont.onmouseout = function () {
    hm_tooltip.style.display = 'none';
}
