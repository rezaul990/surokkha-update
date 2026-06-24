// Normalize a header (collapse newlines/whitespace, trim)
function normalizeHeader(h) {
  return String(h || '').replace(/\s+/g, ' ').trim()
}

// Parse the Kisti Surokkha CSV (plaza-level data with multi-line quoted headers)
export function parseKistiCSV(text) {
  // Properly parse CSV honoring multi-line quoted fields
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]

    if (inQuotes) {
      if (ch === '"') {
        // Check for escaped quote ("")
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
    } else {
      if (ch === '"') {
        inQuotes = true
      } else if (ch === ',') {
        row.push(field)
        field = ''
      } else if (ch === '\n' || ch === '\r') {
        // End of record (handle \r\n)
        if (ch === '\r' && text[i + 1] === '\n') i++
        row.push(field)
        field = ''
        if (row.some(v => v !== '')) rows.push(row)
        row = []
      } else {
        field += ch
      }
    }
  }
  // Flush last field/row
  if (field !== '' || row.length > 0) {
    row.push(field)
    if (row.some(v => v !== '')) rows.push(row)
  }

  if (rows.length === 0) return []

  const headers = rows[0].map(normalizeHeader)

  return rows.slice(1)
    .map(values => {
      const obj = {}
      headers.forEach((header, i) => {
        obj[header] = (values[i] || '').trim()
      })
      return obj
    })
    .filter(row => row['WP'] || row['Walton Plaza'])
}

// Extract the most recent non-empty "Last Update Date" value from a parsed dataset
export function extractKistiUpdateDate(rows) {
  for (const row of rows) {
    const d = row['Last Update Date']
    if (d) return d
  }
  return null
}

// Sum a numeric column across rows (handles comma-formatted numbers)
export function sumColumn(rows, key) {
  return rows.reduce((sum, row) => {
    const raw = String(row[key] || '0').replace(/,/g, '').trim()
    const n = Number(raw)
    return sum + (Number.isFinite(n) ? n : 0)
  }, 0)
}

export function formatNumber(value) {
  const cleaned = String(value || 0).replace(/,/g, '')
  return Number(cleaned || 0).toLocaleString('en-IN')
}

export function calculatePercentage(target, achievement) {
  const t = Number(String(target || 0).replace(/,/g, ''))
  const a = Number(String(achievement || 0).replace(/,/g, ''))
  return t ? Math.round((a / t) * 100) : 0
}
