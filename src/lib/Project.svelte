<script> 
    export let data = {};
    export let hLevel = 2;
</script>

<article>
    <svelte:element this={"h" + hLevel}>{data.title}</svelte:element>
    <img src={data.image} alt="">
    <p>{data.description}</p>
</article>

<style>
.projects article {
    display: grid;
    grid-template-rows: subgrid;
    grid-row: span 3;
  }
  
  .projects article h2 {
    font-size: var(--font-size-section-title);
    font-weight: bold;
    text-transform: uppercase;
    margin: 0;
    color: var(--color-accent);
  }
  </style>