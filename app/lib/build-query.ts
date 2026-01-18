function buildQuery(path: string, params?: Record<string, any>) {
    if (!params) return path;

    const search = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            search.set(key, value.join(','));
        } else {
            search.set(key, String(value));
        }
    });

    const qs = search.toString();
    return qs ? `${path}?${qs}` : path;
}

export default buildQuery;