<svelte:head>
  <title>ZVL: Contact Me</title>
</svelte:head>
<div id="contact-page">
    <!-- <nav>
        <a href="..\index.html">Home</a>
        <a href="..\experience\index.html">Experience</a>
        <a href="..\projects\index.html">Projects</a>
        <a href="index.html">Contact</a>
        <a href="https://github.com/zoevosslee" target="_blank">GitHub</a>
    </nav> -->
    <h1>Contact</h1>
    <form action="mailto:zvl@mit.edu" method="post" enctype="text/plain">
        <label for="email">Your Email:</label>
        <input id="email" name="email" type="email" placeholder="Enter your email" required>
        <br><br>

        <label for="subject">Subject:</label>
        <input id="subject" name="subject" type="text" placeholder="Enter subject" required>
        <br><br>

        <label for="body">Message:</label>
        <textarea id="body" name="body" rows="5" required></textarea>
        <br><br>

        <button>Send Message</button>
    </form>
</div>