<script>
	import { questions, commonErrors } from "../../stores/questionStore"
	import DropDown from "../../components/DropDown.svelte"
</script>

<div class="pb-16">
	<DropDown title="FAQ" entries={questions} />
	<DropDown title="Common Errors" entries={commonErrors} />
</div>
