<script>
    import projects from "$lib/projects.json";
    import Project from "$lib/Project.svelte";
    import Pie from '$lib/Pie.svelte';
    import * as d3 from 'd3';

// Make sure the variable definition is *outside* the block
let pieData;

    $: {
		// Initialize to an empty object every time this runs
        pieData = {};
        
		// Calculate rolledData and pieData based on filteredProjects here
        let rolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);

		// We don't need 'let' anymore since we already defined pieData
        pieData = rolledData.map(([year, count]) => {
            return { value: count, label: year };
        });
    }


let query = "";

// let filteredProjects;
$: filteredProjects = projects.filter(project => {
	if (query) {
		return project.title.toLowerCase().includes(query.toLowerCase());
	}
    

	return true;
});

$: filteredProjects = projects.filter(project => {
	let values = Object.values(project).join("\n").toLowerCase();
	return values.includes(query.toLowerCase());
});

let selectedYearIndex = -1;
let selectedYear;
$: selectedYear = selectedYearIndex > -1 ? pieData[selectedYearIndex].label : null;

$: filteredByYear = filteredProjects.filter(project => {
        if (selectedYear) {
            return project.year === selectedYear;
        }

        return true;
    });



  </script>
<svelte:head>
  <title>ZVL: Projects</title>
</svelte:head>
    <div id="projects-page">
    <!-- <nav>
        <a href="..\index.html">Home</a>
        <a href="..\Experience\index.html">Experience</a>
        <a href="index.html">Projects</a>
        <a href="..\contact\index.html">Contact</a>
        <a href="https://github.com/zoevosslee" target="_blank">GitHub</a>
    </nav> -->
    <h1>{ projects.length } Projects</h1>

   
    <Pie data={pieData} bind:selectedIndex={selectedYearIndex} />
    

    <input type="search" bind:value={query}
    aria-label="Search projects" placeholder="🔍 Search projects…" />


    <div class="projects">
        {#each filteredProjects as p}
        <Project data={p} hLevel="3" />
        {/each}
        <!-- <article>
            <h2>Non, praesentium tempora. Quod!</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Rem ad reiciendis sit, pariatur modi mollitia consectetur amet quas deleniti id non consequatur laudantium odio. Molestiae aliquid, tempore ut sunt corrupti, nulla explicabo alias incidunt sit mollitia veniam voluptatibus.</p>
        </article>
        <article>
            <h2>Quas quod similique aut!</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Quam accusamus saepe, atque error ex necessitatibus repellat nobis asperiores repudiandae beatae, illo dolorum dolor? Voluptatem, mollitia consequuntur repudiandae tenetur, quibusdam exercitationem ipsa illo placeat reiciendis asperiores beatae nisi atque!</p>
        </article>
        <article>
            <h2>Quaerat hic totam quo.</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Minima, et voluptates? Inventore perspiciatis earum saepe delectus hic incidunt dignissimos, assumenda, fuga facere reprehenderit aperiam provident maiores vitae labore sit. Laboriosam at excepturi hic in sapiente numquam laudantium iusto!</p>
        </article>
        <article>
            <h2>Id voluptatem nobis saepe.</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Nam, explicabo! Expedita laborum est, quaerat maxime provident placeat ipsum. Totam aspernatur dolore a, inventore atque earum modi quo quibusdam nisi soluta vitae numquam recusandae est explicabo quas ut aperiam!</p>
        </article>
        <article>
            <h2>Quaerat, repellat. Quam, cum.</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>In aspernatur maxime exercitationem, repellendus totam at? Iusto nesciunt sapiente quidem facilis molestias ratione recusandae aliquam fuga provident quisquam sequi, fugit ab et explicabo eaque! Tempora ex obcaecati doloribus ducimus.</p>
        </article>
        <article>
            <h2>Assumenda tenetur corporis labore.</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Blanditiis asperiores dicta iure natus distinctio velit, voluptatum obcaecati numquam eum earum! Sequi nobis velit in perspiciatis quo harum repellat porro molestias magnam voluptatum, similique autem magni odit quidem optio.</p>
        </article>
        <article>
            <h2>Impedit, laborum? Corporis, deleniti?</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Obcaecati sed autem consequatur laudantium aliquam, veritatis excepturi dolores? Vero, neque. Nam doloremque aperiam soluta, sint voluptates enim dicta illum accusamus necessitatibus deleniti odio laudantium deserunt, optio corrupti maxime! Ea?</p>
        </article>
        <article>
            <h2>Ut unde rem quisquam?</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Officiis deleniti ullam atque culpa animi. At amet nisi laboriosam! Perferendis molestias, voluptatum fugiat corporis iste modi quas deleniti iusto reiciendis exercitationem id pariatur hic accusamus porro eligendi, libero odit.</p>
        </article>
        <article>
            <h2>Quaerat modi expedita laborum?</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Repellat ea ipsum non nulla numquam corrupti voluptate fuga, unde esse animi alias temporibus, minus itaque officia magni sed consequatur reprehenderit aliquam, autem in blanditiis tempora. Cupiditate sit veniam impedit?</p>
        </article>
        <article>
            <h2>Repudiandae a perferendis similique.</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Expedita repudiandae, labore velit similique sunt quo, hic at eveniet eius provident adipisci est iste a recusandae placeat esse vel explicabo, tempore consectetur nam? Sapiente ipsum voluptate accusamus esse commodi?</p>
        </article>
        <article>
            <h2>Nihil, impedit exercitationem? Consectetur?</h2>
            <img src="https://vis-society.github.io/labs/2/images/empty.svg" alt="">
            <p>Consequuntur veritatis voluptatum beatae nesciunt at tempora a distinctio nihil esse alias officiis assumenda totam minus, voluptatem qui doloremque temporibus molestias! Tempore doloribus dolorem reprehenderit quas adipisci magni quis nihil.</p>
        </article> -->
    </div>
    </div>


    <style>
        input{
            width: 100%;

        }
    </style>