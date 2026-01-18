export type Operator = '=' | '!=' | '>' | '>=' | '<' | '<=';

export type WhereConditions<T> = Record<
    keyof T,
    string | number | [Operator, string | number]
>;

export type WhereInConditions = Record<string, (string | number)[]>;

function buildWhereParam<T>(
    where?: WhereConditions<T>,
    whereIn?: WhereInConditions
): string | undefined {
    const clauses: string[] = [];

    if (where) {
        Object.entries(where).forEach(([field, value]) => {
            if (Array.isArray(value)) {
                const [operator, actualValue] = value;
                clauses.push(`${field}${operator}${actualValue}`);
            } else {
                clauses.push(`${field}=${value}`);
            }
        });
    }

    if (whereIn) {
        Object.entries(whereIn).forEach(([field, values]) => {
            clauses.push(`${field}:${values.join('|')}`);
        });
    }

    return clauses.length ? clauses.join(',') : undefined;
}


export default buildWhereParam;