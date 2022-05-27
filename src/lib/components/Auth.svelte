<script>
	import { supabase } from "$lib/supabase.js"
	import Discord from "$lib/components/Discord.svelte"

	let loading = false

	const handleLogin = async () => {
		try {
			loading = true
			let { error } = await supabase.auth.signIn(
				{ provider: "discord" },
				{
					redirectTo: window.location.origin
				}
			)
		} catch (error) {
			console.error(error)
		} finally {
			loading = false
		}
	}
</script>

<div class="px-4 py-2 ">
	<h1 class="text-2x1 font-bold text-center md:text-3x1">Log In</h1>
	<form on:submit|preventDefault={handleLogin}>
		<div class="flex flex-col text-sm mb-2">
			<div class="flex justify-center items-center flex-wrap space-x-2 py-4">
				<!-- Discord -->
				<button
					type="submit"
					class="inline-block text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out"
				>
					<Discord label="Login with Discord" />
				</button>
			</div>
		</div>
	</form>
</div>
