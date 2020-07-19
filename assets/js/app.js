// @TODO: YOUR CODE HERE!
/*------------------------------
 GLOBAL CONSTANTS
 ----------------------------*/
const SVG_WIDTH = 960;
const SVG_HEIGHT = 600; 
const MARGIN = {top:20,right:20,bottom:95,left:82};
const WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
const HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;
const chartGroup = d3.select("#scatter").append("svg").attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT).append("g").attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

const VARS = [{id:"poverty",text:"In Poverty",isActive:"inactive", axis:"x", units:"%"},
                {id:"age",text:"Age",isActive:"inactive", axis:"x", units:"Median"},
                {id:"income",text:"Household Income",isActive:"inactive", axis:"x", units:"$"},
                {id:"healthcare",text:"Lacks Healthcare",isActive:"inactive", axis:"y", units:"%"},
                {id:"smokes",text:"Smokes",isActive:"inactive", axis:"y", units:"%"},
                {id:"obesity",text:" Obesse",isActive:"inactive", axis:"y", units:"%"}]

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

function createLabels(axis, xPos, yPos, iPos, padding, degrees){

    let label = chartGroup.append("g").attr("transform", `translate(${xPos}, ${yPos})`);
    let selection = VARS.filter(el => el.axis === axis)
    selection.forEach(element => {
        label.append("text")
        .attr("transform", `rotate(${degrees})`)
        .attr("x", 0)
        .attr("y", iPos)
        .attr("value", element.id)
        .text(`${element.text} (${element.units})`)
        .classed(element.isActive, true);
        iPos = iPos + padding 
    })
    return label
}

function getRandomElement(axis){
    let vars = VARS.filter(el => el.axis === axis)
    let selection = vars[Math.floor(Math.random()*vars.length)];
    selection.isActive = "active"
    return selection;
}

function updateToolTip(circlesGroup, xSelectedId, xText, xSign, ySelectedId, yText, ySign) {
    let toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, -75])
      .html(function(d) {
        
          return (`${d.state}<br>${xText}: ${d[xSelectedId]}${xSign}<br>${yText}: ${d[ySelectedId]}${ySign}`)
     
        });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data, this);
    })

      .on("mouseout", function(data) {
          toolTip.hide(data, this);
      });
  
  return circlesGroup;
  }

/*------------------------------
PROMISE AWAITING
-----------------------------*/
d3.csv("assets/data/data.csv").then(function(srcData) {

    // Assign starting variables
    
    let xSelected = getRandomElement("x")
    let ySelected = getRandomElement("y")

    // convert attrs to numeric
    convAttrNum(srcData)

    // Create linear and axis functions
    let xLinearScale = getlinearScale(srcData, xSelected.id, 0, WIDTH)
    let yLinearScale = getlinearScale(srcData, ySelected.id, HEIGHT, 0)
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    // Append axis functions to the char
    let xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(bottomAxis);
    let yAxis = chartGroup.append("g")
        .call(leftAxis);

    // Initialize circles and texts

    let gCirclesGroup = chartGroup.selectAll("g circle")
        .data(srcData)
        .enter()
        .append("g")
        .attr("transform", d => `translate(${xLinearScale(d[xSelected.id])}, ${yLinearScale(d[ySelected.id])})`);
  
    gCirclesGroup.append("circle")
        .attr("r", 18)
        .classed("stateCircle", true);

    gCirclesGroup.append("text")
        .text(d => d.abbr)
        .attr("y","5")
        .classed("stateText", true);

    let xlabel = createLabels("x", WIDTH / 2, HEIGHT, 40, 20, 0)
    let ylabel = createLabels("y", 0, HEIGHT / 2, -30, -20, -90)

    // initialize tooltip
    circlesGroup = updateToolTip(gCirclesGroup, xSelected.id,xSelected.text, xSelected.units, ySelected.id, ySelected.text, ySelected.units);



// functions used for updating circles group with a transition to
// new circles for both X and Y coordinates
function renderXCircles(circlesGroup, newXScale, chosenXaxis, newYScale, chosenYScale) {

  circlesGroup.transition()
    .duration(1500)
    .attr("transform", d => `translate(${newXScale(d[chosenXaxis])}, ${newYScale(d[chosenYScale])})`);

  return circlesGroup;
}

// Event Handler for g element on x-axis
xlabel.selectAll("text").on("click", function() {

    let label = d3.select(this)
    let value = label.attr("value");

        if (value != xSelected.id) {
            xlabel.selectAll("text")
                .classed("active", false)
                .classed("inactive", true);
            label.classed("active", true)
                .classed("inactive", false);

            xSelected = VARS.find(el => el.id === value);
            xLinearScale = getlinearScale(srcData, xSelected.id, 0, WIDTH)
            
            bottomAxis = d3.axisBottom(xLinearScale);
            xAxis.transition().duration(1500).call(bottomAxis);

            gCirclesGroup = renderXCircles(gCirclesGroup, xLinearScale, xSelected.id, yLinearScale, ySelected.id);            
            circlesGroup = updateToolTip(gCirclesGroup, xSelected.id,xSelected.text, xSelected.units, ySelected.id, ySelected.text, ySelected.units);
    }


 });
// Event Handler for g element on y-axis
 ylabel.selectAll("text").on("click", function() {

    let label = d3.select(this)
    let value = label.attr("value");

        if (value != ySelected.id) {
            ylabel.selectAll("text")
                .classed("active", false)
                .classed("inactive", true);
            label.classed("active", true)
                .classed("inactive", false);

            ySelected = VARS.find(el => el.id === value);
            yLinearScale = getlinearScale(srcData, ySelected.id, HEIGHT, 0)
           
            leftAxis = d3.axisLeft(yLinearScale);
            yAxis.transition().duration(1500).call(leftAxis);

            gCirclesGroup = renderXCircles(gCirclesGroup, xLinearScale, xSelected.id, yLinearScale, ySelected.id);
            circlesGroup = updateToolTip(gCirclesGroup, xSelected.id,xSelected.text, xSelected.units, ySelected.id, ySelected.text, ySelected.units);
    }


 });

});


