// @TODO: YOUR CODE HERE!
const SVG_WIDTH = 960;
const SVG_HEIGHT = 500; 
const MARGIN = {
    top:20,
    right:20,
    bottom:60,
    left:20
};
const WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

const svg = d3.select("#scatter")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT)
  //  .style("border", "1px solid black");

const chartGroup = svg.append("g").attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);



d3.csv("assets/data/data.csv").then(function(srcData) {
    
    // Step 1. Convert data to numeric
    srcData.forEach(data => {
        data.poverty = +data.poverty;
        data.age = +data.age;
    });

    // Step 2. Create scale functions
    let xLinearScale = d3.scaleLinear()
        .domain([d3.min(srcData, d => d.age) + 1, d3.max(srcData, d => d.age)])
        .range([0,WIDTH])
    let yLinearScale = d3.scaleLinear()
        .domain([d3.min(srcData, d => d.poverty) - 1, d3.max(srcData, d => d.poverty)])
        .range([HEIGHT,0])

    // Step 3. Create axis functions
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Step 4. Append Axes to the chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(bottomAxis);

    chartGroup.append("g")
        .call(leftAxis);

    // Step 5. Create Circles

let gCirclesGroup = chartGroup.selectAll("g circle")
    .data(srcData)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${xLinearScale(d.age)}, ${yLinearScale(d.poverty)})`);
  
let circles = gCirclesGroup.append("circle")
    .attr("r", 18)
    .classed("stateCircle", true)
    ;

let circlesText = gCirclesGroup.append("text")
    .text(d => d.abbr)
    .attr("y","5")
    .classed("stateText", true);



});


