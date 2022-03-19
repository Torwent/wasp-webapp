<script>
	export let script
</script>

<!-- Product Card -->
<div class="flex flex-col shadow-md cursor-pointer hover:-translate-y-1 duration-300 w-72">
	<!-- Preview -->
	<div class="inline relative group h-48">
		<!-- Thumbnail -->
		<img class="absolute rounded-t object-cover h-full w-full" src={script.cover_img} alt="" />

		<!-- Hover Bar -->
		<div
			class="flex flex-row absolute justify-end
                    h-16 w-full bottom-0 px-3 space-x-2
                    bg-none opacity-0 group-hover:opacity-100
                    group-hover:bg-gradient-to-t from-black/20 via-gray-800/20 to-transparent 
                    transition-all ease-in-out duration-200 delay-100"
		>
			<!-- Add to Favorites Button -->
			<button
				class="bg-gray-50/10 rounded-full 
                        px-1 h-9 w-9 my-auto hover:bg-gray-50/20
                        transition-colors duration-200"
			>
				<i
					class="mdi mdi-heart text-xl text-gray-200 p-1
                            hover:text-white transition-all duration-200"
					title="Add to Favorites"
				/>
			</button>
		</div>
	</div>

	<!-- Body -->
	<div class="flex flex-col bg-stone-800 rounded-b p-3">
		<!-- Title -->
		<div class="text-md font-semibold text-gray-900 hover:underline truncate">
			{script.title}
		</div>

		<!-- Author - Category -->
		<div class="text-xxs text-gray-400 truncate mt-1">
			by

			<!-- Author -->
			<a href="/" class="font-semibold hover:underline"> {script.author} </a>
		</div>

		<!-- content -->
		<div class="text-sm text-gray-600 mt-4 mb-1">{script.description}</div>

		<!-- Body -->
		<div class="flex flex-row mt-2">
			<!-- Detail Column -->
			<div class="flex flex-col flex-auto">
				<!-- Rating -->
				<div class="flex flex-row group">
					<i
						class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200"
						title="Worst"
					/>

					<i
						class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200"
						title="Bad"
					/>

					<i
						class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200"
						title="Not Bad"
					/>

					<i
						class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200"
						title="Good"
					/>

					<i
						class="mdi mdi-star text-xs text-amber-400 
                            hover:text-amber-500 transition-all duration-200"
						title="Awesome"
					/>

					<div class="text-xxs text-gray-400 ml-1 hover:underline">({script.likes})</div>
				</div>
			</div>

			<!-- Button Column -->
			<div class="flex flex-row flex-auto justify-end">
				<!-- Preview Link Button -->
				<a
					href="/"
					class="flex text-xs border px-3 my-auto py-2 
                        border-amber-500 group hover:bg-amber-500 
                        rounded-xss
                        transition-all duration-200"
				>
					<!-- Text -->
					<div
						class="text-xxs text-amber-700 font-semibold ml-2
                            group-hover:text-white delay-100"
					>
						More Info
					</div>
				</a>
			</div>
		</div>
	</div>
</div>
