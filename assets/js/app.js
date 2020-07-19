// @TODO: YOUR CODE HERE!
/*------------------------------
 GLOBAL CONSTANTS
 ----------------------------*/
const SVG_WIDTH = 960;
const SVG_HEIGHT = 600; 
const MARGIN = {top:20,right:20,bottom:95,left:95};
const WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const chartGroup = d3.select("#scatter").append("svg").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT).append("g").attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

const VARS = [{id:"poverty",text:"In Poverty (%)",isActive:"active", axis:"x"},
                {id:"age",text:"Age (Median)",isActive:"inactive", axis:"x"},
                {id:"income",text:"Household Income (Median)",isActive:"inactive", axis:"x"},
                {id:"healthcare",text:"Lacks Healthcare (%)",isActive:"active", axis:"y"},
                {id:"smokes",text:"Smokes (%)",isActive:"inactive", axis:"y"},
                {id:"obesity",text:" Obesse (%)",isActive:"inactive", axis:"y"}]

/*---------------------------------
    END OF CONSTANTS DECLARATION
---------------------------------*/
/*------------------------------
 FUNCTIONS
-----------------------------*/
function getlinearScale(data, attribute, height, width){
    minval = d3.min(data, d => d[attribute]) * 0.80;
    maxval = d3.max(data, d => d[attribute]) * 1.05;
    
    return d3.scaleLinear()
    .domain([minval, maxval])
    .range([height,width])
};

function convAttrNum(data){
    data.forEach(element => {
            Object.entries(element).forEach(([key, value]) => {
                if (!isNaN(value))
                element[key] = +value;})
        })
};

function createLabels(dir, xPos, yPos, iPos, padding, degrees){

    let label = chartGroup.append("g").attr("transform", `translate(${xPos}, ${yPos})`);
    let vars = VARS.filter(el => el.axis === dir )
    vars.forEach(element => {
        label.append("text")
        .attr("transform", `rotate(${degrees})`)
        .attr("x", 0)
        .attr("y", iPos)
        .attr("value", element.id)
        .text(element.text)
        .classed(element.isActive, true);
        iPos = iPos + padding 
    })
    return label
}



/*------------------------------
PROMISE AWAITING
-----------------------------*/
d3.csv("assets/data/data.csv").then(function(srcData) {

    // Assign starting variables
    let xSelected = 'poverty';
    let ySelected = 'healthcare';

    // convert attribtues to numeric
    convAttrNum(srcData)

    // Create linear and axis functions
    let xLinearScale = getlinearScale(srcData, xSelected, 0, WIDTH)
    let yLinearScale = getlinearScale(srcData, ySelected, HEIGHT, 0)
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append axis functions to the char
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(bottomAxis);
    let yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Step 5. Create Circles

    let gCirclesGroup = chartGroup.selectAll("g circle")
        .data(srcData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xLinearScale(d[xSelected])}, ${yLinearScale(d[ySelected])})`);
  
    let circles = gCirclesGroup.append("circle")
        .attr("r", 18)
        .classed("stateCircle", true);

    let circlesText = gCirclesGroup.append("text")
        .text(d => d.abbr)
        .attr("y","5")
        .classed("stateText", true);

    let xlabel = createLabels("x", WIDTH / 2, HEIGHT, 40, 20, 0)
    let ylabel = createLabels("y", 0, HEIGHT / 2, -30, -20, -90)


  function updateToolTip(circlesGroup, xSelected, xText, xSign, ySelected, yText, ySign) {
      
    let toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, -75])
      .html(function(d) {
          return (`${d.state}<br>${xText}: ${d[xSelected]}${xSign}<br>${yText}: ${d[ySelected]}${ySign}`)
      });
  
    circlesGroup.call(toolTip);
  
    // mouseover event
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })

      .on("mouseout", function(data) {
          toolTip.hide(data, this);
      });
  
  return circlesGroup;
  }

  circlesGroup = updateToolTip(gCirclesGroup, "poverty","In Poverty", "%", "healthcare", "Lacks healthcare", "%");


// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(800)
      .call(bottomAxis);
  
    return xAxis;
  }


// functions used for updating circles group with a transition to
// new circles for both X and Y coordinates
function renderXCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYScale) {

  circlesGroup.transition()
    .duration(1000)
    .attr("transform", d => `translate(${newXScale(d[chosenXaxis])}, ${newYScale(d[chosenYScale])})`);

  return circlesGroup;
}

// Event Handler for g element on x-axis
xlabel.selectAll("text").on("click", function() {

    let label = d3.select(this)
    let value = label.attr("value");

        if (value != xSelected) {
            xlabel.selectAll("text")
                .classed("active", false)
                .classed("inactive", true);
            label.classed("active", true)
                .classed("inactive", false);

            xSelected = value;
            xLinearScale = getlinearScale(srcData, xSelected, 0, WIDTH)
            xAxis = renderXAxes(xLinearScale, xAxis);
            gCirclesGroup = renderXCircles(gCirclesGroup, xLinearScale, xSelected, yLinearScale, ySelected);
            circlesGroup = updateToolTip(gCirclesGroup, "poverty","In Poverty", "%", "healthcare", "Lacks healthcare", "%");
    }


 });

 

});


