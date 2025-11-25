interface Totals {
	show: number
	total: number
}

interface Pages {
	current: number
	totalPages: number
	next?: number | null
	previous?: number | null
}

export interface InfoSuccessResponse {
	totals: Totals
	pages: Pages
}