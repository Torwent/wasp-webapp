<script>
	import "../app.css"
	import Navbar from "../components/Navbar.svelte"
	import Footer from "../components/Footer.svelte"
	import { user } from "../stores/authStore"
	import { supabase } from "$lib/supabase"

	supabase.auth.onAuthStateChange((_, session) => {
		user.set(session?.user)
		if (session?.user) {
			loadTodos()
		}
	})
</script>

<Navbar />
<slot />
<Footer />
