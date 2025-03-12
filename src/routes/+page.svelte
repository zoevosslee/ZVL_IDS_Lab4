<script>
    import projects from "$lib/projects.json";
    import Project from "$lib/Project.svelte";

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

    {#await fetch("https://api.github.com/users/zoevosslee")}
  <p>Loading...</p>
{:then response}
  {#await response.json()}
    <p>Decoding...</p>
  {:then data}
  <section class="github-stats">
    <h2>My GitHub Stats</h2>
    <dl>
      <dt>Followers:</dt>
      <dd>{data.followers}</dd>
      <dt>Following:</dt>
      <dd>{data.following}</dd>
      <dt>Public Repositories:</dt>
      <dd>{data.public_repos}</dd>
    </dl>
  </section>
  
  {:catch error}
    <p class="error">Something went wrong: {error.message}</p>
  {/await}
{:catch error}
  <p class="error">Something went wrong: {error.message}</p>
{/await}


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
    /* GitHub Stats Section */


</style>
