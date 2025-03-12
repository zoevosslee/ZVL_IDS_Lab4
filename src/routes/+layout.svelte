<script>
  let localStorage = globalThis.localStorage ?? {};


import { page } from "$app/stores";

let pages = [
  { url: "./", title: "Home" },
  { url: "./projects", title: "Projects" },
  { url: "./experience", title: "Experience" },
  { url: "./contact", title: "Contact" },
  // add the rest of your pages here
];

let colorScheme = "light dark";

let root = globalThis?.document?.documentElement;
$: root?.style.setProperty("color-scheme", colorScheme);

$: localStorage.colorScheme = colorScheme;



</script>


<nav>
    {#each pages as p}
    <a href={p.url} 
    class:current={"." + $page.route.id === p.url}
    target={p.url.startsWith("http") ? "_blank" : null} 
    >
      {p.title}
    </a>
    {/each}
  </nav>

  <label class="color-scheme">
		Theme:
		<select bind:value={ colorScheme }>      >
			<option value="auto">Automatic</option>
			<option value="light">Light</option>
			<option value="dark">Dark</option>
		</select>
	</label>




  <style>/* Navigation */
    nav {
      --border-color: var(--color-border);
      border-bottom: 1px solid var(--border-color);
      padding: 10px 0;
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    
    nav a {
      color: var(--color-text);
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: var(--font-size-subtitle);
      transition: background-color var(--transition-fast), color var(--transition-fast);
    }
    
    nav a.current {
      font-weight: bold;
      text-decoration: underline;
    }
    
    nav a:hover {
      background-color: color-mix(in oklch, var(--color-accent), canvas 85%);
    }
  
  nav {
    display: flex;
    position: absolute;
    top: 20px;
    right: 20px;
  }
  
  nav a {
    flex: 1;
    color: var(--color-text);
    margin: 0 10px;
    text-decoration: none;
    font-size: var(--font-size-subtitle);
  }
  
  nav a:hover {
    text-decoration: underline;
    text-decoration-color: var(--color-accent);
  }

  /* Dropdown Theme Switcher (Top-Left) */
.color-scheme {
  position: absolute;
  top: 10px;
  left: 10px;  /* Fixes position to top-left */
  font-size: var(--font-size-subtitle);
}

.color-scheme select {
  padding: 5px 10px;
  border-radius: 6px;
  font-size: var(--font-size-base);
  background-color: var(--color-primary);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
    
    </style>



<slot />
