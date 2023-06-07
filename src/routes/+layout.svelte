<script lang="ts">
	import "../theme.postcss"
	import "@skeletonlabs/skeleton/styles/all.css"
	import "../app.postcss"
	import { computePosition, autoUpdate, offset, shift, flip, arrow } from "@floating-ui/dom"

	import {
		AppBar,
		AppShell,
		LightSwitch,
		Modal,
		modalStore,
		storePopup,
		Toast,
		toastStore
	} from "@skeletonlabs/skeleton"

	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow })

	import Navigation from "./Navigation.svelte"
	import MediaQuery from "$lib/components/MediaQuery.svelte"
	import UserPanel from "./UserPanel.svelte"
	import Footer from "./Footer.svelte"
	import { browser } from "$app/environment"
	import { invalidate } from "$app/navigation"
	import { onMount } from "svelte"
	import type { LayoutData } from "./$types"
	import { sbClient, supabaseClient } from "$lib/backend/auth"
	export let data: LayoutData

	$: ({ profile, session } = data)

	onMount(async () => {
		console.log("server:", session?.user.id)

		const session2 = await supabaseClient.auth.getSession()
		console.log("clientHelper:", session2.data.session?.user.id)

		const session3 = await sbClient.auth.getSession()
		console.log("clientTrue:", session3.data.session?.user.id)

		const {
			data: { subscription }
		} = supabaseClient.auth.onAuthStateChange(async () => {
			invalidate("supabase:auth")
		})

		return () => subscription.unsubscribe()
	})
</script>

{#if browser && $modalStore.length > 0}
	<Modal regionBody="overflow-y-scroll max-h-96" />
{/if}
<!-- App Shell -->
<AppShell regionPage="relative" slotPageHeader="sticky top-0 z-10">
	<svelte:fragment slot="pageHeader">
		<div
			class="backdrop-blur transition-colors duration-500 border-b dark:border-surface-50/[0.06]
				 bg-white/60 supports-backdrop-blur:bg-white/95 dark:bg-surface-800/60"
		>
			<MediaQuery query="(min-width: 768px)" let:matches>
				<AppBar class="max-w-7xl mx-auto" background="bg-transparent">
					<svelte:fragment slot="lead">
						{#if matches}
							<Navigation bind:profile large={true} />
						{:else}
							<div />
						{/if}
					</svelte:fragment>
					{#if !matches}
						<Navigation bind:profile large={false} />
					{/if}
					<svelte:fragment slot="trail">
						{#if matches}
							<UserPanel bind:profile large={true} />
							<LightSwitch class="hidden md:block" />
						{:else}
							<div />
						{/if}
					</svelte:fragment>
				</AppBar>
			</MediaQuery>
		</div>
	</svelte:fragment>

	<!-- Router Slot -->
	<slot />
	<!-- ---- / ---- -->
	<svelte:fragment slot="pageFooter">
		<Footer />
	</svelte:fragment>
</AppShell>

{#if browser && $toastStore.length > 0}
	<Toast />
{/if}
