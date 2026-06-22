
export const normalizeDepartment = (value: unknown): string | null => {
    if (!value || typeof value !== 'string') return null;
    const v = value.toLowerCase().trim();
    if (v.includes('it') || v.includes('information technology') || v.includes('csit')) return 'it';
    if (v.includes('cse') || v.includes('computer science')) return 'cse';
    if (v.includes('ece') || v.includes('electronics and communication')) return 'ece';
    if (v.includes('eee') || v.includes('electrical and electronics')) return 'eee';
    if (v.includes('mech') || v.includes('mechanical')) return 'mech';
    if (v.includes('civil')) return 'civil';
    return null;
};

export const normalizeYear = (value: unknown): string | null => {
    if (!value || typeof value !== 'string') return null;
    const v = value.toUpperCase().trim().replace(/YEAR/g, '').trim();
    if (['1', 'I'].includes(v)) return '1';
    if (['2', 'II'].includes(v)) return '2';
    if (['3', 'III'].includes(v)) return '3';
    if (['4', 'IV'].includes(v)) return '4';
    return null;
};

export const normalizeSemester = (value: unknown): string | null => {
    if (!value || typeof value !== 'string') return null;
    const v = value.toUpperCase().trim().replace(/SEMESTER/g, '').replace(/SEM/g, '').trim();
    const map: Record<string, string> = {
        '1': '1', 'I': '1',
        '2': '2', 'II': '2',
        '3': '3', 'III': '3',
        '4': '4', 'IV': '4',
        '5': '5', 'V': '5',
        '6': '6', 'VI': '6',
        '7': '7', 'VII': '7',
        '8': '8', 'VIII': '8'
    };
    return map[v] || null;
};

export const getEffectiveDepartment = (record: any): string | null => {
    return record.norm_department || normalizeDepartment(record.department);
};

export const getEffectiveYear = (record: any): string | null => {
    return record.norm_year || normalizeYear(record.year);
};

export const getEffectiveSemester = (record: any): string | null => {
    return record.norm_semester || normalizeSemester(record.semester);
};
