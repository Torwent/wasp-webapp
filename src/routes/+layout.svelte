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
	import { goto, invalidate } from "$app/navigation"
	import Footer from "./Footer.svelte"
	import Navigation from "./Navigation.svelte"
	import UserPanel from "./UserPanel.svelte"
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
	$: ({ session, supabaseClient } = data)

	onMount(() => {
		const { data } = supabaseClient.auth.onAuthStateChange((_, newSession) => {
			if (!newSession) {
				setTimeout(() => goto("/", { invalidateAll: true }))
			}

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

<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10" slotPageFooter="grid">
	<svelte:fragment slot="pageHeader">
		<div
			class="backdrop-blur transition-colors duration-500 border-b dark:border-surface-50/[0.06]
				 bg-white/60 supports-backdrop-blur:bg-white/95 dark:bg-surface-800/60"
		>
			<MediaQuery query="(max-width: 768px)" bind:matches>
				<AppBar class="max-w-7xl mx-auto" background="bg-transparent">
					<svelte:fragment slot="lead"><Navigation large={!matches} /></svelte:fragment>

					<svelte:fragment slot="trail">
						{#if !matches}
							<UserPanel large={true} />
							<LightSwitch class="hidden md:block" />
						{/if}
					</svelte:fragment>
				</AppBar>
			</MediaQuery>
		</div>
	</svelte:fragment>

	<slot />
	<svelte:fragment slot="pageFooter">
		<Footer />
	</svelte:fragment>
</AppShell>
