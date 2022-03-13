<script>
	import { user } from "../stores/authStore.js"
	import { scale } from "svelte/transition"
	import Logout from "../components/Logout.svelte"
	import Auth from "../components/Auth.svelte"
	import Avatar from "../components/Avatar.svelte"
	import logo from "$lib/assets/logo.svg"

	let show = false // menu state
</script>

<nav class="relative px-2 sm:px-4 py-2.5 accent-color">
	<div class="max-w-6xl mx-auto px-4 top-0">
		<div class="flex justify-between">
			<div class="flex space-x-7">
				<!-- Website Logo -->
				<div>
					<a href="/" class="flex items-center py-4 px-2">
						<img src={logo} class="mr-3 h-8" alt="WaspBot Logo" />
						<span class="font-bold text-color1 text-lg">WaspBot</span>
					</a>
				</div>
				<!-- Menu -->
				<div class="hidden md:flex items-center space-x-1 text-color2">
					<a
						href="/"
						class="py-4 px-2 hover:text-color1 border-b-0
						border-white transition duration-300 hover:shadow-sm"
					>
						Home
					</a>
					<a
						href="/setup"
						class="py-4 px-2 hover:text-color1 border-b-0
						border-white transition duration-300 hover:shadow-sm"
					>
						Setup
					</a>
					<a
						href="/scripts"
						class="py-4 px-2 hover:text-color1 border-b-0
						border-white transition duration-300 hover:shadow-sm"
					>
						Scripts
					</a>
					<a
						href="/faq"
						class="py-4 px-2 hover:text-color1 border-b-0
						border-white transition duration-300 hover:shadow-sm"
					>
						FAQ
					</a>
				</div>
			</div>
			<!-- Account -->
			<div class="relative">
				<div
					on:mouseover={() => (show = true)}
					on:focus={() => (show = true)}
					on:mouseleave={() => (show = false)}
					class="grid place-items-center h-full"
				>
					<button class="menu focus:outline-none focus:shadow-solid">
						<!-- Maybe this is silly but it's the only way I found to refresh the avatar on user login/logout lol-->
						{#if $user}
							<Avatar />
						{:else}
							<Avatar />
						{/if}
					</button>

					{#if show}
						<div
							in:scale={{ duration: 100, start: 0.95 }}
							out:scale={{ duration: 75, start: 0.95 }}
							class="origin-top-right top-12 absolute right-0 w-80 py-10 bg-color1 mt-1 rounded-md shadow-lg container group max-w-sm items-center mx-auto content-div"
						>
							{#if $user}
								<Logout />
							{:else}
								<Auth />
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</nav>
