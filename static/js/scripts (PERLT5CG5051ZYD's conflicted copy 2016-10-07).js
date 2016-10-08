fetch('/data')
.then(function(data){
    return data.json()
})
.then(function(json){
    displayData(json)
})

function displayData(data){
    ageGraph(data);
    
    
    
}

function countData(data){
    var countAges = {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0};
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
    var width = 420;
    var x = d3.scaleLinear()
    .domain([0, countAgesMax])
    .range([0,width-20]) 
    var y = d3.scaleLinear()
    .domain([0, height-40])
    .range([0,height-40])   
    var xAxis = d3.axisBottom(x);   
    var yAxis = d3.axisLeft(y).tickFormat(""); 
    var barHeight = 20;
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
        .attr("x", function(d) { return x(d) - 10; })
        .attr("y", barHeight / 2)
        .attr("dy", ".35em")
        .text(function(d,i){ return A_AGE3[i+1]})
    d3.select("svg").append("g")
        .attr("transform", "translate(20,"+(height-40)+")")
        .attr("class", "xAxis")
        .call(xAxis)
    .append("text")
        .text("Number of Fatalities")
        .attr("transform", "translate("+width/2+",30)")
    d3.select("svg").append("g")
        .attr("transform", "translate(20,0)")
        .attr("class", "yAxis")
        .call(yAxis)                
    .append("text")
        .text("Age groups")          
        .attr("transform", "rotate(-90)translate("+ (-(height/2)+20)+", -10 )")
    d3.select(".ageTitle")
        .style("margin-left",(width/2 - 20) + "px")

}