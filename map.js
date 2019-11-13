'use strict'

var width = 700
var height = 580
var svg = ""
var albersProjection = d3.geoAlbers()
.scale(190000)
.rotate([71.057, 0])
.center([0, 42.313])
.translate([width / 2,height / 2])
var geoPath = d3.geoPath()
    .projection(albersProjection)


window.onload = function () {
    svg = d3.select("body")
        .append( "svg" )
        .attr("width", width)
        .attr("height", height)
    d3.json("neighborhoods.json", function(error1, neighborhoods_data) {
        d3.json("points.json", function(error2, points_data) {
            drawMap(neighborhoods_data, points_data)
        })
    })
}

function drawMap(neighborhoods_data, points_data) {
  addMapLayer(neighborhoods_data)
  addPathLayer(points_data)
  addPointsLayer(points_data)
}

function addPointsLayer(points_data) {
  var points = svg.append("g")
  points.selectAll("path")
    .data(points_data.features)
    .enter()
    .append("path")
    .attr("fill", "#900")
    .attr("stroke", "#999")
    .attr("d", geoPath)
}

function addMapLayer(neighborhoods_data) {
var neighborhoods = svg.append("g")
neighborhoods.selectAll( "path" )
  .data(neighborhoods_data.features)
  .enter()
  .append("path")
  .attr("fill", "#ccc")
  .attr("d", geoPath)
}

function addPathLayer(points_data) {
  var links = []
  for(var i=0, len=points_data.features.length-1; i<len; i++) {
    var p1 = albersProjection(points_data.features[i].geometry.coordinates)
    var p2 = albersProjection(points_data.features[i + 1].geometry.coordinates)
    links.push({
      type: "LineString",
          coordinates: [
              [ p1[0], p1[1] ],
              [ p2[0], p2[1] ]
          ]
    })
  }
  var lines = svg.append("g")
  lines.selectAll("line")
    .data(links)
    .enter()
    .append("line") 
    .attr("x1", d=>d.coordinates[0][0])
    .attr("y1", d=>d.coordinates[0][1])
    .attr("x2", d=>d.coordinates[1][0])
    .attr("y2", d=>d.coordinates[1][1])
    .attr("id", function(d, i) { return "line" + i})
    .attr("stroke", "steelblue")
  svg.selectAll("line").style("opacity", "0")
  animatePath()
}

function animatePath() {
    d3.selectAll("line").style("opacity", "1")
    d3.selectAll("line").each(function(d, i) {
    var totalLength = d3.select("#line" + i).node().getTotalLength();
    d3.select("#line" + i).attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(500)
      .delay(220*i)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
      .style("stroke-width", 3)
    })
  }