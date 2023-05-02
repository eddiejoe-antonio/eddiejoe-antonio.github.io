console.log('yep, working!');

d3.json('./data/identity/index.json')
    .then(function(dataset)
    {
        //Width and height of svg
        var padding = (window.innerWidth / 20);
        var w = window.innerWidth;
        var h = window.innerHeight;
        var r = h / 10;
        console.log(padding);

        // Global variables for scoping
        let xVal = 0
        let yVal = 0
        
        
        //Create scale functions
        xScale = d3.scaleLinear()
                    .domain([
                        d3.min(dataset, function(d) { return d.id; }), 
                        d3.max(dataset, function(d) { return d.id; })
                    ])
                    .range([0, w]);

        yScale = d3.scaleLinear()
                    .domain([
                        d3.min(dataset, function(d) { return d.value; }), 
                        d3.max(dataset, function(d) { return d.value; })
                    ])
                    .range([h, 0]);

        //Define X axis
        xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(2)

        //Define Y axis
        yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(6);

        //Create SVG element
        var svg = d3.select("#scatter__intro")
                    .append("svg")
                    .attr("class", "scatter__intro")
                    .attr("width", w)
                    .attr("height", h)
                    .append("g");

        // Rectangles!
        svg.append('g')
            .selectAll("circle")
            .data(dataset)
            .enter()
            .append("circle")
                .attr("cx", function(d)
                {
                    return xScale(d.id) * Math.random()
                })
                .attr("cy", function(d)
                {
                    return yScale(d.value) * Math.random();
                })
                .attr("r", r)
                // .attr("height", r)
                .attr("id", "scatter__squares")
                .text(function(d){
                    return d.name;
                })
                .style("fill", "greenyellow")
                .style("opacity", .5);

            // Create animation, moving across time in the X dimension
            svg.selectAll("circle")
                    .transition()
                    .delay(function(d, i){
                        return (i*3);
                    })
                    .duration(3000)
                    .attr("cx", function(d)
                    {
                        return xScale(d.id) * Math.random()
                    })
                    .attr("cy", function(d)
                    {
                        return yScale(d.value) * Math.random();
                    })
                    .style("opacity", .5);

            // svg.selectAll("text")
            //         .data(dataset)
            //         .enter()
            //         .append("text")
            //         .transition()
            //         .delay(function(d, i){
            //             return (i*3);
            //         })
            //         .duration(3000)
            //         .text(function(d){
            //             return d.name;
            //         })
            //         .attr("xlink:href", function(d){
            //             return 'https://eddiejoeantonio.com/pages/' + d.category + d.name + '.html'
            //             console.log('https://eddiejoeantonio.com/pages/' + d.category + d.name + '.html');;
            //         })
            //         .attr("x", function(d){
            //             return xScale(d.id) - (r * 0.375);
            //         })
            //         .attr("y", function(d){
            //             return yScale(d.value) + (r * 0.375);
            //         })
            //         .style("fill", "white");
    })