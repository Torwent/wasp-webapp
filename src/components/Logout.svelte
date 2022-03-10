<script>
	import { supabase } from "../lib/supabase.js"

	const logout = () => {
		supabase.auth.signOut()
	}
</script>

<div class="px-4 py-2">
	<div class="my-4 flex justify-end">
		<button
			class="shadow-sm rounded bg-blue-500 hover:bg-blue-600 text-white py-2 px-4"
			on:click={logout}>Log Out</button
		>
	</div>
</div>
