/*
Clock face.  Based on Eric Bullington's D3 O' Clock
https://ericbullington.com/blog/2012/10/27/d3-oclock/

By Charlie Guthrie for APDA
5/24/15

Draws animated clock hands on APDA's promotional clock face
for Parkinson's awareness month
 */


var clockGroup, fields, formatHour, formatMinute, formatSecond, 
height, offSetX, offSetY, pi, render, scaleHours, scaleSecsMins, vis, face,width;


//Variable width.  Adjust here to adjust the overall size of the clock.
vis = d3.select(".chart");
width = $(".chart").width();
DEFAULT_WIDTH = 400;
DEFAULT_HEIGHT = 200;
console.log(width);

var apdaBlue = "#0072C6"
var apdaRed = "#E00747"

formatSecond = d3.time.format("%S");
formatMinute = d3.time.format("%M");
formatHour = d3.time.format("%H");

//Set time units
fields = function() {
  var d, data, hour, minute, second;
  d = new Date();
  second = d.getSeconds();
  minute = d.getMinutes();
  hour = d.getHours() + minute / 60;
  return data = [
    {
      "unit": "minutes",
      "text": formatMinute(d),
      "numeric": minute
    }, {
      "unit": "hours",
      "text": formatHour(d),
      "numeric": hour
    },
    {
      "unit": "seconds",
      "text": formatSecond(d),
      "numeric": second
    }
  ];
};

height = width/2;

offSetX = 293/DEFAULT_WIDTH*width;

offSetY = 100.5/DEFAULT_HEIGHT*height;

pi = Math.PI;

scaleSecsMins = d3.scale.linear().domain([0, 59 + 59 / 60]).range([0, 2 * pi]);

scaleHours = d3.scale.linear().domain([0, 11 + 59 / 60]).range([0, 2 * pi]);

var formatCounter = d3.format("04d")

//Get number of diagnoses since the beginning of the month
function countDiagnoses(){
  now = new Date()
  year = now.getFullYear()
  month = now.getMonth()
  firstOfMonth = new Date(year,month,1)
  diagnosesThisMonth = Math.round((now-firstOfMonth)/60/9/1000)
  return diagnosesThisMonth
}

//Build base svg
vis = vis.append("svg:svg")
  .attr("width", width)
  .attr("height", height);

//Append clock face svg image
vis.append("image")
  .attr("xlink:href", "clock face.svg")
  .attr('width', 411/DEFAULT_WIDTH*width)
  .attr('height', 411/DEFAULT_HEIGHT*height)
  .attr("transform", "translate(" + -19.3/DEFAULT_WIDTH*width + "," + -106/DEFAULT_HEIGHT*height + ")");

clockGroup = vis.append("svg:g").attr("transform", "translate(" + offSetX + "," + offSetY + ")")
                .attr("class","clockGroup");

//Add counter to track diagnoses this month
clockGroup.append("text")
  .attr("class","counter")
  .attr("transform", "translate(" + 42/DEFAULT_WIDTH*width + "," + 1/DEFAULT_WIDTH*height + ")")
  .attr("dy", ".35em")
  .style("font-size",18/DEFAULT_WIDTH*width)
  .style("text-anchor", "middle")
  .text(formatCounter(0));

//Attach counter copy text
clockGroup.append("text")
  .attr("class","faceText")
  .attr("transform", "translate(" + 18/DEFAULT_WIDTH*width + "," + 40/DEFAULT_WIDTH*height + ")")
  .attr("dy", ".35em")
  .style("font-size",11/DEFAULT_WIDTH*width)
  .style("text-anchor", "left")
  .text("so far this");

clockGroup.append("text")
  .attr("class","faceText")
  .attr("transform", "translate(" + 18/DEFAULT_WIDTH*width + "," + 68/DEFAULT_WIDTH*height + ")")
  .attr("dy", ".35em")
  .style("font-size",11/DEFAULT_WIDTH*width)
  .style("text-anchor", "left")
  .text("month");  

//Animate the clock
render = function(data) {
  var hourArc, minuteArc, secondArc;
  clockGroup.selectAll(".hand").remove();
  clockGroup.selectAll(".secondCircle").remove();
  clockGroup.selectAll(".innerCircle").remove();

  secondArc = d3.svg.arc().innerRadius(0).outerRadius(70/DEFAULT_WIDTH*width).startAngle(function(d) {
    return scaleSecsMins(d.numeric);
  }).endAngle(function(d) {
    return scaleSecsMins(d.numeric);
  });
  minuteArc = d3.svg.arc().innerRadius(0).outerRadius(70/DEFAULT_WIDTH*width).startAngle(function(d) {
    return scaleSecsMins(d.numeric);
  }).endAngle(function(d) {
    return scaleSecsMins(d.numeric);
  });
  hourArc = d3.svg.arc().innerRadius(0).outerRadius(50/DEFAULT_WIDTH*width).startAngle(function(d) {
    return scaleHours(d.numeric % 12);
  }).endAngle(function(d) {
    return scaleHours(d.numeric % 12);
  });

  //Update counter
  clockGroup.select(".counter")
    .transition()
      .duration(500)
      .tween("text", function() { 
        var i = d3.interpolateRound(+this.textContent, +countDiagnoses());
        return function(t) {
          this.textContent = formatCounter(i(t));
        };
      });

  //Add shadows of hands
  clockGroup.selectAll(".hand shadow").data(data).enter()
    .append("svg:path").attr("d", function(d) {
      if (d.unit === "seconds") {
        return secondArc(d);
      } else if (d.unit === "minutes") {
        return minuteArc(d);
      } else if (d.unit === "hours") {
        return hourArc(d);
      }
    }).attr("class", "hand shadow")
      .attr("transform", "translate(" + 1/DEFAULT_WIDTH*width + "," + 1/DEFAULT_WIDTH*width + ")")
      .attr("stroke", "#999999")
      .attr("opacity",0.7)
      .attr("stroke-width", function(d) {
        if (d.unit === "seconds") {
          return 2/DEFAULT_WIDTH*width;
        } else if (d.unit === "minutes") {
          return 3/DEFAULT_WIDTH*width;
        } else if (d.unit === "hours") {
          return 4/DEFAULT_WIDTH*width;
        }
      }).attr("fill", "none")

  //Add center circle
  clockGroup.append("svg:circle").attr("r", 5.4/DEFAULT_WIDTH*width).attr("fill", "black").attr("class", "clock innerCircle");

  //Add clock hands
  clockGroup.selectAll(".hand actual").data(data).enter()
    .append("svg:path").attr("d", function(d) {
      if (d.unit === "seconds") {
        return secondArc(d);
      } else if (d.unit === "minutes") {
        return minuteArc(d);
      } else if (d.unit === "hours") {
        return hourArc(d);
      }
    })
    .attr("class", "hand actual")
    .attr("stroke", function(d){
      if (d.unit === "seconds"){
        return apdaBlue
      } else return "black";
    })

    .attr("stroke-width", function(d) {
      if (d.unit === "seconds") {
        return 2/DEFAULT_WIDTH*width;
      } else if (d.unit === "minutes") {
        return 3/DEFAULT_WIDTH*width;
      } else if (d.unit === "hours") {
        return 4/DEFAULT_WIDTH*width;
      }
    }).attr("fill", "none");

  //Add circular cover for second hand
  clockGroup.append("svg:circle").attr("r", 3/DEFAULT_WIDTH*width).attr("fill", apdaBlue).attr("class", "clock secondCircle");

};

//Run, rendering every second.  
setInterval(function() {
  var data;
  data = fields();
  return render(data);
}, 1000);

