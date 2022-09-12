<script lang="ts">
	import { fade } from "svelte/transition"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { supabase } from "$lib/database/supabase"
	import type { Profile } from "$lib/database/types"
	import { validEmail } from "$lib/utils"
	export let data: { data: Profile; clientAddress: string }

	let email: string = ""
	let password: string = ""

	let emailUpdated = false,
		passUpdated = false,
		clientAddress = data.clientAddress

	const supabaseUser = supabase.auth.user()

	if (supabaseUser != null && supabaseUser.email != null) {
		email = supabaseUser.email
	}

	const updateAccount = async () => {
		let obj: { email?: string; password?: string } = {}

		if (validEmail(email)) {
			emailUpdated =
				supabaseUser != null && supabaseUser.email != null && email !== supabaseUser.email
			obj.email = email
		}

		if (password != null && password.length > 6) {
			obj.password = password
			passUpdated = true
		}
		const { error } = await supabase.auth.update(obj)
		if (error) return console.error(error)
	}

	const updateIpList = async () => {
		let obj: { email?: string; password?: string } = {}

		if (validEmail(email)) {
			emailUpdated =
				supabaseUser != null && supabaseUser.email != null && email !== supabaseUser.email
			obj.email = email
		}

		if (password != null && password.length > 6) {
			obj.password = password
			passUpdated = true
		}
		const { error } = await supabase.auth.update(obj)
		if (error) return console.error(error)
	}

	const loadIpList = async (user: string) => {
		const { data, error } = await supabase
		.from('ip_whitelist')
		.select('ip')
		.eq('user', user)

		if (error) return console.error(error)
		return data
	}

	const ipList = loadIpList(data.data.id) as unknown as { ip: string }
</script>

{#if supabaseUser && data.data.id === supabaseUser.id}
	<div
		class="container mx-auto my-6 max-w-2xl flex-grow"
		in:fade={{ duration: 300, delay: 300 }}
		out:fade={{ duration: 300 }}
	>
		<h1 class="mb-4 font-bold text-3xl">Username: {data.data.username}</h1>
		<h2 class="font-semibold leading-normal mb-4">ID: {data.data.id}</h2>

		<RoleBadges profile={data.data} />

		<h3 class="py-8">
			<p class="text-orange-400">THIS IS NOT IN USE YET BUT WILL BE SOON!</p>

			If you want you can change your email/password already anyway. This will be used to login
			without discord in the future.
		</h3>

		<form class="form my-6 w-full" on:submit|preventDefault={updateAccount}>
			<div class="flex flex-col text-sm mb-2">
				<label for="email" class="font-bold mb-2"> Email: </label>
				<input
					type="text"
					name="email"
					class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={email}
				/>
			</div>
			<div class="flex flex-col text-sm mb-2">
				<label for="password" class="font-bold mb-2"> Password: </label>

				<input
					autocomplete="false"
					type="password"
					name="password"
					class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
                border-orange-200 focus:border-orange-600 text-black"
					bind:value={password}
				/>
			</div>

			<button
				type="submit"
				class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
			>
				<span class="px-2">Update</span>
			</button>
		</form>

		{#if emailUpdated}
			Email was updated. You've received on both emails an email from noreply@mail.app.supabase.io
			to confirm the change.
		{/if}
		{#if passUpdated}
			Your password was updated.
		{/if}

		
		<form class="form my-6 w-full" on:submit|preventDefault={updateIpList}>
			<h3>IP Addresses:</h3>

			{#await ipList}
				Loading...
			{:then ipList}
			<p>Your account has {ipList.length}/{data.data.unlocked_ips} ip addresses.</p>
			{/await}

			<div class="flex flex-col text-sm my-6">
				<label for="clientAddress" class="font-bold mb-2">
					Add IP Address
					{#if clientAddress === data.clientAddress}
						(Current IP)
					{/if}
					:
				</label>
				<input type="text" name="clientAddress"
					class="p-2 rounded-lg appearance-none shadow-sm border-2 focus:outline-none
						 border-orange-200 focus:border-orange-600 text-black"
					bind:value={clientAddress}
				>
			</div>
						
			{#await ipList}
				Loading...
			{:then ipList}
				<div class="w-full bg-white rounded-lg shadow-lg appearance-none border-2 border-orange-200">
					<ul class="divide-y-2 rounded-lg divide-orange-100">
						{#each ipList as ipEntry}
						<li class="flex justify-between p-3 hover:bg-orange-500 hover:text-orange-100 group">
							{ipEntry.ip}
							<svg class="hidden group-hover:block" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
								viewBox="0 0 443 443" width="22" height="22" xml:space="preserve">
									<path d="M321.785,38h-83.384V0H125.169v38H41.785v60h280V38z M155.169,30h53.232v8h-53.232V30z"/>
									<path d="M295.142,214.31l5.66-86.31H62.769l19.016,290h114.172c-14.861-21.067-23.602-46.746-23.602-74.43
										C172.355,274.43,226.849,217.779,295.142,214.31z"/>
									<path d="M301.785,244.141c-54.826,0-99.43,44.604-99.43,99.429S246.959,443,301.785,443s99.43-44.604,99.43-99.43
										S356.611,244.141,301.785,244.141z M355.961,376.533l-21.213,21.213l-32.963-32.963l-32.963,32.963l-21.213-21.213l32.963-32.963
										l-32.963-32.963l21.213-21.213l32.963,32.963l32.963-32.963l21.213,21.213l-32.963,32.963L355.961,376.533z"/>
							</svg>
						</li>
						{/each}					
					</ul>
				</div>
			{/await}
			<button
				type="submit"
				class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
					justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
			>
				<span class="px-2">Update</span>
			</button>
		</form>
		
	</div>
{/if}
