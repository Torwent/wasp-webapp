<script>
	export let gallery = []

	let index = 1

	const handleControls = (next) => {
		if (next) {
			index++
		} else {
			index--
		}

		if (index < 1) {
			index = gallery.length
		} else if (index > gallery.length) {
			index = 1
		}
		console.log(index)
	}
</script>

<div id="indicators-carousel" class="rounded-md h-96  relative" data-carousel="static">
	<!-- Carousel wrapper -->
	<div class="overflow-hidden relative h-48 rounded-lg sm:h-64 xl:h-80 2xl:h-96">
		<!-- Item 1 -->
		<div class="hidden duration-700 ease-in-out" data-carousel-item="active">
			<img
				src="/docs/images/carousel/carousel-1.svg"
				class="block absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
				alt="..."
			/>
		</div>
		<!-- Item 2 -->
		<div class="hidden duration-700 ease-in-out" data-carousel-item>
			<img
				src="/docs/images/carousel/carousel-2.svg"
				class="block absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2"
				alt="..."
			/>
		</div>
	</div>
	<!-- Slider indicators -->
	<div class="flex absolute bottom-5 left-1/2 z-30 space-x-3 -translate-x-1/2">
		<button
			type="button"
			class="w-3 h-3 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
			aria-current="true"
			aria-label="Slide 1"
			data-carousel-slide-to="0"
		/>
		<button
			type="button"
			class="w-3 h-3 rounded-full bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800"
			aria-current="false"
			aria-label="Slide 2"
			data-carousel-slide-to="1"
		/>
	</div>
	<!-- Slider controls -->
	<button
		type="button"
		class="flex absolute top-0 left-0 z-30 justify-center items-center px-4 h-full cursor-pointer group focus:outline-none"
		on:click={() => handleControls(false)}
	>
		<span
			class="inline-flex justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
		>
			<svg
				class="w-5 h-5 text-white sm:w-6 sm:h-6 dark:text-gray-800"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M15 19l-7-7 7-7"
				/></svg
			>
			<span class="hidden">Previous</span>
		</span>
	</button>
	<button
		type="button"
		class="flex absolute top-0 right-0 z-30 justify-center items-center px-4 h-full cursor-pointer group focus:outline-none"
		on:click={() => handleControls(true)}
	>
		<span
			class="inline-flex justify-center items-center w-8 h-8 rounded-full sm:w-10 sm:h-10 bg-white/30 dark:bg-gray-800/30 group-hover:bg-white/50 dark:group-hover:bg-gray-800/60 group-focus:ring-4 group-focus:ring-white dark:group-focus:ring-gray-800/70 group-focus:outline-none"
		>
			<svg
				class="w-5 h-5 text-white sm:w-6 sm:h-6 dark:text-gray-800"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
				><path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 5l7 7-7 7"
				/></svg
			>
			<span class="hidden">Next</span>
		</span>
	</button>
</div>
