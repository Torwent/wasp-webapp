<script>
	import "../app.css"
	import Navbar from "./Navbar.svelte"
	import Footer from "./Footer.svelte"
</script>

<Navbar />
<main class="min-h-screen mx-8 sm:mx-12 md:mx-16 lg:mx-24">
	<slot />
</main>
<Footer />
