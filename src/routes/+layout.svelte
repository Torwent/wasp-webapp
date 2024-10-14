<script lang="ts">
	import "../app.postcss"
	import hljs from "highlight.js/lib/core"
	import "highlight.js/styles/github-dark.css"
	import {
		AppBar,
		AppShell,
		LightSwitch,
		storeHighlightJs,
		initializeStores,
		Modal,
		storePopup,
		Toast
	} from "@skeletonlabs/skeleton"
	import shell from "highlight.js/lib/languages/shell"
	import dos from "highlight.js/lib/languages/dos"
	import xml from "highlight.js/lib/languages/xml"
	import delphi from "highlight.js/lib/languages/delphi"
	import java from "highlight.js/lib/languages/java"
	import "highlight.js/styles/github-dark.css"
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from "@floating-ui/dom"
	import { invalidate } from "$app/navigation"
	import Footer from "./Footer.svelte"
	import Navigation from "./Navigation.svelte"
	import { onMount } from "svelte"
	import MediaQuery from "svelte-media-queries"

	hljs.registerLanguage("shell", shell)
	hljs.registerLanguage("cmd", dos)
	hljs.registerLanguage("html", xml)
	hljs.registerLanguage("pascal", delphi)
	hljs.registerLanguage("java", java)

	storeHighlightJs.set(hljs)

	initializeStores()

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	export let data
	let { session, supabaseClient } = data
	$: ({ session, supabaseClient } = data)

	onMount(() => {
		const { data } = supabaseClient.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth")
			}
		})

		return () => data.subscription.unsubscribe()
	})
	let matches: boolean
</script>

<Toast />
<Modal />
<MediaQuery query="(min-width: 768px)" bind:matches />

<div class="flex flex-col h-full">
	<Navigation />

	<main class="flex flex-col w-full h-full overflow-auto">
		<slot />
		<Footer />
	</main>
</div>
