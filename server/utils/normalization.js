
export function normalizeDepartment(val) {
  if (!val) return null;
  const s = String(val).toLowerCase().trim();
  if (/(information\s+technology|it\s+department|it)/.test(s)) return 'it';
  if (/(computer\s+science(and\s+engineering)?|cse|cs)/.test(s)) return 'cse';
  if (/(electronics\s+and\s+communication|ece)/.test(s)) return 'ece';
  if (/(electrical\s+and\s+electronics|eee)/.test(s)) return 'eee';
  if (/(mechanical|mech)/.test(s)) return 'mech';
  if (/(civil)/.test(s)) return 'civil';
  return null;
}

export function normalizeYear(val) {
  if (!val) return null;
  const s = String(val).toLowerCase().trim();
  if (/(year\s+1|1st\s+year|first\s+year|i\s+year|1)/.test(s)) return '1';
  if (/(year\s+2|2nd\s+year|second\s+year|ii\s+year|2)/.test(s)) return '2';
  if (/(year\s+3|3rd\s+year|third\s+year|iii\s+year|3)/.test(s)) return '3';
  if (/(year\s+4|4th\s+year|fourth\s+year|iv\s+year|4)/.test(s)) return '4';
  return null;
}

export function normalizeSemester(val) {
    if (!val) return null;
    const s = String(val).toLowerCase().trim();
    if (/(semester\s+1|sem\s+1|i|1)/.test(s)) return '1';
    if (/(semester\s+2|sem\s+2|ii|2)/.test(s)) return '2';
    if (/(semester\s+3|sem\s+3|iii|3)/.test(s)) return '3';
    if (/(semester\s+4|sem\s+4|iv|4)/.test(s)) return '4';
    if (/(semester\s+5|sem\s+5|v|5)/.test(s)) return '5';
    if (/(semester\s+6|sem\s+6|vi|6)/.test(s)) return '6';
    if (/(semester\s+7|sem\s+7|vii|7)/.test(s)) return '7';
    if (/(semester\s+8|sem\s+8|viii|8)/.test(s)) return '8';
    return null;
}

export function parseR2StoragePath(storagePath) {
    if (!storagePath) return { department: "", year: "", semester: "" };
    const parts = storagePath.split('/');
    if (parts.length >= 4) {
        return { department: parts[1], year: parts[2], semester: parts[3] };
    }
    return { department: "", year: "", semester: "" };
}
