import type { FilterPrisma } from "./types";

interface FilterObject {
    [key: string]: string | number | Record<string, unknown>;
}


export type BuildFiltersResponse = {
    AND?: FilterObject[];
    OR?: FilterObject[];
};

export function buildFilters(filters: FilterPrisma[]): BuildFiltersResponse {
    const andConditions = filters
        .map(({ field, value }) => {
            if (field.includes('.')) {
                const [relation, relField] = field.split('.');
                return isNaN(Number(value))
                    ? { [relation]: { [relField]: { contains: value } } }
                    : { [relation]: { [relField]: Number(value) } };
            } else {
                return isNaN(Number(value))
                    ? { [field]: { contains: value } }
                    : { [field]: Number(value) };
            }
        })
        .filter(cond => Object.keys(cond).length > 0);

    return { AND: andConditions };
}