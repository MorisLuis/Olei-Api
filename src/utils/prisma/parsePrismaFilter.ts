import type { FilterPrisma } from "./types";



export const parsePrismaFilter = (filterField?: string, filterValue?: string): FilterPrisma[] => {

    let filters: FilterPrisma[] = [];

    if (filterField && filterValue) {
        const fields = filterField.split(',').map(f => f.trim());
        const values = filterValue.split(',').map(v => v.trim());

        filters = fields.map((field, idx) => ({
            field,
            value: values[idx] || ''
        }));
    }

    return filters
}