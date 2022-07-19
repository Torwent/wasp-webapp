<script>
	import { getSignedURL } from "$lib/supabaseStorage.js"
	export let premium
	export let script_name
	export let text

	let path
	let url

	if (premium) {
		path = "premium/"
	} else {
		path = "free/"
	}

	let download = () => {
		getSignedURL("scripts", path, script_name).then((value) => {
			url = value
			fetch(url)
				.then((resp) => resp.blob())
				.then((blobobject) => {
					const blob = window.URL.createObjectURL(blobobject)
					const anchor = document.createElement("a")
					anchor.style.display = "none"
					anchor.href = blob
					anchor.download = script_name
					document.body.appendChild(anchor)
					anchor.click()
					window.URL.revokeObjectURL(blob)
				})
				.catch(() => console.log("An error occured while downloading the file, sorry!"))
		})
	}
</script>

<form on:submit|preventDefault={download} class="flex justify-center">
	<button
		type="submit"
		data-mdb-ripple="true"
		data-mdb-ripple-color="light"
		class="px-6 py-2.5 text-white text-xs font-semibold leading-tight uppercase rounded shadow-md hover:shadow-lg active:shadow-lg transition duration-150 ease-in-out flex items-center
		justify-between bg-orange-500 hover:bg-orange-600 dark:bg-orange-400 dark:hover:bg-orange-500 my-2"
	>
		<span>{text}</span>
		<svg
			class="-mr-1 ml-2 h-5 w-5 rotate-180 animate-bounce"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 20 20"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				fill-rule="evenodd"
				d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
				clip-rule="evenodd"
			/>
		</svg>
	</button>
</form>
