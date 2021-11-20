const dims = { height: 300, width: 300, radius: 150 };
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 };

const svg = d3
    .select(".canvas")
    .append("svg")
    .attr("width", dims.width + 150)
    .attr("height", dims.height + 150);

const graph = svg
    .append("g")
    .attr("transform", `translate(${cent.x},${cent.y})`);

const pie = d3
    .pie()
    .sort(null)
    .value((d) => d.cost);

const arcPath = d3
    .arc()
    .outerRadius(dims.radius)
    .innerRadius(dims.radius / 2);

const color = d3.scaleOrdinal(d3["schemeSet2"]);

// update data
const update = (data) => {
    // update color scale domain
    color.domain(data.map((d) => d.name));

    // join enhenced (pie) data to path elements
    const paths = graph.selectAll("path").data(pie(data));

    // exit selection
    paths
        .exit()
        .transition()
        .duration(750)
        .attrTween("d", arcTweenExit)
        .remove();

    // exit current DOM path update

    paths.attr("d", arcPath);

    // enter path
    paths
        .enter()
        .append("path")
        .attr("class", "arc")
        .attr("d", arcPath)
        .attr("stroke", "#fff")
        .attr("stroke-width", 3)
        .attr("fill", (d) => color(d.data.name))
        .transition()
        .duration(750)
        .attrTween("d", arcTweenEnter);
};

// take current data from db, data firestore
var data = [];

db.collection("expenses").onSnapshot((res) => {
    res.docChanges().forEach((change) => {
        const doc = { ...change.doc.data(), id: change.doc.id };
        switch (change.type) {
            case "added":
                data.push(doc);
                break;
            case "modified":
                const index = data.findIndex((item) => item.id === doc.id);
                data[index] = doc;
                break;
            case "removed":
                data = data.filter((item) => item.id !== doc.id);
                break;
            default:
                break;
        }
    });
    update(data);
});

const arcTweenEnter = (d) => {
    var i = d3.interpolate(d.endAngle, d.startAngle);

    return function (t) {
        // update the angle
        d.startAngle = i(t);
        // draw the path
        return arcPath(d);
    };
};

// to exit
const arcTweenExit = (d) => {
    var i = d3.interpolate(d.startAngle, d.endAngle);

    return function (t) {
        // update the angle
        d.startAngle = i(t);
        // draw the path
        return arcPath(d);
    };
};
