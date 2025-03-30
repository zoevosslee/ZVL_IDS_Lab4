<script>
    import * as d3 from "d3";
    import { onMount } from "svelte";
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

let xAxis, yAxis, yAxisGridlines;
let hoveredIndex = -1;
$: hoveredCommit = commits[hoveredIndex] ?? hoveredCommit ?? {};


    let data = [];
    let commits = [];
  
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

$: xScale = d3.scaleTime()
              .domain([minDate, maxDatePlusOne])
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

$: colorScale = d3.scaleSequential(d3.interpolateWarm).domain([24, 0]);
// or try interpolateCool, interpolatePlasma, interpolateTurbo, etc.




  </script>
  
<body>
<section class="meta-stats">
    <h2>My Metadata</h2>
    <dl>
        <dt>Total <abbr title="Lines of code">LOC</abbr></dt>
        <dd>{data.length}</dd>
        <dt>Commits</dt>
        <dd>{commits.length}</dd>
    
        <dt>Files</dt>
        <dd>{[...new Set(data.map(d => d.filename))].length}</dd>
    
        <dt>Longest Line</dt>
        <dd>{d3.max(data, d => d.length)}</dd>

        <dt>Average Line Length</dt>
        <dd>{d3.mean(data, d => d.length)?.toFixed(2)}</dd>

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

<section>
    <h2>Commits by Time of Day</h2>
<svg viewBox="0 0 {width} {height}">
    <g class="gridlines" transform="translate({usableArea.left}, 0)" bind:this={yAxisGridlines} />
    <g transform="translate(0, {usableArea.bottom})" bind:this={xAxis} />
    <g transform="translate({usableArea.left}, 0)" bind:this={yAxis} />
    <g class="dots">
        {#each commits as commit, index }
            <circle
                on:mouseenter={evt => hoveredIndex = index}
                on:mouseleave={evt => hoveredIndex = -1}
                
                cx={ xScale(commit.datetime) }
                cy={ yScale(commit.hourFrac) }
                r="5"
                fill="steelblue"
            />
        {/each}
        </g>
    </svg>

    <dl class="info tooltip">
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
  color: var(--color-accent);
  margin: 0;
}

.meta-stats dt,
.meta-stats dd {
  display: block;
}

.gridlines {
	stroke-opacity: .2;
}




</style>





