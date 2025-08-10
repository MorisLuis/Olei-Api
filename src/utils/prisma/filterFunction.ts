import type { FilterPrisma } from "./types";

interface FilterObject {
    [key: string]: string | number;
}

interface BuildFiltersResponse {
    AND?: FilterObject[];
}

export function buildFilters(filters: FilterPrisma[]): BuildFiltersResponse | {} {
    const andConditions = filters.map(({ field, value }) => {
        if (field.includes('.')) {
            const [relation, relField] = field.split('.');
            if (!isNaN(Number(value))) {
                return {
                    [relation]: {
                        [relField]: Number(value),
                    },
                };
            }
            return {
                [relation]: {
                    [relField]: {
                        contains: value
                    },
                },
            };
        } else {
            if (!isNaN(Number(value))) {
                return { [field]: Number(value) };
            }
            return {
                [field]: {
                    contains: value
                },
            };
        }
    }).filter(cond => Object.keys(cond).length > 0);

    return andConditions.length > 0 ? { AND: andConditions } : {};
}
