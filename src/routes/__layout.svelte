<script>
	import "../app.css"
	import Navbar from "../components/Navbar.svelte"
	import Footer from "../components/Footer.svelte"
</script>

<Navbar />
<div class="min-h-screen">
	<slot />
</div>
<Footer />
