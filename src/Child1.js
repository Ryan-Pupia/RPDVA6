import React, { Component } from "react";
import * as d3 from "d3";
import './Child1.css'

class Child1 extends Component {
  constructor(props){
    super(props)
    this.state = {
      model: "GPT-4"
    }
  }

  componentDidMount() {
    //console.log(this.props.csv_data) // Use this data as default. When the user will upload data this props will provide you the updated data
    this.render_chart()
  }

  componentDidUpdate() {
    //console.log(this.props.csv_data)
    console.log(this.state.model)
    this.render_chart()
  }

  render_chart() {
    // Setting up margins and container
    const data = this.props.csv_data
    console.log(data)
    //console.log(data)
    if(data.length === 0) return
    const margin = {left: 80, top: 0, right: 200, bottom: 200}
    const h = 500
    const w = 500
    const svg = d3.select(".child1").selectAll("svg").data([data]).join("svg")
      .attr('width', margin.left + w + margin.right)
      .attr('height', margin.top + h + margin.bottom)
    
    const container = svg.selectAll('.container')
      .data([0])
      .join('g')
      .attr('class', 'container')
      .attr('height', h)
      .attr('width', w)
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
    
    // Generate Scales
    //console.log(data)
    const maxSum = d3.max(
      data.map(d => d["GPT-4"] + d["Gemini"] + d["PaLM-2"] + d["Claude"] + d["LLaMA-3.1"])
    )
    //console.log(maxSum)
    const xScale = d3.scaleTime().domain(d3.extent(data, d=> d.Date)).range([0, w])
    const yScale = d3.scaleLinear().domain([0, maxSum]).range([h, 0])

    // Add Axis
    // Add the X axis
    d3.selectAll("svg").selectAll(".x-axis").data([null]).join("g").attr("class", "x-axis").attr("transform", `translate(${margin.left},${margin.top + h + margin.bottom/2})`)
      .call(d3.axisBottom(xScale).tickFormat((date) => date.toLocaleString('default', {month:'short', timeZone: 'UTC'})))

    // Create Color Scale
    const colorScale = d3.scaleOrdinal().domain(["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"]).range([ "#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]);

    // Generate stacked areas
    var stackGenerator = d3.stack().keys(["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"]).offset(d3.stackOffsetWiggle); // Pass in list of keys (attribute that contains the value we want)
    
    // Generate Path series
    var stackedSeries = stackGenerator(data) //This makes a series of area data for each area.

    // Create Area Generator
    var areaGen = d3.area()
            .x(d => xScale(d.data.Date))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveCardinal)
    // This guy will use the area series to make the paths

    // Create the legend
    const models = ["GPT-4", "Gemini", "PaLM-2", "Claude", "LLaMA-3.1"]
    const legend = svg.selectAll(".legend")
      .data([0])
      .join('g')
      .attr('class', 'legend')
      .attr('height', h/4)
      .attr('width', w/6)
      .attr('transform', `translate(${margin.left + w + margin.right/2}, ${margin.top + h/2})`)
    
    legend.selectAll('.legend-square').data(models).join('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * ((h/4)/models.length + 20))
      .attr('height', 20)
      .attr('width', 20)
      .attr('stroke', 'none')
      .attr('fill', d => colorScale(d))
    
    legend.selectAll('.legend-label').data(models).join('text')
      .attr('class', 'legend-label')
      .attr('text-anchor', 'start')
      .attr('x', 25)
      .attr('dominant-baseline', 'top')
      .attr('y', (d, i) => i * ((h/4)/models.length + 20) + 15)
      .text(d => d)
    
    
    // Add in tooltip div
    var tooltip = d3.select("body").selectAll(".tooltip").data([0]).join('div').attr('class', "tooltip").style("opacity", [0])
    // Plot the Areas
    container.selectAll(".areas")
      .data(stackedSeries)
      .join('path')
      .attr('class', 'areas')
      .attr('d', d => areaGen(d))
      .attr('stroke', d => colorScale(d.key))
      .attr('fill', d => colorScale(d.key))
      .on("mousemove", (event, d) => {
          const smallWidth = 275
          const smallHeight = 150
          const smallMargin = {left: 35, top: 20, right: 20, bottom: 30}
          const model = d.key
          tooltip.style("opacity", 1)
            .style("left", (event.pageX) - smallWidth/2 + "px")
            .style("top", (event.pageY) + "px")
            .style("height", smallHeight + smallMargin.top + smallMargin.bottom + "px")
            .style("width", smallMargin.left + smallWidth + smallMargin.right + "px")
          var toolsvg = tooltip.selectAll("svg").data([0]).join('svg')
            .attr("height", smallMargin.top + smallHeight + smallMargin.bottom)
            .attr("width", smallMargin.left + smallWidth + smallMargin.right)
          var toolContainer = toolsvg.selectAll(".small_container").data([0]).join('g').attr('class', 'small_container')
            .attr('height', smallHeight)
            .attr('width', smallWidth)
            .attr('transform', `translate(${smallMargin.left}, ${smallMargin.top})`)
          // Create Scales
          //console.log(data)
          //console.log(data.map(d => d.Date))
          var smallX = d3.scaleBand().domain(data.map(d => d.Date)).range([0, smallWidth]).padding(0.2)
          var smallY = d3.scaleLinear().domain([0, d3.max(data, function(d) {return d[model]})]).range([smallHeight, 0])

          // Add the rectangles
          toolContainer.selectAll('rect').data(data).join('rect')
            .attr('x', d => smallX(d.Date))
            .attr('y', function(d) {return smallY(d[model])})
            .attr('height', function(d) {return smallHeight - smallY(d[model])})
            .attr('width', smallX.bandwidth())
            .attr('fill', colorScale(model))
          
          // Add the axes
          toolsvg.selectAll(".smallx-axis").data([0]).join('g').attr('class', 'smallx-axis')
            .attr("transform", `translate(${smallMargin.left},${smallMargin.top + smallHeight})`)
            .call(d3.axisBottom(smallX).tickFormat((date) => date.toLocaleString('default', {month:'short', timeZone: 'UTC'})))

          toolsvg.selectAll(".smally-axis").data([0]).join('g').attr('class', 'smally-axis')
            .call(d3.axisLeft(smallY))
            .attr("transform", `translate(${smallMargin.left}, ${smallMargin.top})`)
        })
        .on('mouseout', () => {
          tooltip.style('opacity', 0)})
  }

  render() {

    return (
      <div className="child1">
      </div>
    );
  }
}

export default Child1;
