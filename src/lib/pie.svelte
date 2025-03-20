<script>

import * as d3 from 'd3';
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let arc = arcGenerator({
	startAngle: 0,
	endAngle: 2 * Math.PI
});

export let data = [];
let sliceGenerator = d3.pie().value(d=> d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map(d => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

</script>

<div class="container">
<svg viewBox="-50 -50 100 100">
    {#each arcs as arc, index}
    <path d={ arc } fill={ colors(index) } />
  {/each}
</svg>

<ul class="legend">
	{#each data as d, index}
		<li style="--color: { colors(index) }">
			<span class="swatch"></span>
			{d.label} <em>({d.value})</em>
		</li>
	{/each}
</ul>
</div>


<style>
svg {
	max-width: 20em;
	margin-block: 2em;
	/* Do not clip shapes outside the viewBox */
	overflow: visible;
}

.legend {
    display:grid;
    grid-template-columns: repeat(auto-fill, minmax(8em, 1fr));;
    list-style: none;
    padding: 0;
    margin: 1em 0;
    border: 1px dashed white;
    padding: 20px;
    margin: 10px;
    flex:1;
}

.legend .swatch {
    display: inline-flex;
    width: 1em;
    height: 1em;
    background-color: var(--color);
    margin-inline-end: 0.5em;
}


.legend li {
    align-items: center;
    font-size: 0.9em;
    margin-bottom: 0.3em;
}

</style>
