import { writable } from "svelte/store"

export interface SearchStoreModel<T extends Record<PropertyKey, any>> {
	data: T[]
	filtered: T[]
	search: string
	filters?: string[] | number[]
}

export const createSearchStore = <T extends Record<PropertyKey, any>>(data: T[]) => {
	const { subscribe, set, update } = writable<SearchStoreModel<T>>({
		data: data,
		filtered: data,
		search: ""
	})

	return {
		subscribe,
		set,
		update
	}
}

export const searchHandler = <T extends Record<PropertyKey, any>>(store: SearchStoreModel<T>) => {
	const searchTerm = store.search.toLowerCase() || ""

	let enabledFilters: string[] | number[] = []
	if (store.filters != null) enabledFilters = store.filters

	if (enabledFilters.length > 0) {
		let isStr = typeof enabledFilters[0] === "string"
		store.filtered = store.data.filter((item) => {
			for (let i = 0; i < enabledFilters.length; i++) {
				if (isStr) enabledFilters[i] = enabledFilters[i].toString().toLowerCase()
				if (item.filters.toLowerCase().includes(enabledFilters[i])) return true
			}
		})
	}

	if (enabledFilters.length > 0) {
		store.filtered = store.filtered.filter((item) => {
			return item.searchTerms.toLowerCase().includes(searchTerm)
		})
	} else {
		store.filtered = store.data.filter((item) => {
			return item.searchTerms.toLowerCase().includes(searchTerm)
		})
	}
}
