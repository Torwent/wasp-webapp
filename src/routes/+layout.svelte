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
	import { userFast, userSlow } from "$lib/backend/auth"
	import { getProfile } from "$lib/backend/data"
	export let data: LayoutData

	$: ({ supabase, session } = data)

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((event, _session) => {
			if (_session?.expires_at !== session?.expires_at) {
				invalidate("supabase:auth")
			}
		})

		const {
			data: { subscription: userStore }
		} = supabase.auth.onAuthStateChange(async (_event, _session) => {
			const user = _session?.user

			if (user != null) {
				userFast.set(user)
				userSlow.set(user)
				return
			}

			userFast.set(false)
			userSlow.set(false)
		})

		const {
			data: { subscription: profileStore }
		} = supabase.auth.onAuthStateChange(async (_event, _session) => {
			const user = _session?.user

			if (user != null) {
				getProfile()
				return
			}
		})

		return () => {
			subscription.unsubscribe()
			userStore.unsubscribe()
			profileStore.unsubscribe()
		}
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
							<Navigation bind:profile={data.profile} large={true} />
						{:else}
							<div />
						{/if}
					</svelte:fragment>
					{#if !matches}
						<Navigation bind:profile={data.profile} large={false} />
					{/if}
					<svelte:fragment slot="trail">
						{#if matches}
							<UserPanel bind:profile={data.profile} large={true} />
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
