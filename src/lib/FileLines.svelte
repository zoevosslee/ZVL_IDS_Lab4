<script>
  import * as d3 from "d3";
  export let lines = [];
  export let width = 800;
  export let allFiles = [];
  let svg;
  let colorScale = d3.scaleOrdinal(d3.schemeTableau10);
  let previousDotCounts = new Map();



  const linesPerDot = 5;
  const dotsColumnX = 300;
  const approxDotWidth = 10;
  const fileInfoHeight = 20;
  const dotRowHeight = 24;

  // Group current lines
  $: groupedLines = d3.groups(lines, d => d.file);

  // Match filtered lines into full file list
  $: files = allFiles
  .map(file => {
    const match = groupedLines.find(([name]) => name === file.name);
    return {
      ...file,
      visibleLines: match ? match[1] : []
    };
  })
  .sort((a, b) => b.visibleLines.length - a.visibleLines.length); // ← sort by visible lines!

  // Fixed height based on original line count (for stability)
  $: filesWithHeights = files.map(file => {
    const totalDots = Math.ceil(file.totalLines / linesPerDot);
    const availableWidth = width - dotsColumnX;
    const maxDotsPerRow = Math.floor(availableWidth / approxDotWidth) || totalDots;
    const dotRows = Math.ceil(totalDots / maxDotsPerRow);
    return { ...file, groupHeight: fileInfoHeight + dotRows * dotRowHeight };
  });

  $: positions = (() => {
    let pos = [], y = 0;
    for (const f of filesWithHeights) {
      pos.push(y);
      y += f.groupHeight;
    }
    return pos;
  })();

function generateDots(file, svgWidth) {
  const totalDots = Math.ceil(file.visibleLines.length / linesPerDot);
  const availableWidth = svgWidth - dotsColumnX;
  const maxDotsPerRow = Math.floor(availableWidth / approxDotWidth) || totalDots;
  let tspans = "";
  const dotRows = Math.ceil(totalDots / maxDotsPerRow);

  let dotIndex = 0;

  for (let r = 0; r < dotRows; r++) {
    const rowLines = file.visibleLines.slice(r * maxDotsPerRow, (r + 1) * maxDotsPerRow);
    const rowDots = rowLines
      .map(line => {
        const dot = `<tspan class="dot" data-index="${dotIndex}" style="fill:${colorScale(line.type)}">•</tspan>`;
        dotIndex++;
        return dot;
      })
      .join("");

    tspans += `<tspan x="${dotsColumnX}" dy="${r === 0 ? 0 : dotRowHeight + 'px'}">${rowDots}</tspan>`;
  }

  return tspans;
}


  $: if (svg) {
    const svgWidth = width;
    const totalHeight = positions.length
      ? positions[positions.length - 1] + filesWithHeights[filesWithHeights.length - 1].groupHeight
      : 0;

    d3.select(svg)
      .attr("width", svgWidth)
      .attr("height", totalHeight)
      .style("overflow", "hidden");


const groups = d3.select(svg)
  .selectAll("g.file")
  .data(filesWithHeights, d => d.name);

groups.exit().remove();

const enterGroups = groups.enter()
  .append("g")
  .attr("class", "file")
  .attr("transform", (d, i) => `translate(0, ${positions[i]})`);

enterGroups.append("text")
  .attr("class", "filename")
  .attr("x", 10)
  .attr("y", fileInfoHeight)
  .text(d => d.name);

enterGroups.append("text")
  .attr("class", "linecount")
  .attr("y", fileInfoHeight + 16)
  .text(d => `${d.totalLines} lines`);

enterGroups.append("text")
  .attr("class", "unit-dots")
  .attr("x", dotsColumnX)
  .attr("y", fileInfoHeight - 2)
  .attr("dominant-baseline", "mathematical")
  .attr("fill", "#1f77b4")
  .html(d => generateDots(d, svgWidth));

// ✅ Now safe to use groups below
groups
  .transition()
  .duration(function(d, i) {
    const currentTransform = this.getAttribute("transform") || "translate(0,0)";
    const match = currentTransform.match(/translate\(\s*0\s*,\s*([0-9.]+)\s*\)/);
    const oldY = match ? +match[1] : 0;
    const newY = positions[i];
    const distance = Math.abs(newY - oldY);
    return distance * 2;
  })
  .attr("transform", (d, i) => `translate(0, ${positions[i]})`);

groups.each(function (d) {
  const groupSel = d3.select(this);
  const unitDotsSel = groupSel.select('text.unit-dots');
  const newCount = d.visibleLines.length;
  const oldCount = previousDotCounts.get(d.name) || 0;

  unitDotsSel.html(generateDots(d, svgWidth));

  if (newCount > oldCount) {
    unitDotsSel
      .selectAll('tspan.dot')
      .filter(function () {
        return +this.getAttribute('data-index') >= oldCount;
      })
      .style("opacity", 0)
      .transition()
      .duration(1000)
      .ease(d3.easeCubicOut)
      .style("opacity", 1);
  }

  previousDotCounts.set(d.name, newCount);
});


  }
</script>


<svg bind:this={svg}></svg>

<style>
  :global(.filename),
  :global(.linecount) {
    fill: white;
    font-size: 12px;
  }

  :global(.unit-dots) {
    font-size: 2.0rem;
    font-family: monospace;
  }
</style>
