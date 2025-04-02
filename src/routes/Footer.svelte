<script lang="ts">
	import Github from "svelte-lucide/Github.svelte"
	import Globe from "svelte-lucide/Globe.svelte"
	import Logo from "./Logo.svelte"
	import { page } from "$app/state"
	import { WaspScripters } from "$lib/client/supabase"
</script>

<footer class="preset-filled-surface-100-900 z-40 my-auto h-fit">
	<div class="mx-8 md:mx-0">
		<header class="grid md:m-8 md:flex md:justify-between md:pt-8">
			<div class="mx-auto my-6 lg:mx-0">
				<a href="/" aria-label="Navigate to home page">
					<Logo selected={true} />
				</a>
			</div>
			<div class="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-4">
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
						{#await WaspScripters.getRandomScripters(page.data.supabaseClient)}
							{#each { length: 5 }}
								<li>Loading...</li>
							{/each}
						{:then scripters}
							{#each scripters as scripter (scripter.url)}
								<li><a href="/scripters/{scripter.url}">{scripter.profiles.username}</a></li>
							{/each}
							<li><a href="/scripters">Many more devs...</a></li>
						{/await}
					</ul>
				</nav>
				<nav>
					<span class="mb-6 text-sm font-semibold uppercase">Legal</span>
					<ul>
						<li><a href="/legal/privacy_policy">Privacy Policy</a></li>
						<li><a href="/legal/user_tos">User Terms &amp; Conditions</a></li>
						<li><a href="/legal/scripter_tos">Scripter Terms &amp; Conditions</a></li>
					</ul>
				</nav>
			</div>
		</header>
		<footer class="my-8 flex flex-col sm:flex-row">
			<span class="mx-auto my-auto text-sm sm:text-center">
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
			<div class="mx-auto my-auto flex space-x-6 sm:mt-0 sm:justify-center">
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
