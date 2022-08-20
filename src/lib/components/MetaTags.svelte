<script lang="ts">
	export let type: string = "website"
	export let title: string
	export let description: string
	export let url: string = ""
	export let img: string =
		"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/logo.png"
</script>

<!-- SEO tags -->
<title>
	{#if title === ""}
		WaspScripts
	{:else}
		{title} - WaspScripts
	{/if}</title
>
<meta name="description" content={description} />

<!-- OpenGraph tags -->
<meta property="og:type" content={type} />
{#if title === ""}
	<meta property="og:title" content="WaspScripts" />
{:else}
	<meta property="og:title" content={title} />
{/if}
<meta property="og:url" content={"https://waspscripts.com" + url} />
<meta property="og:image" content={img} />
<meta property="og:description" content={description} />

<!-- Twitter tags -->
<meta name="twitter:card" content="summary" />
{#if title === ""}
	<meta name="twitter:title" content="WaspScripts" />
{:else}
	<meta name="twitter:title" content="{title} - WaspScripts" />
{/if}
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={img} />
