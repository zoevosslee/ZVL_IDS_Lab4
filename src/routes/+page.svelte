<script>
    import projects from "$lib/projects.json";
    import Project from "$lib/Project.svelte";
    import { onMount } from "svelte";

let githubData = null;
let loading = true;
let error = null;

onMount(async () => {
	try {
		const response = await fetch("https://api.github.com/users/zoevosslee");
		githubData = await response.json();
	} catch (err) {
		error = err;
	}
	loading = false;
});


</script>

<svelte:head>
    <title>ZVL</title>
</svelte:head>

<div id="home-page">
    <div class="container">
        <div class="text-content">
            <h1>Zoe Voss Lee</h1>
            <p>
                Hi! My name is Zoe Voss Lee. I am a city planning graduate student at MIT. 
                Talk to me about climate justice, maps, data ethics, and extreme heat.
            </p>
        </div>
        <div class="image-content">
            <img src="images/zoe_turkiye.jpg" alt="Photograph of the author walking down a colorful street">
        </div>
    </div>

    {#if loading}
    <p>Loading...</p>
{:else if error}
    <p class="error">Something went wrong: {error.message}</p>
{:else}
    <section class="github-stats">
        <h2>My GitHub Stats</h2>
        <dl>
            <dt>Followers</dt>
            <dd>{githubData.followers}</dd>
            <dt>Following</dt>
            <dd>{githubData.following}</dd>
            <dt>Public Repositories</dt>
            <dd>{githubData.public_repos}</dd>
        </dl>
    </section>
{/if}



    <div class="projects">
        <div class = "projects-title">
            <h2>Most Recent Projects</h2>
            </div>
        
        <div class="project-highlights">
           
            {#if projects?.length}
                {#each projects.slice(0, 3) as p}
                <Project data={p} hLevel="3" />
                {/each}
            {:else}
                <p>No projects found.</p>
            {/if}
        </div>
    </div>
</div>


<style>


</style>
