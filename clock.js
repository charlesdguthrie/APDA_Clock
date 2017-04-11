/*
clock.js
Author: Charlie Guthrie for the American Parkinson Disease Assocation

Script for APDA clock. 
Looks for a 'chart' class div and builds a clock inside it.
Adjust size using the width parameter on the first line.
*/
  var width = 900;

  var clockGroup, fields, formatHour, formatMinute, formatSecond, 
  height, offSetX, offSetY, pi, render, scaleHours, scaleSecsMins, 
  vis, face;

  //Height, width, and location parameters of the hands
  var imwidth = 667.2703;
  var imheight = 246.63;
  var zoom = width/imwidth;
  height = imheight * zoom;
  offSetX = .8085*width;
  offSetY = .4971*height;
  pi = Math.PI;

  var apdaDBlue = "#001E60";
  var apdaBlue = "#005EB8";
  var apdaRed = "#E00747";
  var apdaYellow = "#B7BF10";
  var apdaGreen = "#48A23F";

  formatSecond = d3.time.format("%S");
  formatMinute = d3.time.format("%M");
  formatHour = d3.time.format("%H");

  fields = function() {
    //Set text values
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

  scaleSecsMins = d3.scale.linear()
                    .domain([0, 59 + 59 / 60])
                    .range([0, 2 * pi]);

  scaleHours = d3.scale.linear()
                  .domain([0, 11 + 59 / 60])
                  .range([0, 2 * pi]);

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

  //Set up initial chart
  vis = d3.selectAll(".chart")
    .append("svg:svg")
    .attr("width", width)
    .attr("height", height);

  var clock_x = 0;
  var clock_y = 0;

  //Add clock face image
  vis.append("image")
    .attr("xlink:href", "clock face w text.svg")
    .attr('width', width)
    .attr('height', height)
    .attr("transform", "translate(" + clock_x + "," + clock_y + ")");

  //Build clock hands
  clockGroup = vis.append("svg:g")
                  .attr("transform", "translate("+offSetX+","+offSetY+")")
                  .attr("class","clockGroup");
  clockGroup.append("svg:circle")
    .attr("r", 4*zoom).attr("fill", apdaDBlue)
    .attr("class", "clock innercircle");

  //Add counter to track diagnoses this month
  clockGroup.append("text")
    .attr("class","counter")
    .attr("transform", "translate(" + 50*zoom + "," + 5*zoom + ")")
    .attr("dy", ".35em")
    .style("font-size",18*zoom)
    .style("text-anchor", "middle")
    .style("fill",apdaBlue)
    .style("font-family","Montserrat")
    .text(formatCounter(0));

  render = function(data) {
    var hourArc, minuteArc, secondArc;
    clockGroup.selectAll(".hand").remove();
    clockGroup.selectAll(".secondCircle").remove();
    secondArc = d3.svg.arc()
                  .innerRadius(0)
                  .outerRadius(85*zoom)
                  .startAngle(function(d) {
                    return scaleSecsMins(d.numeric);
                  })
                  .endAngle(function(d) {
                    return scaleSecsMins(d.numeric);
                  });
    minuteArc = d3.svg.arc()
                  .innerRadius(0)
                  .outerRadius(85*zoom)
                  .startAngle(function(d) {
                    return scaleSecsMins(d.numeric);
                  })
                  .endAngle(function(d) {
                    return scaleSecsMins(d.numeric);
                  });
    hourArc = d3.svg.arc()
                .innerRadius(0)
                .outerRadius(65*zoom)
                .startAngle(function(d) {
                  return scaleHours(d.numeric % 12);
                })
                .endAngle(function(d) {
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
        .attr("transform", "translate(" + 1*zoom + "," + 1*zoom + ")")
        .attr("stroke", "#999999")
        .attr("opacity",0.7)
        .attr("stroke-width", function(d) {
          if (d.unit === "seconds") {
            return 2*zoom;
          } else if (d.unit === "minutes") {
            return 3*zoom;
          } else if (d.unit === "hours") {
            return 4*zoom;
          }
        }).attr("fill", "none")

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
          return apdaGreen
        } else return apdaDBlue;
      })

      .attr("stroke-width", function(d) {
        if (d.unit === "seconds") {
          return 2*zoom;
        } else if (d.unit === "minutes") {
          return 3*zoom;
        } else if (d.unit === "hours") {
          return 4*zoom;
        }
      }).attr("fill", "none");

      clockGroup.append("svg:circle")
                .attr("r", 3*zoom)
                .attr("fill", apdaGreen)
                .attr("class", "clock secondCircle");

    };


  setInterval(function() {
    var data;
    data = fields();
    return render(data);
  }, 1000);

