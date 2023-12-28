<script lang="ts">
	import { Github, Globe } from "lucide-svelte"
	import Logo from "./Logo.svelte"
	import type { ScripterWithProfile } from "$lib/types/collection"
	import { page } from "$app/stores"

	async function getScripters() {
		const { data, error: err } = await $page.data.supabaseClient
			.schema("profiles")
			.from("scripters")
			.select(`id, realname, url, profiles!left (username, avatar)`)

			.order("username", { foreignTable: "profiles", ascending: true })
			.limit(5)
			.limit(1, { foreignTable: "profiles" })
			.returns<ScripterWithProfile[]>()

		if (err) console.error(err)

		function shuffle(array: ScripterWithProfile[]) {
			let currentIndex = array.length,
				randomIndex

			// While there remain elements to shuffle.
			while (currentIndex != 0) {
				// Pick a remaining element.
				randomIndex = Math.floor(Math.random() * currentIndex)
				currentIndex--

				// And swap it with the current element.
				;[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]]
			}

			return array
		}

		let result: ScripterWithProfile[] = []
		if (data) result = shuffle(data)

		return result
	}
</script>

<footer class="variant-soft-surface">
	<div class="mx-8 md:mx-0">
		<header class="grid md:flex md:justify-between md:m-8 md:pt-8">
			<div class="mx-auto lg:mx-0 my-6">
				<a href="/" aria-label="Navigate to home page">
					<Logo selected={true} />
				</a>
			</div>
			<div class="grid grid-cols-2 gap-8 sm:gap-4 sm:grid-cols-3">
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Resources</span>
					<ul>
						<li><a href="/setup">Setup</a></li>
						<li>
							<a href="https://torwent.github.io/SRL-T" target="_blank">SRL-T Documentation</a>
						</li>
						<li>
							<a href="https://torwent.github.io/WaspLib" target="_blank">WaspLib Documentation</a>
						</li>
						<li><a href="https://github.com/villavu/Simba" target="_blank">Simba repo</a></li>
						<li>
							<a href="https://github.com/villavu/SRL-Development" target="_blank">SRL repo</a>
						</li>
						<li><a href="https://github.com/Torwent/WaspLib" target="_blank">WaspLib repo</a></li>
					</ul>
				</nav>
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Special thanks:</span>
					<ul>
						{#await getScripters()}
							<li>Loading...</li>
							<li>Loading...</li>
							<li>Loading...</li>
						{:then scripters}
							{#each scripters as scripter}
								<li><a href="/developers/{scripter.url}">{scripter.profiles.username}</a></li>
							{/each}
						{/await}

						<li><a href="/developers">Many more devs...</a></li>
					</ul>
				</nav>
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Legal</span>
					<ul>
						<li><a href="/legal/privacy_policy">Privacy Policy</a></li>
						<li><a href="/legal/user_terms_of_service">User Terms &amp; Conditions</a></li>
						<li><a href="/legal/scripter_terms_of_service">Scripter Terms &amp; Conditions</a></li>
					</ul>
				</nav>
			</div>
		</header>
		<footer class="sm:flex sm:items-center sm:justify-between p-8 sm:p-12">
			<span class="text-sm sm:text-center">
				This webapp is open source! Checkout
				<a
					class="permalink text-secondary-500"
					href="https://github.com/torwent/wasp-webapp"
					target="_blank"
				>
					WaspScripts source code
				</a>
				!
			</span>
			<div class="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
				<a
					href="https://github.com/torwent"
					target="_blank"
					aria-label="Navigate to GitHub"
					class="permalink text-secondary-500"
				>
					<Github />
				</a>
				<a
					href="https://waspscripts.com"
					aria-label="Navigate to main site"
					class="permalink text-secondary-500"
				>
					<Globe />
				</a>
			</div>
		</footer>
	</div>
</footer>
