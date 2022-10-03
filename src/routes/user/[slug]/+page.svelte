<script lang="ts">
	import { fade } from "svelte/transition"
	import RoleBadges from "$lib/components/RoleBadges.svelte"
	import { supabase } from "$lib/database/supabase"
	import { user } from "$lib/stores/authStore"
	import type { Profile } from "$lib/database/types"
	import { validateEmail, validateIp } from "$lib/utils"
	export let data: { data: Profile; clientAddress: string }

	let email: string = ""
	let password: string = ""

	let emailUpdated = false,
		passUpdated = false,
		clientAddress = data.clientAddress

	const supabaseUser = $user

	if (supabaseUser != null && supabaseUser.email != null) email = supabaseUser.email

	const updateAccount = async () => {
		let obj: { email?: string; password?: string } = {}

		if (validateEmail(email)) {
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
		const { data, error } = await supabase.from("ip_whitelist").select("ip").eq("user", user)

		if (error) return console.error(error)

		let result: string[] = []
		data.forEach((ip) => result.push(ip.ip))

		return result
	}

	const ipList = loadIpList(data.data.id) as unknown as string[]

	const insertAddress = async () => {
		if (ipList.length === 0) return
		if (data.data.unlocked_ips >= ipList.length) return
		if (!validateIp(clientAddress)) return

		const { error } = await supabase
			.from("ip_whitelist")
			.insert({ user: data.data.id, ip: clientAddress })

		if (error) return console.error(error)
		location.reload()
	}

	const updateAddress = async (i: number) => {
		if (ipList.length === 0) return
		if (!validateIp(clientAddress)) return

		const { error } = await supabase
			.from("ip_whitelist")
			.update({ ip: clientAddress })
			.match({ user: data.data.id, ip: ipList[i] })

		if (error) return console.error(error)
		location.reload()
	}

	const deleteAddress = async (i: number) => {
		console.log(i, " ip deleted")
	}
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

		<div class="form my-6 w-full">
			<h3>IP Addresses:</h3>

			{#await ipList}
				Loading...
			{:then ipList}
				<p class="py-4">Your account has {ipList.length}/{data.data.unlocked_ips} ip addresses.</p>

				<div
					class="w-full bg-white rounded-lg shadow-lg appearance-none border-2 border-orange-200"
				>
					<ul class="divide-y-2 rounded-lg divide-orange-100 overflow-y-auto h-52">
						{#if !ipList.includes(clientAddress)}
							<li
								class="h-10 flex w-full justify-around rounded-md shadow-sm border-2 focus-within:outline-none border-orange-200 focus-within:border-orange-600 text-stone-500 bg-white"
							>
								<input
									type="text"
									name="clientAddress"
									class="mx-4 w-full appearance-none border-0 outline-none"
									value={clientAddress}
								/>

								<button
									class="mx-2 w-28 text-stone-500 hover:text-orange-400 bg-white text-xs font-semibold leading-tight transition duration-150 ease-in-out flex items-center justify-between"
									on:click={async () => await insertAddress()}
								>
									Add Current IP
								</button>
							</li>
						{/if}
						{#each Array(data.data.unlocked_ips) as _, i}
							{#if ipList[i] != null}
								<li
									class="h-10 flex w-full justify-around rounded-md shadow-sm border-2 focus-within:outline-none border-orange-200 focus-within:border-orange-600 text-stone-500 bg-white"
								>
									<input
										type="text"
										name="clientAddress"
										class="mx-4 w-full appearance-none border-0 outline-none"
										class:text-orange-400={ipList[i] === clientAddress}
										value={ipList[i]}
									/>

									<button
										class="mx-2 text-stone-500 hover:text-orange-400 bg-white text-xs font-semibold leading-tight transition duration-150 ease-in-out flex items-center justify-between"
										on:click={async () => await deleteAddress(i)}
									>
										Delete
									</button>
									<button
										class="mx-2 text-stone-500 hover:text-orange-400 bg-white text-xs font-semibold leading-tight transition duration-150 ease-in-out flex items-center justify-between"
										on:click={async () => await updateAddress(i)}
									>
										Update
									</button>
								</li>
							{:else}
								<li
									class="h-10 flex w-full justify-around rounded-md shadow-sm border-2 focus-within:outline-none border-orange-200 focus-within:border-orange-600 text-stone-500 bg-white"
								>
									<input
										type="text"
										name="clientAddress"
										class="mx-4 w-full appearance-none border-0 outline-none"
										value=""
									/>

									<button
										class="mx-2 text-stone-500 hover:text-orange-400 bg-white text-xs font-semibold leading-tight transition duration-150 ease-in-out flex items-center justify-between"
										on:click={async () => await insertAddress()}
									>
										Add
									</button>
								</li>
							{/if}
						{/each}
					</ul>
				</div>
			{/await}
		</div>
	</div>
{/if}
