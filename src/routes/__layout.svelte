<script>
	import "../app.css"
	import Navbar from "$lib/components/Navbar.svelte"
	import Footer from "$lib/components/Footer.svelte"
</script>

<Navbar />
<main class="min-h-screen mx-8 sm:mx-12 md:mx-16 lg:mx-24">
	<slot />
</main>
<Footer />
