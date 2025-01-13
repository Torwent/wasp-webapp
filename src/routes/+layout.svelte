<script lang="ts">
	import "../app.css"
	import { invalidate } from "$app/navigation"
	import { onMount } from "svelte"
	import { ToastProvider } from "@skeletonlabs/skeleton-svelte"
	import Navigation from "./Navigation.svelte"

	let { data, children } = $props()
	let { session, supabase } = $derived(data)

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth")
			}
		})

		return () => data.subscription.unsubscribe()
	})
</script>

<ToastProvider>
	<div class="flex h-full flex-col">
		<Navigation />

		<main class="flex h-full w-full flex-col overflow-auto">
			{@render children()}
			TODO
			<!-- <Footer /> -->
		</main>
	</div>
</ToastProvider>
