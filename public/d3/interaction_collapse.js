//this document is for the display of the tree
function displayMergerTree(raw_links, raw_nodes, raw_times, selectedGroup) {
//var doc = document.documentElement;
//var clientWidth = Math.min(doc.clientWidth-50, 1600);
//var clientHeight = doc.clientHeight;
var clientWidth = 1300;
var clientHeight = 850;
var margin = {top: 60, right: 20, bottom: 20, left: 20},
width = clientWidth - margin.right - margin.left,
height = 600;
//height = Math.max(clientHeight - margin.top - margin.bottom - 420, 400); //panelContentHeight, header, buttons, and padding for header
d3.select("#panelContent").style("width", clientWidth+"px")
d3.select("#topContainer").style("width", clientWidth/2 +"px")
d3.select("#legend").style("height", 30+"px");
d3.select("#header").style("width", clientWidth+"px");
d3.select("#mergerTreeResult").style("width", clientWidth+"px");
d3.select("#table").style("width", clientWidth+"px");
d3.select("#toptable").style("width", clientWidth+"px");
d3.select("#graphLabelTable").style("width", clientWidth+"px");
//**SIM d3.select("#sliderContainer").style("width", (clientWidth-200)+"px"); 
//**SIM d3.select("#sliderContent").style("width", (clientWidth-200)+"px"); 
d3.select("#massInformation").style("width", clientWidth/2 +"px");
d3.select("#particleInformation").style("width", clientWidth/2 +"px");
//d3.select("#windowDiv").style("height", (clientHeight-60)+"px");

//textboxes and buttons
var textBoxMinMass = document.getElementById('textboxMinMass');
var textBoxMaxMass = document.getElementById('textboxMaxMass');
var textBoxMinParticle = document.getElementById('textboxMinParticle');
var textBoxMaxParticle = document.getElementById('textboxMaxParticle');
var buttonMass = d3.select("#buttonMass");
var buttonParticle = d3.select("#buttonParticle");
var textBoxSelected = document.getElementById('haloTextSelected');
var checkBoxToggleGraphs = document.getElementById('checkedRemoveGraphs');
var checkBoxToggleTooltips = document.getElementById('checkedRemoveTooltips');
//LUMINOSITY var checkBoxToggleLuminosity = document.getElementById('checkedLuminosity');

//******************************SET UP SVG GRAPH WINDOW
var i = 0, duration = 600, root;
var massRatioHighlight = 5.0;

var haloMap, nodesMap, linksMap, timeMap;

var maxMass = 0, minMass, maxParticle = 0, minParticle;

//LUMINOSITYvar haloLums = [];

var maxTime = 0;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var nodeDistance;
var massScale = d3.scale.log();
var linkScale = d3.scale.log();
//LUMINOSITYvar lumScale = d3.scale.linear();
var timeScale = d3.scale.linear();

var zoom = d3.behavior.zoom();

var nodeMouseDown = false;
var tooltipShown = false;
var tooltipEdgesShown = false;
var graphSelected = false;

textboxMassRatio.value = massRatioHighlight;
//Generate tool tips
var tip_n = d3.tip()
  .attr("class", "d3-tip")
  .direction("n")
  .offset(function(d) { return [-(zoom.scale()-1)*(massScale(+d.haloMass)+3),0]; })
  .html(function(d) { return tipHtml(d) });

var tip_s = d3.tip()
  .attr("class", "d3-tip")
  .direction("s")
  .offset(function(d) { return [-(zoom.scale()-1)*(massScale(+d.haloMass)+3),0]; })
  .html(function(d) { return tipHtml(d) });

var tip_e = d3.tip()
  .attr("class", "d3-tip e")
  .direction("ne")
  .offset(function(d) { return [0, -10]; })
  .html(function(d) { return tipHtml(d) });

var tip_w = d3.tip()
  .attr("class", "d3-tip w")
  .direction("nw")
  .offset(function(d) { return [0,10]; })
  .html(function(d) { return tipHtml(d) });

var svg = d3.select("#svgContent")
    .style("width", width + margin.left + margin.right)
    .style("height", height + margin.top + margin.bottom)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

svg.append("g")
    .attr("class","timeaxislabel")
    .append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", margin.top - margin.bottom);

svg = svg.insert("g",".timeaxislabel")
    .call(zoom)
    .on("dblclick.zoom", null);
    
svg.call(tip_n);
svg.call(tip_s);
svg.call(tip_e);
svg.call(tip_w);

svg.append("rect")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + 2*margin.bottom)
    .attr("transform", "translate(" + 0 + "," + (margin.top-margin.bottom) + ")");

//just for margin barriers, can remove
svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
// filters defined
var defs = svg.append("defs");
var filter = defs.append("filter")
    .attr("id", "blur")
    .attr("height", "130%")
    .attr("width", "130%");
    
filter.append("feGaussianBlur")
    .attr("in", "SourceGraphic")
    .attr("stdDeviation", 2)
    .attr("result", "blur");

svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "transform")
    .append("g")
    .attr("class", "timeaxis");

svg.select(".transform").append("g")
    .attr("class", "graph") 

var graph = svg.select(".graph");   

//******************************SET UP BOTTOM PANEL
//scales for both charts
var xHeight = clientHeight/5-80; //used for various sections of the graph/areas
var x = d3.scale.linear().range([0, clientWidth/3.5]);
var y = d3.scale.linear().range([xHeight, 0]);
var xParticle = d3.scale.linear().range([0, clientWidth/3.5]);
var yParticle = d3.scale.linear().range([xHeight, 0]);

//axes formatting
var exponentFormat = function (x) {return x.toExponential(2)/(1e10);};
var kformat = d3.format(".1s");
var timeformat = d3.format(".1f");

var xAxisMass = d3.svg.axis().scale(x).orient("bottom").ticks(10).tickFormat(function(d) { return exponentFormat(Math.pow(10,d)); });
var yAxisMass = d3.svg.axis().scale(y).orient("left").ticks(5);

var xAxisParticle = d3.svg.axis().scale(xParticle).orient("bottom").tickFormat(function(d) { return kformat(Math.pow(10,d)); });
var yAxisParticle = d3.svg.axis().scale(yParticle).orient("left").ticks(5);
//areas- based on respective domains
var area = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x(d.x); })
    .y0(xHeight)
    .y1(function(d) { return y(d.y); }); 
    
var areaParticle = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return xParticle(d.x); })
    .y0(xHeight)
    .y1(function(d) { return yParticle(d.y); });
//initialize brushes
var brushMass = d3.svg.brush()
    .x(x)
    .on("brush", brushedMass);
var brushParticle = d3.svg.brush()
    .x(xParticle)
    .on("brush", brushedParticle);
    
//adding brushes to panels
var svgBrushMass = d3.select("#massPanel").append("svg")
    .attr("height", clientHeight/8+40).attr("width", 500);
var svgBrushParticle = d3.select("#particlePanel").append("svg")
    .attr("height", clientHeight/8+40).attr("width", 500);
    
//transform position to brush 
var contextMass = svgBrushMass.append("g")
    .attr("transform", "translate(" + 40 + "," + 10 + ")"); //staring position
    
var contextParticle = svgBrushParticle.append("g")
    .attr("transform", "translate(" + 40 + "," + 10 + ")"); //staring position

var dataBinMassAllHalos = [];
var dataBinParticleAllHalos = [];

//******************************LOAD DATA
//d3.csv("./../d3/times.csv", function(error1, raw_times) {
//d3.csv("./../d3/similarities.csv", function(error2, raw_sims) {
//CREATE DATA DEPENDENT VARIABLES
//change keys of data to match what is in vis
// var i;
var givenAttrsNodes = Object.getOwnPropertyNames(raw_nodes[0]);
var givenAttrsLinks = Object.getOwnPropertyNames(raw_links[0]);
//variable names in raw data file are values, variable names in javascript are keys
var attrsNodesMap = {
    "grpID": "grpID",
    "timeStep": "timeStep",
    "nowGroup": "nowGroup",
    "mass": "haloMass",
    "totalParticles": "totalParticles",
    "massRatio": "massRatio",
    "prog": "prog",
    "HI": "HI"};
var attrsLinksMap = {
    "nowGroup": "nowGroup",
    "currentTime": "currentTime",
    "currentGroup": "currentGroup",
    "nextGroup": "nextGroup",
    "sharedParticleCount": "sharedParticleCount"};
//change variable names to match what we use and remove ones we don't
for(i = 0; i < raw_nodes.length; i++){
    for(j = 0; j < givenAttrsNodes.length; j++) {
        if (attrsNodesMap[givenAttrsNodes[j]]) {
            if (attrsNodesMap[givenAttrsNodes[j]] != givenAttrsNodes[j]) {
                raw_nodes[i][attrsNodesMap[givenAttrsNodes[j]]] = raw_nodes[i][givenAttrsNodes[j]];
                delete raw_nodes[i][givenAttrsNodes[j]]; 
            }
        } else {
            delete raw_nodes[i][givenAttrsNodes[j]]; 
        }
    }
    raw_nodes[i].haloID = raw_nodes[i].timeStep + "-" + raw_nodes[i].grpID;  
}
for(i = 0; i < raw_links.length; i++){
    for(j = 0; j < givenAttrsLinks.length; j++) {
        if (attrsLinksMap[givenAttrsLinks[j]]) {
            if (attrsLinksMap[givenAttrsLinks[j]] != givenAttrsLinks[j]) {
                raw_links[i][attrsLinksMap[givenAttrsLinks[j]]] = raw_links[i][givenAttrsLinks[j]];
                delete raw_links[i][givenAttrsLinks[j]]; 
            }
        } else {
            delete raw_links[i][givenAttrsNodes[j]]; 
        }
    }
    raw_links[i].currentHalo = raw_links[i].currentTime + "-" + raw_links[i].currentGroup; 
    raw_links[i].nextHalo = (+raw_links[i].currentTime+1) + "-" + raw_links[i].nextGroup;   
}
var maxSharedParticle = 0, minSharedParticle;
var haloMassValuesLog = [], haloParticleValuesLog = [];
minMass = raw_nodes[0].haloMass;
minParticle = raw_nodes[0].totalParticles;
minSharedParticle = raw_links[0].sharedParticleCount;
//LUMINOSITYminLum = raw_nodes[0].lum;
//LUMINOSITYmaxLum = raw_nodes[0].lum;
timeMap = d3.nest().key(function(d) { return d.db }).map(raw_times, d3.map);

raw_links.forEach(function(d) {
    maxSharedParticle = Math.max(maxSharedParticle, +d.sharedParticleCount);
    minSharedParticle = Math.min(minSharedParticle, +d.sharedParticleCount);
});

raw_nodes.forEach(function(d){
    maxTime = Math.max(maxTime, +d.timeStep);
    maxMass = Math.max(maxMass, +d.haloMass);
    minMass = Math.min(minMass, +d.haloMass);
    maxParticle = Math.max(maxParticle, +d.totalParticles);
    minParticle = Math.min(minParticle, +d.totalParticles);
    //LUMINOSITYminLum = Math.min(minLum, +d.lum);
    //LUMINOSITYmaxLum = Math.max(maxLum, +d.lum);
    haloMassValuesLog.push(+getBaseLog(10, d.haloMass));
    haloParticleValuesLog.push(+getBaseLog(10, d.totalParticles));
    //LUMINOSITYhaloLums.push(+d.lum);
});
//scale to fit all timesteps
nodeDistance = width/maxTime
massScale.domain([minMass, maxMass]).range([2,10]);
linkScale.domain([minSharedParticle, maxSharedParticle]).range([2,10]);
//LUMINOSITYlumScale.domain([minLum, maxLum]).range([.09, 1]); //for opacity
timeScale.domain([1,maxTime]).range([0,(maxTime-1)*nodeDistance]);
//calculates the max scale factor
zoom.x(timeScale).scaleExtent([1,(width/8)/nodeDistance]).on("zoom", zoomed);
var yaxis = svg.select(".timeaxis")
    .selectAll("g.timeaxisgroup")
    .data(d3.range(1, maxTime+1))
    .enter().append("g")
    .attr("class","timeaxisgroup")
    .attr("transform", function(d) {
        return "translate(" + timeScale(d) + ", 0)"; });
    
yaxis.append("line")
    .attr("class", "timeaxisline")
    .attr("y1", -margin.bottom)
    .attr("y2", height+margin.bottom);

var yaxislabel = d3.select(".timeaxislabel")
    .selectAll("g.timeaxisgroup")
    .data(d3.range(1, maxTime+1))
    .enter().append("g")
    .attr("class", "timeaxisgroup")
    .attr("transform", function(d) {
        return "translate(" + timeScale(d) + ", 0)"; });

yaxislabel.append("text")
    .attr("x", margin.left)
    .attr("y", margin.top/2-5)
    .attr("text-anchor", "middle")
    .text(function(d) { return timeformat(timeMap.get(d)[0].time); });

//CREATE HALO TREE MAPS
//basically makes an associative array but it's called a d3.map
//for each haloID key, had an array of nodes with that key
//each array will be of length one
haloMap = d3.map();
//** SIMvar similaritiesMap = d3.nest().key(function(d) { return d.from_Group; }).map(raw_sims, d3.map);
var tempHaloNodesMap = d3.nest().key(function(d) { return d.nowGroup; }).map(raw_nodes, d3.map);
var tempHaloLinksMap = d3.nest().key(function(d) { return d.nowGroup; }).map(raw_links, d3.map);
var tempNodesMap, tempLinksMap, tempRoot;
tempHaloNodesMap.forEach(function(k, v) {
    tempNodesMap = d3.nest().key(function(d) { return d.haloID; }).map(v, d3.map);
    tempLinksMap = d3.nest().key(function(d) { return d.nextHalo; }).map(tempHaloLinksMap.get(k), d3.map);
    //make tree structure from links
    tempHaloLinksMap.get(k).forEach(function(link) {
        //nodesMap array for each key has only one element
        var parent = tempNodesMap.get(link.currentHalo)[0];
        var child = tempNodesMap.get(link.nextHalo)[0];
        if (parent.children) {
            parent.children.push(child);
        } else {
            parent.children = [child];
        }
    });
    //root is the node at timestep 1
    tempRoot = tempNodesMap.get("1-"+tempNodesMap.values()[0][0].nowGroup)[0];
    tempRoot.x0 = height/2;
    tempRoot.y0 = 0;
    haloMap.set(k, {root: tempRoot, nodes: tempNodesMap, links: tempLinksMap});
    // similarities: similaritiesMap.get(k)
});
//default group
var halo = haloMap.get(selectedGroup);
console.log(halo);
root = halo.root;
nodesMap = halo.nodes;
linksMap = halo.links;
console.log(nodesMap, linksMap);
haloMassValuescurrentHalo = [], haloParticleValuescurrentHalo = [];
minMassC = maxMass;
maxMassC = 0;
minParticleC = maxParticle;
maxParticleC = 0;

nodesMap.values().forEach(function(d) {
    haloMassValuescurrentHalo.push(+getBaseLog(10, d[0].haloMass))
    haloParticleValuescurrentHalo.push(+getBaseLog(10, d[0].totalParticles));
    minMassC = Math.min(minMassC, +d[0].haloMass);
    maxMassC = Math.max(maxMassC, +d[0].haloMass);
    minParticleC = Math.min(minParticleC, +d[0].totalParticles);
    maxParticleC = Math.max(maxParticleC, +d[0].totalParticles);
});
x.domain([getBaseLog(10,minMass), getBaseLog(10, maxMass)]);
xParticle.domain([getBaseLog(10, minParticle), getBaseLog(10, maxParticle)]);

//make buckets
 dataBinMassAllHalos = d3.layout.histogram()
.bins(20)(haloMassValuesLog);

var temp = [];
temp.x = +getBaseLog(10, maxMassC);
temp.y = 0;
dataBinMassAllHalos.push(temp);

var dataBinMasscurrentHalo = d3.layout.histogram()
.bins(20)(haloMassValuescurrentHalo);

dataBinMasscurrentHalo.push(temp);
temp = []; 
temp.x = +getBaseLog(10, minMassC);
temp.y = 0;
dataBinMasscurrentHalo.unshift(temp);

dataBinParticleAllHalos = d3.layout.histogram()
.bins(20)(haloParticleValuesLog);

temp = [];
temp.y = 0;
temp.x = +getBaseLog(10, maxParticleC);
temp.y = 0;
dataBinParticleAllHalos.push(temp);

var dataBinParticlecurrentHalo = d3.layout.histogram()
.bins(20)(haloParticleValuescurrentHalo);

dataBinParticlecurrentHalo.push(temp);

temp = [];

temp.x = +getBaseLog(10, minParticleC);
temp.y = 0;
dataBinParticlecurrentHalo.unshift(temp);

arrayMeans = [];
var currentmean = 0;

//compute average per tree
dataBinMassAllHalos.forEach(function(d) { d.y = d.y/haloMap.keys().length; });
dataBinParticleAllHalos.forEach(function(d) { d.y = d.y/haloMap.keys().length; });

//set y domains based on bin values
y.domain([0, d3.max(dataBinMasscurrentHalo, function(d) { return d.y; })]);
yParticle.domain([0, d3.max(dataBinParticlecurrentHalo, function(d) { return d.y; })]);
//tie context to area
// contextMass.append("path")
//     .datum(dataBinMassAllHalos)
//     .attr("class", "area")
//     .attr("d", area)
//     .style("opacity", ".7");
            
contextMass.append("path")
    .datum(dataBinMasscurrentHalo)
    .attr("class", "areaTop")
    .attr("d", area)
    .style("opacity", ".9");

// contextParticle.append("path")
//     .datum(dataBinParticleAllHalos)
//     .attr("class", "area")
//     .attr("d", areaParticle)
//     .style("opacity", ".7");
    
contextParticle.append("path")
    .datum(dataBinParticlecurrentHalo)
    .attr("class", "areaTop")
    .attr("d", areaParticle)
    .style("opacity", ".9");

//x, y axes and calling brush
contextMass.append("g")
    .attr("class", "brushxaxis")
    .attr("transform", "translate(0," + xHeight + ")") //axis position
    .call(xAxisMass)
        .selectAll("text")
        .attr("transform","rotate(0) translate(0,0)");

contextMass.append("text")
    .attr("class", "brushxlabel")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .attr("x", clientWidth/7.0)
    .attr("y", clientHeight/7.0)
    .text("Log Mass (1e10)");
    //1e10 is not the same as e^10; this means 1 x 10^10

    
contextMass.append("g")
    .attr("class", "brushyaxis")
    .attr("transform", "translate(0," + 0 + ")") //axis position
    .call(yAxisMass);

contextMass.attr("class", "xbrush")
    .call(brushMass)
    .selectAll("rect")
    .attr("height", xHeight + 10)
    .attr("y", -6);   

contextParticle.append("g")
    .attr("class", "brushxaxis")
    .attr("transform", "translate(0," + xHeight + ")") //axis position
    .call(xAxisParticle)
        .selectAll("text")
        .attr("transform","rotate(0) translate(0,0)");
      
contextParticle.append("text")
    .attr("class", "brushxlabel")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .attr("x", clientWidth/7.0)
    .attr("y", clientHeight/7.0)
    .text("Total Particle Count");
      
contextParticle.append("g")
    .attr("class", "brushyaxis")
    .attr("transform", "translate(0," + 0 + ")") //axis position
    .call(yAxisParticle);
      
contextParticle.attr("class", "xbrush")
    .call(brushParticle)
    .selectAll("rect")
    .attr("height", xHeight + 10)
    .attr("y", -6);
    
//adding the legend 
var areaColors = [{text: "Average", color:"darkblue"}, {text: "Current Halo", color:"lightsteelblue"}];
var legend =  d3.select("#legend").append("svg")
      .attr("class","legend")
      .attr("width", 300)
      .attr("height", 20)
    .selectAll("g")
        .data(areaColors)
    .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + i * 100 + ", 1)"; });
        
    legend.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .style("stroke", "black")
    .style("stroke-width", "2px")
    .style("fill", function(d) {return d.color});

    legend.append("text")
    .attr("x", 24)
    .attr("y", 6)
    .attr("dy", ".35em")
    .text(function(d) {return d.text});

//**SIM populateSlider();
update(root);
//start at zoomed out state
//});
//});

function update(source) {
    //compute the new tree layout.
    var nodes = tree.nodes(root);
    var links = tree.links(nodes);
    //normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * nodeDistance; });

    // Update the nodes…
    var node = graph.selectAll("g.node") //all the nodes
        .data(nodes, function(d, i) { return d.haloID; });

    //enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; });

    nodeEnter.append("circle")
        .attr("class", "shadow")
        .attr("r", 1e-6);
        
    nodeEnter.append("circle")
        .attr("class", "visible")
        .attr("r", 1e-6);
        
    nodeEnter.append("path") //0 0 is center of circle
        .attr("class", "children")
        .attr("d", "M 0 0")
        .style("fill-opacity", 1e-6);
        
    nodeEnter.append("circle")
        .attr("class", "hover")
        .attr("r", 1e-6)
        .on("mouseover", function(d) { //all the information that shows up when you hover over a node
            var x = zoom.scale()*d.x + zoom.translate()[1];
            var y = zoom.scale()*d.y + zoom.translate()[0];
            if (y <= 80) {
                tip_e.show(d);
            } else if (y >= width-100) {
                tip_w.show(d);
            } else if (x <= 50) {
                tip_s.show(d);
            } else {
                tip_n.show(d);
            }
            tooltipShown = true;
        })
        .on("mouseout", function(d) { 
            tip_n.hide(d);
            tip_s.hide(d);
            tip_e.hide(d);
            tip_w.hide(d);
            tooltipShown = false;
        })
        .on("mouseup", function(d) { nodeMouseDown = false; })
        .on("mousedown", function(d) { nodeMouseDown = true; })
        .on("mousemove", function(d) { 
            if (!nodeMouseDown && !tooltipShown) {
                var x = zoom.scale()*d.x + zoom.translate()[1];
                var y = zoom.scale()*d.y + zoom.translate()[0];
                if (y <= 80) {
                    tip_e.show(d);
                } else if (y >= width-100) {
                    tip_w.show(d);
                } else if (x <= 50) {
                    tip_s.show(d);
                } else {
                    tip_n.show(d);
                }
                tooltipShown = true;
            }
        })
        .on("click", click)
        .style("fill", "pink")
        .style("opacity", "0.0001");

    //blur filter 
    nodeEnter.select("circle.shadow").append("defs")  
        .append("filter")  
        .attr("id", "blur")  
        .attr("stdDeviation", 15); 
        
    //transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle.visible")
        .attr("r", function(d) { return massScale(+d.haloMass); })
        .style("stroke", function(d) {return ((1.0 <= +d.massRatio && +d.massRatio <= massRatioHighlight) ? "#FFB31A" : (d.prog==1 ? "#D44848" : "lightsteelblue")); }) //chooses the color of the nodes based on if they are a progenitor
        .style("stroke-width", "2")
        .style("opacity", "1");
    nodeUpdate.select("circle.shadow")
        .attr("r", function(d)
            {
             var scaledMass = massScale(+d.haloMass);
             switch(true)
             {
                case (scaledMass <= 4): return scaledMass+5;
                case (scaledMass <= 5): return scaledMass*2;
                case (scaledMass <= 7): return 10;
                case (scaledMass <= 10): return scaledMass+6;
                
             }
            })
        .style("opacity", ".0001");
        
    nodeUpdate.select("circle.hover")
        .attr("r", function(d){
            if(massScale(+d.haloMass) < 6) {
                return 6;
            } else {
                return massScale(+d.haloMass);
            }
            });
    
    nodeUpdate.select("path.children")
        .style("fill-opacity", function(d) { return d._children ? 0.7 : 1e-6; })
        .attr("d", function(d) {
            var r = massScale(+d.haloMass)+2; //2 for stroke width
            var p = 10;
            var str = "M " + r + " -" + p + " L " + r + " " + p + " L " + (1.5*p+r) + " 0 z";
            return str;
        });
            
    //color filters based on brushes
    // var brushExtentMin = Math.pow(10,brushMass.extent()[0]);
    // var brushExtentMax = Math.pow(10,brushMass.extent()[1]);

    // var brushExtentMinP = Math.pow(10,brushParticle.extent()[0]);
    // var brushExtentMaxP = Math.pow(10,brushParticle.extent()[1]);

    counterHaloSelected = 0;
    var otherCount = 0;
    
    // nodeUpdate.selectAll("circle.shadow")
    //     .filter(function (d){
    //           if((+d.haloMass >= brushExtentMin) && (+d.haloMass <= brushExtentMax))
    //           {
    //              otherCount = otherCount + 1;
    //           }
            
    //         if(
    //            (!brushMass.empty() && brushParticle.empty() && ((+d.haloMass >= brushExtentMin) && (+d.haloMass <= brushExtentMax))) || //mass brush and conditions
    //            (brushMass.empty() && !brushParticle.empty()  && ((d.totalParticles >= brushExtentMinP) && (d.totalParticles <= brushExtentMaxP))) || //particle brush and conditions
    //            (((+d.haloMass >= brushExtentMin) && (+d.haloMass <= brushExtentMax)) && ((d.totalParticles >= brushExtentMinP) && (d.totalParticles <= brushExtentMaxP)))) //both selected
    //            {
    //              counterHaloSelected = counterHaloSelected + 1;
    //              return d;
    //            }
    //     })
    //     .style("fill", "#E3C937")
    //     .style("opacity", ".5")
    //     .style("filter", "url(#blur)");

    nodeUpdate.selectAll("circle.shadow")
        .filter(function (d){
            if(d.selected) {
                counterHaloSelected = counterHaloSelected + 1;
                return d;
            }
        })
        .style("fill", "#E3C937")
        .style("opacity", ".5")
        .style("filter", "url(#blur)");

    textBoxSelected.innerHTML = "<b>" + counterHaloSelected + "/" + nodes.length + " Halos selected </b>";
    
    //transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle.visible")
        .attr("r", 1e-6);

    nodeExit.select("circle.shadow")
        .attr("r", 1e-6);

    //update the links…
    var link = graph.selectAll("path.link")
        .data(links, function(d) { return d.target.haloID; });

    //enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return diagonal({source: o, target: o});
        });

    //transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", function(d) {
            return diagonal(d);
        })
        .style("stroke-width", function(d) { return linkScale(+linksMap.get(d.target.haloID)[0].sharedParticleCount); })
        .style("opacity","0.4")
        .style("stroke-linecap", "round"); //can be butt or square

    //transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
           var o = {x: source.x, y: source.y};
           return diagonal({source: o, target: o});
        })
        .remove();

    //stash the old positions for transition.
    nodes.forEach(function(d) {
        //if node moved with click, we don't want to display tooltip
        //movement via drag is handled with transform, not d.x and d.y
        if (d.x0 != d.x || d.y0 != d.y) {
            tip_n.hide();
            tip_s.hide();
            tip_e.hide();
            tip_w.hide();
        }
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

function getBaseLog(x, y) { //x is base, y is value
    return Math.log(y) / Math.log(x);
}

//returns a list of all nodes under the root.
function flatten(root) {
    var nodes = [];

    function recurse(node) {
        if (node.children) {
            node.children.forEach(recurse);
        }
        nodes.push(node);
    }
    recurse(root);
    return nodes;
}

//function d3 uses when calling tree.links(nodes)
function linkage(nodes) {
    return d3.merge(nodes.map(function(parent) {
        return (parent.children || []).map(function(child) {
            return {
                source: parent,
                target: child
            };
        });
    }));
}

function clearSelected() {
    nodesMap.values().forEach(function(d) { d[0].selected = false; });
}

function updateBrushSelected() {
    var brushExtentMin = Math.pow(10,brushMass.extent()[0]);
    var brushExtentMax = Math.pow(10,brushMass.extent()[1]);

    var brushExtentMinP = Math.pow(10,brushParticle.extent()[0]);
    var brushExtentMaxP = Math.pow(10,brushParticle.extent()[1]);
    function toggleSelect(d) {
        if((!brushMass.empty() && brushParticle.empty() && ((+d.haloMass >= brushExtentMin) && (+d.haloMass <= brushExtentMax))) || //mass brush and conditions
        (brushMass.empty() && !brushParticle.empty()  && ((d.totalParticles >= brushExtentMinP) && (d.totalParticles <= brushExtentMaxP))) || //particle brush and conditions
        (((+d.haloMass >= brushExtentMin) && (+d.haloMass <= brushExtentMax)) && ((d.totalParticles >= brushExtentMinP) && (d.totalParticles <= brushExtentMaxP)))) //both selected
        {
            d.selected = true;
        } else {
            d.selected = false;
        }
        if (d.children) {
            d.children.forEach(function(f) {toggleSelect(f);});
        }
    }
    toggleSelect(root);
}

//toggle children on click.
function click(d) {
    function toggleSelect(d) {
        d.selected = true;
        if (d.children) {
            d.children.forEach(function(f) {toggleSelect(f);});
        }
    }
    if (d3.event.defaultPrevented) {
        return;
    }
    clearSelected();
    //LUMINOSITY if( checkBoxToggleLuminosity.checked) { 
    //     checkBoxToggleLuminosity.checked = false;
    // }
    if(d3.event.shiftKey) {
        graphSelected = false;
        toggleSelect(d);
        svgBrushMass.select(".xbrush").call(brushMass.clear());
        svgBrushParticle.select(".xbrush").call(brushParticle.clear());
        textBoxMinMass.value = 0;
        textBoxMaxMass.value = 0;
        textBoxMinParticle.value = 0;
        textBoxMaxParticle.value = 0;
        var oldDuration = duration;
        //set duration to 0 so the color change is automatic
        duration = 0;
        update(root);
        duration = oldDuration;
    } else {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
}
function zoomed() {
    //hide tooltip on zoom and drag; will be shown again when user moved mouse
    tip_n.hide();
    tip_s.hide();
    tip_e.hide();
    tip_w.hide();
    tooltipShown = false;
    var scale = d3.event.scale;
    var tx = d3.event.translate[0];
    var ty = d3.event.translate[1];

    //100 for padding
    ty = Math.min(Math.max(ty, -scale*height+scale*height/5), height-scale*height/5);
    tx = Math.min(Math.max(tx, -scale*(maxTime-5)*nodeDistance), width-3*scale*nodeDistance);
    //set the zoom translate so if user keeps on scrolling, it doesn't register with zoom
    zoom.translate([tx,ty]);
    graph.attr("transform", "translate(" + [tx,ty] + ")scale(" + scale + ")");
    if (tx == d3.event.translate[0]) {
        svg.select(".timeaxis").selectAll("g.timeaxisgroup")
            .attr("transform", function(d) {
                return "translate(" + timeScale(d) + ", 0)";
            });
        d3.select(".timeaxislabel").selectAll("g.timeaxisgroup")
            .attr("transform", function(d) {
                return "translate(" + timeScale(d) + ", 0)";
            });
        }
}

function changeTree(grp) {
    svgBrushMass.select(".xbrush").call(brushMass.clear());
    svgBrushParticle.select(".xbrush").call(brushParticle.clear());
    //LUMINOSITYluminosityCheck();
    clearSelected();

    var timeOut1, timeOut2 = 0;
    if (zoom.scale() != 1 || zoom.translate()[0] != 0 || zoom.translate()[1] != 0) {
        timeOut1 = duration;
        zoom.scale(1);
        zoom.translate([0,0]);
        graph.transition().duration(duration).attr("transform", "translate(" + [0,0] + ")scale(" + 1 + ")");
        svg.select(".timeaxis").selectAll("g.timeaxisgroup").transition().duration(duration)
            .attr("transform", function(d) {
                return "translate(" + timeScale(d) + ", 0)";
            });
        d3.select(".timeaxislabel").selectAll("g.timeaxisgroup")
            .attr("transform", function(d) {
                return "translate(" + timeScale(d) + ", 0)";
            });
    }

    setTimeout(function(){
        function expand(d) {
            //must check if children and _children so don't expand leaf
            if (d._children) {
                timeOut2 = duration;
                d.children = d._children;
                d._children = null;
                update(d);
                d.children.forEach(expand);
            }
            else if (d.children) {
                d.children.forEach(expand);
            }
        }
        expand(root)
        //pause for the transition to complete
        setTimeout(function(){
            var halo = haloMap.get(grp);
            root = halo.root;
            nodesMap = halo.nodes;
            linksMap = halo.links;
            changeGraph();
            //**SIM changeSlider();
            //exit current tree
            var node = graph.selectAll("g.node")
            .data([]);
            //transition exiting nodes
            var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + root.y0 + "," + root.x0 + ")"; })
            .remove();

            nodeExit.select("circle")
            .attr("r", 1e-6);

            nodeExit.select("text")
            .style("fill-opacity", 1e-6);

            //exit link
            var link = graph.selectAll("path.link")
            .data([]);

            // Transition exiting nodes
            link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
               var o = {x: root.x0, y: root.y0};
               return diagonal({source: o, target: o});
            })
            .remove();
            setTimeout(function() {
                update(root);
            }, duration);
        }, timeOut2);
    }, timeOut1);
}

function changeGraph() {
    
    minMassC = maxMass;
    maxMassC = 0;
    minParticleC = maxParticle;
    maxParticleC = 0;
    var haloMassValuescurrentHalo = [], haloParticleValuescurrentHalo = [];
    nodesMap.values().forEach(function(d) {
        haloMassValuescurrentHalo.push(+getBaseLog(10, d[0].haloMass))
        haloParticleValuescurrentHalo.push(+getBaseLog(10, d[0].totalParticles));
        minMassC = Math.min(minMassC, +d[0].haloMass);
        maxMassC = Math.max(maxMassC, +d[0].haloMass);
        minParticleC = Math.min(minParticleC, +d[0].totalParticles);
        maxParticleC = Math.max(maxParticleC, +d[0].totalParticles);
          
    });
    
    var dataBinMasscurrentHalo = d3.layout.histogram()
        .bins(20)(haloMassValuescurrentHalo);
    var dataBinParticlecurrentHalo = d3.layout.histogram()
        .bins(20)(haloParticleValuescurrentHalo);

    var temp = [];
    temp.x = +getBaseLog(10, maxMassC);
    temp.y = 0;
    dataBinMasscurrentHalo.push(temp);

    temp = [];
    temp.x = +getBaseLog(10, minMassC);
    temp.y = 0;
    dataBinMasscurrentHalo.unshift(temp);

    temp = [];
    temp.x = +getBaseLog(10, maxParticleC);
    temp.y = 0;
    dataBinParticlecurrentHalo.push(temp);

    temp = [];
    temp.x = +getBaseLog(10, minParticleC);
    temp.y = 0;
    dataBinParticlecurrentHalo.unshift(temp);
    
    y.domain([0, d3.max(dataBinMasscurrentHalo, function(d) { return d.y; })]);
   yParticle.domain([0, d3.max(dataBinParticlecurrentHalo, function(d) { return d.y; })]);
    
    d3.selectAll(".brushyaxis .tick").remove();
    
     contextMass.select(".area")
        .datum(dataBinMassAllHalos)
        .transition()
        .duration(duration)
        .attr("d", area)
        .style("opacity", ".7");
                
    contextParticle.select(".area")
        .datum(dataBinParticleAllHalos)
        .transition()
        .duration(duration)
        .attr("d", areaParticle)
        .style("opacity", ".7");
    
    contextMass.append("g")
        .attr("class", "brushyaxis")
        .attr("transform", "translate(0," + 0 + ")") //axis position
        .call(yAxisMass);
        
        
    contextParticle.append("g")
        .attr("class", "brushyaxis")
        .attr("transform", "translate(0," + 0 + ")") //axis position
        .call(yAxisParticle);
    
    contextMass.select(".areaTop")
        .datum(dataBinMasscurrentHalo)
        .transition()
        .duration(duration)
        .attr("d", area)
        .style("opacity", ".9");

    contextParticle.select(".areaTop")
        .datum(dataBinParticlecurrentHalo)
        .transition()
        .duration(duration)
        .attr("d", areaParticle)
        .style("opacity", ".9");
}

function resetTree() {
    var timeOut1 = 0;
    if (zoom.scale() != 1 || zoom.translate()[0] != 0 || zoom.translate()[1] != 0) {
        timeOut1 = duration;
        zoom.scale(1);
        zoom.translate([0,0]);
        graph.transition().duration(duration).attr("transform", "translate(" + [0,0] + ")scale(" + 1 + ")");
        svg.select(".timeaxis").selectAll("g.timeaxisgroup").transition().duration(duration)
            .attr("transform", function(d) {
                return "translate(" + timeScale(d) + ", 0)";
            });
        d3.select(".timeaxislabel").selectAll("g.timeaxisgroup")
            .attr("transform", function(d) {
                return "translate(" + timeScale(d) + ", 0)";
            });
    }
    //pause for the transition to complete
    setTimeout(function(){
        function expand(d) {
            //must check if children and _children so don't expand leaf
            if (d._children) {
                d.children = d._children;
                d._children = null;
                update(d);
                setTimeout(function() { d.children.forEach(expand); }, duration);
                //update(d);
            }
            else if (d.children) {
                d.children.forEach(expand);
            }
        }
        expand(root)
    }, timeOut1);
}

function download() {
    var data = "grpID,Time(gyr),Mass,HI,MassRatio\n";
    function buildHaloString(d) {
        if (d.selected) {
            data += [d.grpID,timeMap.get(d.timeStep)[0].time,d.haloMass,d.HI,d.massRatio].join(',') + "\n";
        }
        if (d.children) {
            d.children.forEach(function(f) {buildHaloString(f);});
        }
    }
    buildHaloString(root);
    var data2 = "timeStep,ChildGrp,DescendantGrp,SharedParticleCount,SharedDarkParticleCount\n";
    function buildEdgeString(d) {
        if (d.children) {
            if (d.selected) {
                d.children.forEach(
                    function(f) {
                        if (f.selected) {
                            edgeData = linksMap.get(f.haloID)[0]
                            data2 += [timeMap.get(edgeData.currentTime)[0].time,edgeData.currentGroup,edgeData.nextGroup,edgeData.sharedParticleCount].join(',') + "\n";
                        }
                    });
                }
            d.children.forEach(function(f) {buildEdgeString(f);});  
        }
    }
    buildEdgeString(root);
    var curWindow = window;
    curWindow.open("data:text/plain," + encodeURIComponent(data), "_blank", "width=500,height=500,top=100,left=100");
    //for another way to write it out
    //myWindow1.document.write("<p>" + data + "</p>");
    //myWindow1.focus();
    curWindow.open("data:text/plain," + encodeURIComponent(data2), "_blank", "width=500,height=500,top=200,left=200");
    //myWindow.focus();
}


function brushedMass() {
      
    //LUMINOSITYluminosityCheck();
    if(brushMass.extent()[0] != brushMass.extent()[1] )
    {
        graphSelected = true;
        var expFormatText = function (x) {return x.toExponential(3);};
        textBoxMinMass.value = expFormatText(Math.pow(10,brushMass.extent()[0]));
        textBoxMaxMass.value = expFormatText(Math.pow(10,brushMass.extent()[1]));
    }
    else{
        if (brushParticle.empty()) {
            graphSelected = false;
        }
        textBoxMinMass.value = 0;
        textBoxMaxMass.value = 0;
    }
    updateBrushSelected();
    var oldDuration = duration;
    //set duration to 0 so the color change is automatic
    duration = 0;
    update(root);
    duration = oldDuration;
}

function brushedParticle(){

    //LUMINOSITYluminosityCheck();
    if(brushParticle.extent()[0] !=  brushParticle.extent()[1])
    {
        graphSelected = true;
        var expFormatText = function (x) {return x.toExponential(3);};
        textBoxMinParticle.value = expFormatText(Math.pow(10,brushParticle.extent()[0]));
        textBoxMaxParticle.value = expFormatText(Math.pow(10,brushParticle.extent()[1]));
    } else {
        if (brushMass.empty()) {
            graphSelected = false;
        }
        textBoxMinParticle.value = 0;
        textBoxMaxParticle.value = 0;
    }
    updateBrushSelected();
    var oldDuration = duration;
    //set duration to 0 so the color change is automatic
    duration = 0;
    update(root);
    duration = oldDuration;
}

buttonMass.on("click", function(d) {
    var high = +textboxMaxMass.value;
    var low = +textboxMinMass.value;
    if(low < minMass || low > high)
    {
        low = minMass;
    }
    if(high > maxMass || high < low)
    {
        high = maxMass;
    }
    svgBrushMass.select(".xbrush")
        .transition()
        .call(brushMass.extent([getBaseLog(10, low), getBaseLog(10, high)]));
    brushedMass();
});

buttonParticle.on("click", function(d) {
    var high = +textboxMaxParticle.value;
    var low = +textboxMinParticle.value;
    if(low < minParticle || low > high)
    {
        low = minParticle;
    }
    if(high > maxParticle || high < low)
    {
        high = maxParticle;
    }
    svgBrushParticle.select(".xbrush")
        .transition()
        .call(brushParticle.extent([getBaseLog(10, low), getBaseLog(10, high)]));
    brushedParticle();
});

function updateMassRatio()
{
    massRatioHighlight = +textboxMassRatio.value;
    if (massRatioHighlight < 0)
    {
        massRatioHighlight = 5.0;
        textboxMassRatio.value = 5.0;
    }
    update(root);
};

function luminosityCheck()
{
    if (checkBoxToggleLuminosity.checked)
    {
      checkBoxToggleLuminosity.checked = false;
    }
}

function toggleGraphs() {
    //LUMINOSITY var initial = checkBoxToggleLuminosity.checked; //if luminosity is on, get it back at the end
    svgBrushMass.select(".xbrush").call(brushMass.clear());
    svgBrushParticle.select(".xbrush").call(brushParticle.clear());
    textBoxMinParticle.value = 0;
    textBoxMaxParticle.value = 0;
    textBoxMinMass.value = 0;
    textBoxMaxMass.value = 0;
    if (graphSelected) {
        graphSelected = false;
        clearSelected();
        var oldDuration = duration;
        duration = 0;
        update(root);
        duration = oldDuration;
    }
    $('#panelContent').toggle();
    //LUMINOSITY if(initial)
    // {
    //     checkBoxToggleLuminosity.checked = true;
    //     toggleLuminosity();
    // }
};

function toggleTooltips() {
    if(checkBoxToggleTooltips.checked)
    {
        d3.selectAll(".d3-tip").remove();
    }
    else{
        svg.call(tip_n);
        svg.call(tip_s);
        svg.call(tip_e);
        svg.call(tip_w);
    }
};

function toggleLuminosity() {
    if(checkBoxToggleLuminosity.checked)
    {
       svgBrushMass.select(".xbrush").call(brushMass.clear());
       svgBrushParticle.select(".xbrush").call(brushParticle.clear());
       textBoxMinParticle.value = 0;
       textBoxMaxParticle.value = 0;
       textBoxMinMass.value = 0;
       textBoxMaxMass.value = 0;
       
       var nodesStroke = d3.selectAll("circle.visible")
            .transition()
            .style("stroke", "white")
            .style("stroke-width", "1")
            .style("opacity", function(d)
            {
                if(d.lum == 0)
            {
                return "0";
            }
            else
            {
                return ".07";
            }
            })
            .attr("r",  10); //slightly smaller due to blur of circle.shadow
       

        var nodesShadow = d3.selectAll("circle.shadow")
            .transition()
            .filter(function(d) {if(d.lum !=0) {return d;}})
            .style("fill", "white")
            .attr("r",  13)
            .style("opacity", function (d) 
            {
                return lumScale(d.lum);
            })
            .style("filter", "url(#blur)");
                         
                         
        var otherShade = d3.selectAll("circle.shadow")
            .filter(function(d) {if(d.lum ==0) {return d;}})
            .style("fill", "black")
            .style("opacity", 1)
            .attr("r",  10);
        
        
                            
        var edges = d3.selectAll("path.link")
            .transition()
            .style("stroke", "gray")
            .style("opacity", ".3");
        
    }
    else {
        update(root);
    }
};

function tipHtml(d) {
    var color = "black";
    return "Halo Group: <span style='color:" + color +"'>"  + d.grpID + "</span><br/>" 
          + "Halo Mass: <span style='color:" + color +"'>" + (+d.haloMass).toExponential(3) + "</span><br/>" 
          + "Total Particles: <span style='color:" + color +"'>" + d.totalParticles + "</span><br/>"
          + "HI: <span style='color:" + color +"'>" + (+d.HI).toExponential(3) + "</span><br/>"
          + "Merger Mass Ratio It Participated In: <span style='color:" + color +"'>" + d3.round(+d.massRatio, 2) + "</span><br/>";
}

function textBoxGroupEnter() {
    var val = document.getElementById("textBoxGroup").value;
    if (val && haloMap.keys().indexOf(val) == -1) {
        alert("That group is not in this data");
    } else if(val != root.grpID) {
        changeTree(val);
    }
}

function createThumb(d, i) {
    //clear html so refresh the existing thumbnail
    //console.log(d, haloMap.get(80));
    d3.select(this).html([]);
    createThumbnailTree(d3.select(this), parseInt($("svg", $("#sliderContent")).css("width")), parseInt($("svg", $("#sliderContent")).css("height")), haloMap.get(80),linkScale.domain(), maxTime);
}

function populateSlider() {
    var curGrp = root.grpID;
    var similarities = haloMap.get(curGrp).similarities;
    current = similarities[0];
    similarities = similarities.slice(1,similarities.length);
    
    var currentImage = d3.select("#sliderContent")
        .append("div")
        .attr("id", "current")
        .attr("class", "viewer");
    
    currentImage.append("div")
        .attr("class", "spacing")
        .text("cur")
        .style("opacity", 0);
    
    currentImage = currentImage.append("div")
        .selectAll(".item")
        .data([current])
        .enter()
        .append("div")
        .attr("class", "item");

    currentImage
        .append("svg")
        .each(createThumb);

    // .append("img")
    //     .attr("src", function(d) {
    //         return "./../images/mergerTree/halo_small"+d.to_Group+".png";
    //         //return "images/halo_small"+d.to_Group+".png";
    //     });

    currentImage.append("form")
        .text("Current Group: ")
        .attr("onSubmit", "textBoxGroupEnter(); return false;")
        .append("input")
        .attr("id", "textBoxGroup")
        .style("width", "25px")
        .attr("value", function(d) { return d.to_Group; });


    var slider = d3.select("#sliderContent")
        .append("div")
        .attr("class", "viewer")
        .attr("id", "similarities");
    
    slider.append("div")
        .attr("class", "spacing")
        .text("sim")
        .style("opacity", "0");

    slider = slider.append("div")
        .attr("class", "content-conveyor")
        .selectAll(".item")
        .data(similarities) //don't specify key function because was to be joined on index
        .enter()
        .append("div")
        .attr("class", "item");

    slider.append("a")
        .attr("href", "#")
        .on("click", function(d) { changeTree(d.to_Group); })
        .append("svg")
        .each(createThumb);

    slider.append("div")
        .attr("class", "text")
        .text(function(d) { return "Group: " + d.to_Group; });

    activateSlider();
}

function changeSlider() {
    var curGrp = root.grpID;
    var similarities = haloMap.get(curGrp).similarities;
    current = similarities[0];
    similarities = similarities.slice(1,similarities.length);

    var currentImage = d3.select("#sliderContent")
        .select("#current")
        .selectAll(".item")
        .data([current]);

    currentImage.select("svg")
        .each(createThumb);

    document.getElementById("textBoxGroup").value = current.to_Group;

    var slider = d3.select("#sliderContent")
        .select(".content-conveyor")
        .selectAll(".item")
        .data(similarities);

    slider.select("a")
        .on("click", function(d) { changeTree(d.to_Group); })
        .select("svg")
        .each(createThumb);

    slider.select(".text")
        .text(function(d) { return "Group: " + d.to_Group; });
        
}

function activateSlider() {
    //vars
    var current = $("#current", $("#sliderContent")),
    similar = $("#similarHalo", $("#sliderContainer")),
    viewer = $("#similarities", $("#sliderContent")),
    conveyor = $(".content-conveyor", $("#sliderContent")),
    item = $(".item", $("#similarities"));
    //console.log(item.length);
    //set width current
    current.css("width", parseInt(item.css("width")));
    //sets text left position
    similar.css("left", parseInt(item.css("width"))+8);
    //set width viewer
    viewer.css("width", parseInt($("#sliderContent").css("width")) - 5 - parseInt(item.css("width")));
    /*viewer.css("margin-left", parseInt(item.css("width")));*/
    //set length of conveyor
    conveyor.css("width", item.length * parseInt(item.css("width")));
    //console.log(item.length, item.css("width"), ("#similarities", $("#sliderContent")).css("width"));
    //config
    // var sliderOpts = {
    //     max: (item.length * parseInt(item.css("width"))) - parseInt($("#similarities", $("#sliderContent")).css("width")),
    //     slide: function(e, ui) { 
    //         conveyor.css("left", "-" + ui.value + "px");
    //     }
    // };
    // $("#slider").css("width", parseInt(viewer.css("width")));
    // $("#slider").css("left", parseInt(item.css("width"))+10);
    // //create slider
    // $("#slider").slider(sliderOpts);
}

//assign merger tree object variable functions
this.updateMassRatio = updateMassRatio;
this.download = download;
this.resetTree = resetTree;
this.toggleGraphs = toggleGraphs;
this.toggleTooltips = toggleTooltips;
};
