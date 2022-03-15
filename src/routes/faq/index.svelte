<script>
	import { fade } from "svelte/transition"
	import { questions, commonErrors } from "../../stores/questionStore"
	import DropDown from "../../components/DropDown.svelte"
</script>

<div class="pb-16" in:fade={{ duration: 300, delay: 300 }} out:fade={{ duration: 300 }}>
	<DropDown title="FAQ" entries={questions} />
	<DropDown title="Common Errors" entries={commonErrors} />
</div>
