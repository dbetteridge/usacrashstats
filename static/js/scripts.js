//fetch('age.json')
fetch('/age')
.then(function(data){
    return data.json()
})
.then(function(json){
    displayData(json)
})

function displayData(data){
    ageGraph(data);
    createMap(data);    
}

function countData(data){
    var countAges = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0};
    console.log(data[data.length - 1]);
    data.map(function(element){
        
        countAges[element.A_AGE3] +=1
    });
    
    return countAges
}

function ageGraph(data){
    var countAges = countData(data)
    countAgesMax = 0
    Object.keys(countAges).map(function(element){
        if (countAges[element] > countAgesMax){
            countAgesMax = countAges[element]
        }
    })
    
    A_AGE3 = {1:"0-3",2:"4-7",3:"8-12",4:"13-15",5:"16-20",6:"21-24",7:"25-34",8:"35-44",9:"45-54",10:"55-64",11:"65-74",12:"75+",13:"NA"}
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
        .style("margin-left",(width/2 - 20) + "px")

}

function createMap(crashdata){
    var map = L.map('statMap').setView([37.0902,-95.7129],4)

    var layer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    })
    layer.addTo(map);
    var markers = L.markerClusterGroup('locations');
    var timedata;
    fetch('/time')
    //fetch('time.json')
    .then(function(data){
        return data.json()
    })
    .then(function(json){ 
        timeGraph(json);
        timedata = json;
    });
    //fetch('total.geo.json')
    fetch('/States')
    .then(function(data){
        return data.json()
    })
    .then(function(json){ 
        for(var i=0; i<json.features.length;i++){
            var thislayer = L.geoJSON(json.features[i]).addTo(map);
            thislayer.eachLayer(function(layer){
                var deathdata = stateDeaths(layer.feature.properties.fips,crashdata);                
                layer.on('click',function(e){
                    ageGraph(deathdata.statedata)
                    timeGraph(stateDeaths(layer.feature.properties.fips, timedata).statedata);
                    latlon(map,markers,layer.feature.properties.fips, locations)
                })

            })
        }       
    })

    var locations;    
    //fetch('loc.json')
    fetch('/loc')
    .then(function(data){
        return data.json()
    })
    .then(function(json){ 
        locations = json
    });

   
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

function latlon(map,markers, stateid,json){
    markers.clearLayers();
    var markerArray = [];
    
    for(var i=0;i<json.length;i++){
        if(json[i].STATE_x == stateid){
            marker = new L.marker([json[i].LATITUDE,json[i].LONGITUD])
            markerArray.push(marker)
        }
    }
    markers.addLayers(markerArray);
    map.addLayer(markers)
    
}

function countTimeData(data){
    var countTime = {0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0,18:0,19:0,20:0,21:0,22:0,23:0};
    data.map(function(element){
        countTime[element.HOUR] +=1
    });
    
    return countTime
}

function timeGraph(data){   

    var countTimes = countTimeData(data)
    countTimesMax = 0
    
    Object.keys(countTimes).map(function(element){
        if (countTimes[element] > countTimesMax){
            countTimesMax = countTimes[element]
        }
    })

    var keys = Object.keys(countTimes);
    var values = keys.map(function(v){ return countTimes[v];});
    var height = 520;
    var width = 450;
    var x = d3.scaleLinear()
    .domain([0, countTimesMax])
    .range([0,width-100]) 
    var y = d3.scaleLinear()
    .domain([0, height-40])
    .range([0,height-40])   
    var xAxis = d3.axisBottom(x);   
    var yAxis = d3.axisLeft(y).tickFormat(""); 
    var barHeight = 20;
    d3.select(".timeData").selectAll("svg > *").remove();
    var ageData = d3.select(".timeData");
    ageData.attr("width", width).attr("height",height);
    var bar = ageData.selectAll("g")
        .data(values)
    .enter().append("g")
        .attr("transform", function(d, i) { if (i<24){return "translate(20," + i * barHeight + ")"; }});    
    bar.append("rect")
        .style("width", function(d,i) { if (i<24){return x(d) + "px";}})
        .style("height", barHeight +"px")      
        .attr("stroke", "black")  
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
        .style("margin-left",(width/2 - 20) + "px")

}