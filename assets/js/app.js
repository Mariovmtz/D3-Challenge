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
const X_VARS = []
const Y_VARS = []
/*---------------------------------
    END OF CONSTANTS DECLARATION
---------------------------------*/
/*------------------------------
 FUNCTIONS
-----------------------------*/
function getlinearScale(data, attribute, height, width){
    return d3.scaleLinear()
    .domain([d3.min(data, d => d[attribute]) - 1, d3.max(data, d => d[attribute])])
    .range([height,width])
};

function convAttrNum(data){
    data.forEach(element => {
            Object.entries(element).forEach(([key, value]) => {
                if (!isNaN(value))
                element[key] = +value;})
        })
};

function createLabels(element){

    let labels = chartGroup.append("g").attr("transform", `translate(${WIDTH / 2}, ${HEIGHT})`);

    Object.entries(element).forEach(([key, value]) => {
        labels.append("text")
        .attr("x", 0)
        .attr("y",40)
        .attr("value", key)
        .text(value)
        .classed("active", true)
    })

/*
    const povertyLabel = labels.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "poverty") // value to grab for event listener
    .text("In Poverty (%)")
    .classed("active", true);

    const ageLabel = labels.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "age") // value to grab for event listener
    .text("Age (Median)")
    .classed("inactive", true);

    const incomeLabel = labels.append("text")
    .attr("x", 0)
    .attr("y", 80)
    .attr("value", "income") // value to grab for event listener
    .text("Household Income (Median)")
    .classed("inactive", true);
*/
    return labels
}

/*------------------------------
FUNCTIONS
-----------------------------*/

d3.csv("assets/data/data.csv").then(function(srcData) {

    // Assign starting variables
    let xSelected = "poverty";
    let ySelected = "healthcare";

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

    let xlabels = createLabels()

    let ylabels = chartGroup.append("g");

    const healthcareLabel = ylabels.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(HEIGHT / 2))
    .attr("y", -30)
    .attr("value", "healthcare") // value to grab for event listener
    .text("Lacks Healthcare (%)")
    .classed("active", true);

    const smokesLabel = ylabels.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(HEIGHT / 2))
    .attr("y", -50)
    .attr("value", "smokes") // value to grab for event listener
    .text("Smokes (%)")
    .classed("inactive", true);

    const obeseLabel = ylabels.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(HEIGHT / 2))
    .attr("y", -70)
    .attr("value", "obesity") // value to grab for event listener
    .text("Obese (%)")
    .classed("inactive", true);



  function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis) {

    let xpercentsign = "";
    let xlabel = "";
    if (chosenXAxis === "poverty") {
      xlabel = "Poverty";
      xpercentsign = "%";
    } else if (chosenXAxis === "age"){
      xlabel = "Age";
    } else {
      xlabel = "Income";
    }
  
    let ypercentsign = "";
    let ylabel = "";
    if (chosenYAxis === "healthcare") {
      ylabel = "Healthcare";
      ypercentsign = "%";
    } else if (chosenYAxis === "smokes"){
      ylabel = "Smokes";
      ypercentsign = "%";
    } else {
      ylabel = "Obesity";
      ypercentsign = "%";
    }
  
    const toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([50, -75])
      .html(function(d) {
        if (chosenXAxis === "income"){
          let incomelevel = formatter.format(d[chosenXAxis]);
  
          return (`${d.state}<br>${xlabel}: ${incomelevel.substring(0, incomelevel.length-3)}${xpercentsign}<br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`)
        } else {
          return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}${xpercentsign}<br>${ylabel}: ${d[chosenYAxis]}${ypercentsign}`)
        };
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

  circlesGroup = updateToolTip(gCirclesGroup, "poverty", "healthcare");


// function used for updating xAxis const upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
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


   // x axis labels event listener
   xlabels.selectAll("text").on("click", function() {
   // get value of selection
   
    let value = d3.select(this).attr("value");
        if (value !== xSelected) {

     // replaces chosenXAxis with value
        xSelected = value;
        ySelected = "healthcare"
     // updates x scale for new data
        xLinearScale = getlinearScale(srcData, xSelected, 0, WIDTH)
        yLinearScale = getlinearScale(srcData, xSelected, HEIGHT, 0)
     // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

     // updates circles with new x values
        circles = renderXCircles(gCirclesGroup, xLinearScale, xSelected, yLinearScale, ySelected);

/*
     // updates circles text with new x values
        circlesText = renderXText(circlesText, xLinearScale, xSelected);
*/

     // updates tooltips with new info
        circlesGroup = updateToolTip(circlesGroup, xSelected, ySelected);

     // changes classes to change bold text
     if (xSelected === "age") {
       povertyLabel
         .classed("active", false)
         .classed("inactive", true);
       ageLabel
         .classed("active", true)
         .classed("inactive", false);
       incomeLabel
         .classed("active", false)
         .classed("inactive", true);
     }
     else if (xSelected === "income") {
       povertyLabel
         .classed("active", false)
         .classed("inactive", true);
       ageLabel
         .classed("active", false)
         .classed("inactive", true);
       incomeLabel
         .classed("active", true)
         .classed("inactive", false);
     }
     else {
       povertyLabel
         .classed("active", true)
         .classed("inactive", false);
       ageLabel
         .classed("active", false)
         .classed("inactive", true);
       incomeLabel
         .classed("active", false)
         .classed("inactive", true);
     }
   }
 });

 

});


