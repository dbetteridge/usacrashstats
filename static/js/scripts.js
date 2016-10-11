A_AGE3 = {1:"0-3",2:"4-7",3:"8-12",4:"13-15",5:"16-20",6:"21-24",7:"25-34",8:"35-44",9:"45-54",10:"55-64",11:"65-74",12:"75+",13:"NA"}
var globalAgeData;
var globalTimeData;
//fetch('/age')
fetch('age.json')
.then(function(data){
    return data.json()
})
.then(function(json){
    globalAgeData = json;
    displayData(json)
})

function displayData(agedata){
    var map = L.map('statMap').setView([37.0902,-95.7129],4)
    
    //fetch('/time')
    fetch('time.json')
    .then(function(data){
        return data.json()
    })
    .then(function(json){ 
        globalTimeData = json;
        timeGraph(json,agedata,map);
        timedata = json;
        ageGraph(agedata,timedata, map);
        createMap(agedata,timedata,map); 
    });
       
}

function countData(data){
    var countAges = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0};
   
    data.map(function(element){
        
        countAges[element.A_AGE3] +=1
    });
    
    return countAges
}

function ageGraph(agedata,timedata, map){
    var countAges = countData(agedata)
    countAgesMax = 0
    Object.keys(countAges).map(function(element){
        if (countAges[element] > countAgesMax){
            countAgesMax = countAges[element]
        }
    })
    
    
    var keys = Object.keys(countAges);
    var values = keys.map(function(v){ return countAges[v];});
    var height = 300;
    var width = 450;
    var x = d3.scaleLinear()
    .domain([0, countAgesMax])
    .range([0,width-50]) 
    var y = d3.scaleLinear()
    .domain([0, height-40])
    .range([0,height-40])   
    var xAxis = d3.axisBottom(x);   
    var yAxis = d3.axisLeft(y).tickFormat(""); 
    var barHeight = 20;
    d3.select(".ageData").selectAll("svg > *").remove();
    var ageData = d3.select(".ageData");       
    ageData.attr("width", width).attr("height",height);
    var bar = ageData.selectAll("g")
        .data(values)
    .enter().append("g")
        .attr("transform", function(d, i) { return "translate(20," + i * barHeight + ")"; });        
    bar.append("rect")
        .style("width", function(d) { return x(d) + "px";})
        .style("height", barHeight +"px")      
        .attr("stroke", "black")  
        .attr("fill","steelblue")
        .attr("height", barHeight +"px")
        .attr("width", function(d,i) { return x(d) + "px";})        
        .on("click", function(d,i) { 
              
                if(map._containerId){
                    map.remove();
                    map = L.map('statMap').setView([37.0902,-95.7129],4)
                }
              var newagedata = [];
              for(var j=0;j<agedata.length;j++){
                  if(agedata[j].A_AGE3 == i+1){
                      newagedata.push(agedata[j]);
                  }
              }    
              var newtimedata = [];      
              for(var a=0;a<newagedata.length;a++){
                  for(var b=0;b<timedata.length;b++){
                      if(newagedata[a].ST_CASE == timedata[b].ST_CASE){
                          newtimedata.push(timedata[b]);
                      }
                  }
              }
              timeGraph(newtimedata,newagedata,map);
              ageGraph(newagedata,newtimedata,map);
              createMap(newagedata, newtimedata,map);
              document.getElementById('resetAge').onclick = function(){
                  resetAge(newtimedata,map);
              }
              document.getElementById('resetTime').onclick = function(){
                  resetTime(newagedata,map);
              }              
              
          });
    bar.append("text")
        .attr("x", function(d) { return x(d) + 30; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d,i){ return A_AGE3[i+1]})
    d3.select(".ageData").append("g")
        .attr("transform", "translate(20,"+(height-40)+")")
        .attr("class", "xAxis")
        .call(xAxis)
    .append("text")
        .text("Number of Injuries")
        .attr("transform", "translate("+width/2+",30)")
    d3.select(".ageData").append("g")
        .attr("transform", "translate(20,0)")
        .attr("class", "yAxis")
        .call(yAxis)                
    .append("text")
        .text("Age groups")          
        .attr("transform", "rotate(-90)translate("+ (-(height/2)+20)+", -10 )")
    d3.select(".ageTitle")
        .style("margin-left",(width/2 - 60) + "px")

    
}

function createMap(agedata, timedata,map){
    
    
    
    var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    })
    layer.addTo(map);
    var markers = L.markerClusterGroup('locations');
    var timedata;
    
    fetch('total.geo.json')
    //fetch('/States')
    .then(function(data){
        return data.json()
    })
    .then(function(json){ 
        for(var i=0; i<json.features.length;i++){
            var thislayer = L.geoJSON(json.features[i]).addTo(map);
            thislayer.eachLayer(function(layer){
                var deathdata = stateDeaths(layer.feature.properties.fips,agedata);                
                layer.on('click',function(e){
                    ageGraph(deathdata.statedata,timedata, map);
                    timeGraph(timedata,deathdata.statedata,map);    
                    document.getElementById('resetAge').onclick = function(){
                        resetAge(timedata,map);
                    }
                    document.getElementById('resetTime').onclick = function(){
                        resetTime(deathdata.statedata,map);
                    }
                              
                })

            })
        }     
        var locations;    
        fetch('loc.json')
        //fetch('/loc')
        .then(function(data){
            return data.json()
        })
        .then(function(json){ 
            locations = json
            latlon(map,markers,locations, agedata,timedata);
        });
  
        
    })

    
    return map
}

function stateDeaths(id,data){
    count = 0
    statedata = []
    
    for(var i=0;i<data.length;i++){
        if(data[i].STATE_x == id){
            count+=1
            statedata.push(data[i])
        }
        
    }    
    
    return {"count":count, "statedata":statedata}
}

function latlon(map,markers, locations, crashdata,timedata){
    markers.clearLayers();
    var markerArray = [];
    var timeData;
    //fetch("/time")
    fetch('time.json')
    .then(function(data){
        return data.json()
    })
    .then(function(timejson){ 
        timeData = timejson
    });
    var newlocations = [];
    for(var i=0;i<locations.length;i++){
        for(var j=0;j<crashdata.length;j++){
            if(locations[i].ST_CASE == crashdata[j].ST_CASE){
                newlocations.push(locations[i]);
            }
        }    
        
    }
    for(var i=0;i<newlocations.length;i++){
        
            var marker = new L.marker([newlocations[i].LATITUDE,newlocations[i].LONGITUD]);
            var caseID = newlocations[i].ST_CASE;
            var crashInfo;
            var attachPopup = function(caseID, e){
                
                    
                for (var i=0;i<crashdata.length;i++){
                    if(crashdata[i].ST_CASE === caseID){
                        crashInfo = crashdata[i];
                    }
                }
                
                
                for (var i=0;i<timeData.length;i++){
                    if(timeData[i].ST_CASE === caseID){
                        var properTime = timeString(timeData[i].HOUR, timeData[i].MINUTE);
                        
                        var popup = L.popup();
                        popup
                        .setLatLng(e.latlng)
                        .setContent(
                            "<dl><dt>CASE:</dt><dd>" + timeData[i].ST_CASE + "</dd>" +
                            "<dt>TIME:</dt><dd>" + properTime +"</dd>" +
                            "<dt>AGE BRACKET:</dt><dd>" + A_AGE3[crashInfo.A_AGE3] + "</dd></dl>"
                        )
                        .openOn(map)                            
                    }
                }
                
            }
            // Curry function with current caseID so only event id is passed in
            
            var boundPopup = attachPopup.bind(null, caseID)
            marker.on('click',boundPopup);       
            
            markerArray.push(marker)
            
        
    }
    markers.addLayers(markerArray);
    map.addLayer(markers)
    
}

function countTimeData(timedata){
    var countTime = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0};
    timedata.map(function(element){
        countTime[element.HOUR] +=1
    });
    
    return countTime
}

function timeGraph(timedata, agedata,map){   

    var countTimes = countTimeData(timedata)
    countTimesMax = 0
    
    Object.keys(countTimes).map(function(element){
        if (countTimes[element] > countTimesMax){
            countTimesMax = countTimes[element]
        }
    })

    var keys = Object.keys(countTimes);
    var values = keys.map(function(v){ return countTimes[v];});
    var height = 300;
    var width = 450;
    var x = d3.scaleLinear()
    .domain([0, countTimesMax])
    .range([0,width-100]) 
    var y = d3.scaleLinear()
    .domain([0, height-40])
    .range([0,height-40])   
    var xAxis = d3.axisBottom(x);   
    var yAxis = d3.axisLeft(y).tickFormat(""); 
    var barHeight = (height-40)/24;
    d3.select(".timeData").selectAll("svg > *").remove();
    var timeData = d3.select(".timeData");
    timeData.attr("width", width).attr("height",height);
    var bar = timeData.selectAll("g")
        .data(values)
    .enter().append("g")
        .attr("transform", function(d, i) { if (i<24){return "translate(20," + i * barHeight + ")"; }});    
    bar.append("rect")
        .style("width", function(d,i) { if (i<24){return x(d) + "px";}})
        .style("height", barHeight +"px")      
        .attr("stroke", "black")  
        .attr("fill","steelblue")
        .attr("height", barHeight +"px")
        .attr("width", function(d,i) { if (i<24){return x(d) + "px";}})        
        .on("click", function(d,i) {     
                
                if(map._containerId){
                    map.remove();
                    map = L.map('statMap').setView([37.0902,-95.7129],4)
                }          
              var newtimedata = [];
              for(var j=0;j<timedata.length;j++){
                  if(timedata[j].HOUR == i){
                      newtimedata.push(timedata[j]);
                  }
              }    
              var newagedata = [];      
              for(var a=0;a<newtimedata.length;a++){
                  for(var b=0;b<agedata.length;b++){
                      if(newtimedata[a].ST_CASE == agedata[b].ST_CASE){
                          newagedata.push(agedata[b]);
                      }
                  }
              }
              timeGraph(newtimedata,newagedata,map);
              ageGraph(newagedata,newtimedata,map);
              createMap(newagedata,newtimedata,map);
              document.getElementById('resetAge').onclick = function(){
                  resetAge(newtimedata,map);
              }
              document.getElementById('resetTime').onclick = function(){
                  resetTime(newagedata,map);
              }
              
          });
    bar.append("text")
        .attr("x", function(d,i) { if (i<24){return x(d) + 60;}})
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d,i){ 
            if (i<24){
                if(i < 10){
                    if(i+1 < 10){
                        return ("0"+i+"00-0"+(i+1)+"00")
                    }else{
                        return (i+"000-"+(i+1)+"00")
                    }
                }else{
                    return (i+"00-"+(i+1)+"00")
                }
            }
        })
    d3.select(".timeData").append("g")
        .attr("transform", "translate(20,"+(height-40)+")")
        .attr("class", "xAxis")
        .call(xAxis)
    .append("text")
        .text("Number of Injuries")
        .attr("transform", "translate("+width/2+",30)")
    d3.select(".timeData").append("g")
        .attr("transform", "translate(20,0)")
        .attr("class", "yAxis")
        .call(yAxis)                
    .append("text")
        .text("Hour")          
        .attr("transform", "rotate(-90)translate("+ (-(height/2)+20)+", -10 )")
    d3.select(".timeTitle")
        .style("margin-left",(width/2 - 100) + "px")
    
}

function timeString(hour, minute){
    var properTime;
    if(hour<10){
        if(minute < 10){
            properTime = "0"+hour +":0" + minute
        }else if(minute >= 10){
            properTime = "0"+hour+":"+minute
        }
    }else if(hour>=10){
        if(minute < 10){
            properTime = hour +":0" + minute
        }else if(minute >= 10){
            properTime = hour+":"+minute
        }
    }

    return properTime;
}

function resetTime(agedata,map){
    timedata = globalTimeData;
    timeGraph(timedata,agedata,map);    
    ageGraph(agedata,timedata, map);
    createMap(agedata,timedata,map); 
    
}

function resetAge(timedata,map){
    agedata = globalAgeData;
    timeGraph(timedata,agedata,map);        
    ageGraph(agedata,timedata, map);
    createMap(agedata,timedata,map); 
    
}