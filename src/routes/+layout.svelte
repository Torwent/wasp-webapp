<script>
	import "../app.css"
	import Navbar from "./Navbar.svelte"
	import Footer from "./Footer.svelte"
</script>

<div class="h-8 bg-amber-500 text-center">
	<a href="https://dev.waspscripts.com" class="text-black hover:text-white"
		>Try the new reworked website!</a
	>
</div>
<Navbar />
<main class="min-h-screen mx-8 sm:mx-12 md:mx-16 lg:mx-24">
	<slot />
</main>
<Footer />
