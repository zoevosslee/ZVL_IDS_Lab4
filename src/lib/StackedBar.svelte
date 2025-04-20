<script>
    import * as d3 from 'd3';
  
    export let data = []; // e.g., [['js', 20], ['css', 10]]
    export let width = 800;
    export let barHeight = 50;
    export let colorScale;
  
    const MIN_LABEL_WIDTH = 40;
    let selectedIndex = -1;
    let hoveredIndex = -1;
    
  
    // Step 3.1: Transform data
    $: keys = data.map(d => d[0]);
    $: dataForStack = [Object.fromEntries(data)];
    $: stackedData = d3.stack().keys(keys)(dataForStack);
  
    $: total = d3.max(stackedData, series =>
      d3.max(series, d => d[1])
    ) || 1;
  
    $: xScale = d3.scaleLinear().domain([0, total]).range([0, width]);
  </script>
  
  <svg {width} height={barHeight}>
    {#each stackedData as series, i (series.key)}
      {#each series as d, j}
        <rect
          class:selected={selectedIndex === i}
          class:hovered={hoveredIndex === i}
          x={xScale(d[0])}
          y="0"
          width={xScale(d[1]) - xScale(d[0])}
          height={barHeight - 5}
          fill={colorScale(series.key)}
          on:click={() => selectedIndex = selectedIndex === i ? -1 : i}
          on:mouseenter={() => hoveredIndex = i}
          on:mouseleave={() => hoveredIndex = -1}
        />
        {#if (xScale(d[1]) - xScale(d[0]) > MIN_LABEL_WIDTH)}
          <text
            class="label"
            x={(xScale(d[0]) + xScale(d[1])) / 2}
            y={barHeight / 2}
            text-anchor="middle"
            fill="white"
            dominant-baseline="middle"
          >
            {series.key}: {d[1] - d[0]}
          </text>
        {/if}
      {/each}
    {/each}
  </svg>
  
  <style>
    rect {
      transition: all 300ms ease;
      cursor: pointer;
    }
  
    rect.hovered {
      opacity: 1;
      stroke-width: 2;
    }
  
    svg:has(rect.hovered) rect:not(.hovered) {
      opacity: 0.3;
    }
  
    rect.selected {
      stroke-width: 2;
    }
  
    svg:has(rect.selected) rect:not(.selected) {
      opacity: 0.3;
    }
  
    rect.selected.hovered {
      stroke-width: 3;
      opacity: 1;
    }
  
    .label {
      font-size: 0.75em;
      pointer-events: none;
    }
  </style>
  