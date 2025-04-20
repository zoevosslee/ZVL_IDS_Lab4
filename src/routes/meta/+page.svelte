<script>
  import * as d3 from "d3";
  import { onMount } from "svelte";
  import { tick } from "svelte";
  import { computePosition, offset, autoPlacement } from '@floating-ui/dom';
  import Bar from '$lib/bar.svelte';
  import FileLines from '$lib/FileLines.svelte';
  import StackedBar from '$lib/StackedBar.svelte';
  let width = 1000, height = 600;
  let margin = {top: 10, right: 10, bottom: 30, left: 20};
  let usableArea = {
top: margin.top,
right: width - margin.right,
bottom: height - margin.bottom,
left: margin.left
};
usableArea.width = usableArea.right - usableArea.left;
usableArea.height = usableArea.bottom - usableArea.top;

export let languageBreakdown;
  export let colorScale;


let xAxis, yAxis, yAxisGridlines;
let hoveredIndex = -1;
let commitTooltip;
let tooltipPosition = {x: 0, y: 0};
let clickedCommits = [];

let commitProgress = 100;

const linesPerDot = 5;
const dotsColumnX = 300;
const approxDotWidth = 10;
const fileInfoHeight = 20;
const dotRowHeight = 24;




async function dotInteraction(index, evt) {
if (evt.type === "mouseenter") {
  hoveredIndex = index;

  // Wait for tooltip to render
  await tick();

  let hoveredDot = evt.target;

  if (hoveredDot && commitTooltip) {
    const { x, y } = await computePosition(hoveredDot, commitTooltip, {
      strategy: "fixed",
      middleware: [offset(5), autoPlacement()]
    });
    tooltipPosition = { x, y };
  }
} else if (evt.type === "mouseleave") {
  hoveredIndex = -1;
}
else if (evt.type === "click") {
let commit = commits[index]
if (!clickedCommits.includes(commit)) {
  // Add the commit to the clickedCommits array
  clickedCommits = [...clickedCommits, commit];
}
else {
    // Remove the commit from the array
    clickedCommits = clickedCommits.filter(c => c !== commit);
}
  console.log(clickedCommits);
}
}

$: hoveredCommit = hoveredIndex !== -1 ? commits[hoveredIndex] : null;

let data = [];
let commits = [];
$: rScale = d3.scaleSqrt()
.domain(d3.extent(commits, d => d.totalLines))
.range([3, 12]); // min & max radius





onMount(async () => {
  data = await d3.csv("/loc.csv", row => ({
  ...row,
      line: Number(row.line),
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + "T00:00" + row.timezone),
      datetime: new Date(row.datetime)
    }));

    commits = d3.groups(data, d => d.commit).map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
  commits = d3.sort(commits, d => -d.totalLines);

      let ret = {
        id: commit,
        url: "https://github.com/vis-society/lab-7/commit/" + commit,
        author, date, time, timezone, datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length
      };

      Object.defineProperty(ret, "lines", {
        value: lines,
        configurable: true,
        writable: true,
        enumerable: false
      });

      return ret;
    });
  });

$: minDate = d3.min(commits.map(d => d.date));
$: maxDate = d3.max(commits.map(d => d.date));
$: maxDatePlusOne = new Date(maxDate);
$: maxDatePlusOne.setDate(maxDatePlusOne.getDate() + 1);

$: timeScale = d3.scaleTime()
.domain([minDate, maxDatePlusOne])
.range([0, 100]);

$: commitMaxTime = timeScale.invert(commitProgress);

$: filteredCommits = commits.filter(d => d.datetime <= commitMaxTime);

$: xScale = d3.scaleTime()
.domain([minDate, commitMaxTime])
.range([usableArea.left, usableArea.right])
.nice();


$: yScale = d3.scaleLinear()
            .domain([24, 0])
            .range([usableArea.bottom, usableArea.top]);




            $: {
d3.select(xAxis).call(d3.axisBottom(xScale));

d3.select(yAxis).call(
  d3.axisLeft(yScale)
    .tickFormat(d => String(d % 24).padStart(2, "0") + ":00")
);

d3.select(yAxisGridlines).call(
  d3.axisLeft(yScale)
    .tickFormat("")
    .tickSize(-usableArea.width)
);


// 🎨 Color each horizontal gridline by time of day
d3.select(yAxisGridlines)
  .selectAll(".tick line")
  .attr("stroke", d => colorScale(d))  // set stroke color
  .attr("stroke-opacity", 0.5);
}

$: colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(allTypes);

$: base = clickedCommits.length > 0 ? clickedCommits : filteredCommits;
$: selectedLines = base.flatMap(d => d.lines);
$: allTypes = Array.from(new Set(selectedLines.map(d => d.type)));
$: selectedCounts = d3.rollup(
  selectedLines,
  v => v.length,
  d => d.type
);
$: languageBreakdown = allTypes.map(type => [type, selectedCounts.get(type) || 0]);


// Lines from only filtered commits (for meta stats)
$: filteredLines = filteredCommits.flatMap(d => d.lines);
$: allFiles = d3.groups(data, d => d.file)
.map(([name, lines]) => ({
  name,
  lines,
  totalLines: lines.length
}));



</script>

<body>
  <section class="meta-stats">
    <h2>My Metadata</h2>
    <dl>
      <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
      <dd>{filteredLines.length}</dd> <!-- Total LOC -->
      <dt>Commits</dt>
      <dd>{filteredCommits.length}</dd>
      <dt>Files</dt>
      <dd>{[...new Set(filteredLines.map(d => d.filename))].length}</dd>
      <dt>Longest Line</dt>
      <dd>{d3.max(filteredLines, d => d.length)}</dd>
      <dt>Average Line Length</dt>
      <dd>{d3.mean(filteredLines, d => d.length)?.toFixed(2)}</dd>
      <dt>Days Worked</dt>
      <dd>{[...new Set(data.map(d => d.date.toDateString()))].length}</dd>
      <dt>Most Active Time of Day</dt>
      <dd>{d3.greatest(
        d3.rollups(data, v => v.length, d => d.datetime.toLocaleString("en", { dayPeriod: "short" })),
        d => d[1]
      )?.[0]}</dd>
      <dt>Most Active Day of Week</dt>
      <dd>{d3.greatest(
        d3.rollups(data, v => v.length, d => d.date.toLocaleString("en", { weekday: "long" })),
        d => d[1]
      )?.[0]}</dd>
    </dl>
  </section>


  <section class="visualization-section">
    <h2>Commits by Time of Day</h2>

    <div class="slider-container">
      <div class="slider-row">
        <label for="time-slider">Show commits until:</label>
        <input
          type="range"
          id="time-slider"
          class="slider"
          min="0"
          max="100"
          bind:value={commitProgress}
        />
      </div>

      {#if selectedLines.length > 0}
<FileLines lines={filteredLines} allFiles={allFiles} width={width} colorScale={colorScale} />
      {/if}
      
      <time>{commitMaxTime.toLocaleString("en", { dateStyle: "long", timeStyle: "short" })}</time>
    </div>
    

    <div class="chart-container" style="position: relative;">
      <svg viewBox="0 0 {width} {height}">
        <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
        <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
        <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
        <g class="dots">
          {#each filteredCommits as commit (commit.id)}
          <circle
              on:click={evt => dotInteraction(index, evt)}
              class:selected={clickedCommits.includes(commit)}
              on:mouseenter={evt => dotInteraction(index, evt)}
              on:mouseleave={evt => dotInteraction(index, evt)}
              cx={xScale(commit.datetime)}
              cy={yScale(commit.hourFrac)}
              r={rScale(commit.totalLines)}
              fill-opacity={0.8}
              fill="steelblue"
            />
          {/each}
        </g>
      </svg>

      {#if hoveredCommit}
        <dl
          class="info tooltip"
          bind:this={commitTooltip}
          style="top: {tooltipPosition.y}px; left: {tooltipPosition.x}px;"
          hidden={hoveredIndex === -1}
        >
          <dt>Commit</dt>
          <dd><a href="{hoveredCommit.url}" target="_blank">{hoveredCommit.id}</a></dd>
          <dt>Date</dt>
          <dd>{hoveredCommit.datetime?.toLocaleString("en", { dateStyle: "full" })}</dd>
          <dt>Time</dt>
          <dd>{hoveredCommit.datetime?.toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })}</dd>
          <dt>Author</dt>
          <dd>{hoveredCommit.author}</dd>
          <dt>Lines Edited</dt>
          <dd>{hoveredCommit.totalLines}</dd>
        </dl>
      {/if}
    </div>

    <div class="bar-chart-container">
      <StackedBar data={languageBreakdown} width={width} colorScale={colorScale} />
    </div>
    
  </section>
</body>

<style>
  body {padding:50px;}
svg {
  overflow: visible;
}

.meta-stats h2{
width: 100%;
text-align: left;
padding-bottom: 30px;

}
.meta-stats {
background-color: var(--color-background);
color: var(--color-text);
border: 1px solid var(--color-border);
border-radius: 8px;
max-width: 90%;  /* Match .container */
text-align: center;
padding-bottom:30px;
}

/* Grid layout for <dl> */
  .meta-stats dl {
max-width: 90%;
margin: auto;
display: grid;
grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
gap: 20px;
text-align: left;
}



/* Place <dt> on row 1 and <dd> on row 2 */
.meta-stats dt {
font-weight: bold;
}

.meta-stats dd {
font-size: 1.2em;
color: white;
margin: 0;
}

.meta-stats dt,
.meta-stats dd {
display: block;
}

.gridlines {
stroke-opacity: .2;
}

.tooltip {
  position: fixed;
  background: var(--color-primary, white);
  color: var(--color-text, black);
  border: 1px solid var(--color-border, lightgray);
  border-radius: 8px;
  padding: 1em;
  font-size: 0.85em;
  z-index: 10;
  max-width: 300px;
  transition-duration: 500ms;
  transition-property: opacity, visibility;
  box-shadow: 0 2px 4px white;
}


dl.info {
display: grid;
grid-template-columns: auto 1fr;
gap: 20px;
margin: 0;
padding: 1em;
font-size: 0.9em;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}



dl.info dt {
  font-weight: bold;
  padding-bottom: 10px;

}

dl.info dd {
font-size: 1.2em;
color: var(--color-accent);
margin: 0;

}

circle {

@starting-style {
r: 0;
}


  transform-origin: center;
transform-box: fill-box;
  transition: 200ms;

&:hover {
  transform: scale(1.5);
}
}

.selected {
  fill: var(--color-accent);
}

/* Container for the entire slider + date display */
.slider-container {
display: grid;
grid-template-rows: auto auto;
max-width: 600px;
margin: 1.5rem 0 2rem;
text-align:left;
gap: 0.5rem;
padding: 0 0rem;
font-family: inherit;
}

/* Row with label and slider */
.slider-row {
display: flex;
align-items: center;
gap: 1rem;
white-space: nowrap;
width: 50%;
}

/* Style the label */
.slider-row label {
font-weight: 500;
font-size: 1rem;
}

/* Style the slider itself */
.slider {
width: 100%;
-webkit-appearance: none;
height: 6px;
background: #ddd;
border-radius: 3px;
outline: none;
}

.slider:hover {
background: #bbb;
}

/* Customize the slider thumb */
.slider::-webkit-slider-thumb {
-webkit-appearance: none;
appearance: none;
width: 16px;
height: 16px;
background: steelblue;
border: 2px solid white;
border-radius: 50%;
cursor: pointer;
transition: transform 0.2s ease;
}

.slider::-webkit-slider-thumb:hover {
transform: scale(1.2);
}

.slider::-moz-range-thumb {
width: 16px;
height: 16px;
background: steelblue;
border: 2px solid white;
border-radius: 50%;
cursor: pointer;
}

/* Date/time display */
.slider-container time {
font-size: 0.95rem;
color: white;
text-align: right;
}
/* Style for FileLines labels */
:global(text.filename),
:global(text.linecount) {
fill: white;
font-size: 12px;
}



</style>