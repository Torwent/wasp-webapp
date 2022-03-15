<script>
	import "../app.css"
	import { supabase } from "../lib/supabase.js"
	import { user } from "../stores/authStore.js"
	import { loadTodos } from "../stores/todoStore.js"
	import Navbar from "../components/Navbar.svelte"
	import Footer from "../components/Footer.svelte"

	user.set(supabase.auth.user())
	supabase.auth.onAuthStateChange((_, session) => {
		user.set(session?.user)
		if (session?.user) {
			loadTodos()
		}
	})
</script>

<Navbar />

{#if $user}
	<slot />
{:else}
	<slot />
{/if}

<Footer />
