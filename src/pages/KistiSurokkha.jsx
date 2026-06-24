import { useState, useEffect, useMemo, useRef } from 'react'
import './KistiSurokkha.css'
import ScreenshotButton from '../components/ScreenshotButton'
import {
  parseKistiCSV,
  extractKistiUpdateDate,
  sumColumn,
  formatNumber,
  calculatePercentage
} from '../utils/dataUtils'

const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTg-7COh4OQ4p3Ph1qdGWqEYVuErRRaKX5aDbHM_1wtv8dBeHIR2X_cFMBAHeFmKDV2-AyhxjuhhhHJ/pub?output=csv'

const METRIC_KEYS = {
  acCreated: 'No. of A/C Created',
  imgUploaded: 'No. of Image Uploaded',
  cardPrinted: 'No. of Card Printed',
  notPrinted: 'Card Not printed',
  delivered: 'No. of Card Delivered',
  delPending: 'Delivery Pending',
  imgPending: 'Image Upload Pending'
}

function RateBar({ pct }) {
  return (
    <div className="rate-wrap">
      <div className="rate-bar">
        <div className="rate-fill" style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="rate-text">{pct}%</span>
    </div>
  )
}

function KistiSurokkha() {
  const [allRows, setAllRows] = useState([])
  const [areas, setAreas] = useState([])
  const [selectedArea, setSelectedArea] = useState(null)
  const [updateDate, setUpdateDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: null, dir: 'desc' })
  const dashboardRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(CSV_URL)
      const text = await res.text()
      const rows = parseKistiCSV(text)
      const date = extractKistiUpdateDate(rows)
      setAllRows(rows)
      setUpdateDate(date)

      // Build unique areas (preserving first-seen order)
      const seen = new Set()
      const uniqueAreas = []
      for (const r of rows) {
        const a = r['Area']
        if (a && !seen.has(a)) {
          seen.add(a)
          uniqueAreas.push({ name: a, division: r['Division'] })
        }
      }
      setAreas(uniqueAreas)
      const tangailArea = uniqueAreas.find(a => a.name === 'Tangail Area')
      if (tangailArea) {
        setSelectedArea(tangailArea.name)
      } else if (uniqueAreas.length > 0) {
        setSelectedArea(uniqueAreas[0].name)
      }
    } catch (err) {
      setError('Failed to load data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedDivision = useMemo(() => {
    if (!selectedArea) return null
    return areas.find(a => a.name === selectedArea)?.division || null
  }, [selectedArea, areas])

  const areaRows = useMemo(() => {
    if (!selectedArea) return []
    return allRows.filter(r => r['Area'] === selectedArea)
  }, [allRows, selectedArea])

  const kpis = useMemo(() => {
    const acCreated = sumColumn(areaRows, METRIC_KEYS.acCreated)
    const cardPrinted = sumColumn(areaRows, METRIC_KEYS.cardPrinted)
    const delivered = sumColumn(areaRows, METRIC_KEYS.delivered)
    const delPending = sumColumn(areaRows, METRIC_KEYS.delPending)
    const imgPending = sumColumn(areaRows, METRIC_KEYS.imgPending)
    return {
      acCreated,
      plazas: areaRows.length,
      cardPrinted,
      printedPct: calculatePercentage(acCreated, cardPrinted),
      delivered,
      deliveredPct: calculatePercentage(cardPrinted, delivered),
      delPending,
      delPendingPct: cardPrinted ? Math.round((delPending / cardPrinted) * 100) : 0,
      imgPending
    }
  }, [areaRows])

  const displayedRows = useMemo(() => {
    const term = search.trim().toLowerCase()
    let rows = areaRows
    if (term) {
      rows = rows.filter(r =>
        String(r['WP'] || '').toLowerCase().includes(term)
      )
    }
    if (sort.key) {
      const num = r => Number(String(r[sort.key] || '0').replace(/,/g, '')) || 0
      rows = [...rows].sort((a, b) => {
        const av = num(a)
        const bv = num(b)
        return sort.dir === 'asc' ? av - bv : bv - av
      })
    }
    return rows
  }, [areaRows, search, sort])

  const toggleSort = (key) => {
    setSort(prev =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    )
  }

  const sortIndicator = (key) => {
    if (sort.key !== key) return '↕'
    return sort.dir === 'asc' ? '↑' : '↓'
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading Kisti Surokkha data...
      </div>
    )
  }
  if (error) return <div className="error">{error}</div>

  return (
    <>
      {updateDate && (
        <div className="update-date-banner">
          <span className="update-icon">📅</span>
          <span className="update-text">Last Update: <strong>{updateDate}</strong></span>
        </div>
      )}

      <div ref={dashboardRef} className="kisti-page">
        <div className="kisti-shell">
          {/* ===== Sidebar (areas) ===== */}
          <aside className="kisti-sidebar">
            <div className="kisti-side-head">
              <h2>Select Area</h2>
              <div className="kisti-side-sub">{areas.length} areas</div>
            </div>
            <div className="kisti-area-list">
              {areas.map(a => (
                <button
                  key={a.name}
                  className={`kisti-area-item ${selectedArea === a.name ? 'active' : ''}`}
                  onClick={() => setSelectedArea(a.name)}
                >
                  <div className="kisti-area-name">{a.name}</div>
                  <div className="kisti-area-meta">{a.division}</div>
                </button>
              ))}
            </div>
          </aside>

          {/* ===== Main panel ===== */}
          <main className="kisti-main">
            <div className="kisti-page-header">
              <div className="kisti-page-title">
                <h1>{selectedArea ? `${selectedArea} — Card Status Dashboard` : 'Kisti Surokkha — Card Status Dashboard'}</h1>
                <div className="kisti-page-sub">A/C Created · Printed · Delivered — plaza-wise</div>
              </div>
              <div className="kisti-header-badges">
                {selectedDivision && (
                  <span className="kisti-badge kisti-badge-div">{selectedDivision}</span>
                )}
                {updateDate && (
                  <span className="kisti-badge kisti-badge-date">Last Update: {updateDate}</span>
                )}
              </div>
            </div>

            {/* KPIs */}
            <div className="kisti-kpi-row">
              <div className="kisti-kpi kisti-kpi-orange">
                <div className="kisti-kpi-label">TOTAL A/C CREATED</div>
                <div className="kisti-kpi-value">{formatNumber(kpis.acCreated)}</div>
                <div className="kisti-kpi-sub">{kpis.plazas} Plazas</div>
              </div>
              <div className="kisti-kpi kisti-kpi-green">
                <div className="kisti-kpi-label">CARDS PRINTED</div>
                <div className="kisti-kpi-value">{formatNumber(kpis.cardPrinted)}</div>
                <div className="kisti-kpi-sub">{kpis.printedPct}% of A/C</div>
              </div>
              <div className="kisti-kpi kisti-kpi-blue">
                <div className="kisti-kpi-label">CARDS DELIVERED</div>
                <div className="kisti-kpi-value">{formatNumber(kpis.delivered)}</div>
                <div className="kisti-kpi-sub">{kpis.deliveredPct}% of printed</div>
              </div>
              <div className="kisti-kpi kisti-kpi-amber">
                <div className="kisti-kpi-label">DELIVERY PENDING</div>
                <div className="kisti-kpi-value">{formatNumber(kpis.delPending)}</div>
                <div className="kisti-kpi-sub">{kpis.delPendingPct}% of printed · not delivered</div>
              </div>
              <div className="kisti-kpi kisti-kpi-red">
                <div className="kisti-kpi-label">IMAGE PENDING</div>
                <div className="kisti-kpi-value">{formatNumber(kpis.imgPending)}</div>
                <div className="kisti-kpi-sub">Upload pending</div>
              </div>
            </div>

            {/* Plaza-wise table */}
            <div className="kisti-table-card">
              <div className="kisti-table-head">
                <div>
                  <h3>Plaza-wise Detail</h3>
                  <span className="kisti-pill-count">{displayedRows.length} plaza</span>
                </div>
                <div className="kisti-search">
                  <span className="kisti-search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search plaza..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="kisti-table-scroll">
                <table className="kisti-table">
                  <thead>
                    <tr>
                      <th className="th-plaza" onClick={() => toggleSort('WP')}>
                        PLAZA {sortIndicator('WP')}
                      </th>
                      <th onClick={() => toggleSort(METRIC_KEYS.acCreated)}>
                        A/C CREATED {sortIndicator(METRIC_KEYS.acCreated)}
                      </th>
                      <th onClick={() => toggleSort(METRIC_KEYS.imgUploaded)}>
                        IMG UPLOADED {sortIndicator(METRIC_KEYS.imgUploaded)}
                      </th>
                      <th onClick={() => toggleSort(METRIC_KEYS.cardPrinted)}>
                        CARD PRINTED {sortIndicator(METRIC_KEYS.cardPrinted)}
                      </th>
                      <th onClick={() => toggleSort(METRIC_KEYS.notPrinted)}>
                        NOT PRINTED {sortIndicator(METRIC_KEYS.notPrinted)}
                      </th>
                      <th onClick={() => toggleSort(METRIC_KEYS.delivered)}>
                        DELIVERED {sortIndicator(METRIC_KEYS.delivered)}
                      </th>
                      <th className="th-pending" onClick={() => toggleSort(METRIC_KEYS.delPending)}>
                        DEL. PENDING {sortIndicator(METRIC_KEYS.delPending)}
                      </th>
                      <th className="th-pending" onClick={() => toggleSort(METRIC_KEYS.imgPending)}>
                        IMG PENDING {sortIndicator(METRIC_KEYS.imgPending)}
                      </th>
                      <th>DELIVERY RATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedRows.length === 0 && (
                      <tr>
                        <td colSpan="9" className="kisti-empty">No plazas match the search.</td>
                      </tr>
                    )}
                    {displayedRows.map((r, idx) => {
                      const acCreated = Number(String(r[METRIC_KEYS.acCreated] || '0').replace(/,/g, '')) || 0
                      const cardPrinted = Number(String(r[METRIC_KEYS.cardPrinted] || '0').replace(/,/g, '')) || 0
                      const delivered = Number(String(r[METRIC_KEYS.delivered] || '0').replace(/,/g, '')) || 0
                      const delPending = Number(String(r[METRIC_KEYS.delPending] || '0').replace(/,/g, '')) || 0
                      const imgPending = Number(String(r[METRIC_KEYS.imgPending] || '0').replace(/,/g, '')) || 0
                      const delRate = cardPrinted ? Math.round((delivered / cardPrinted) * 100) : 0
                      const pendingPct = cardPrinted ? Math.round((delPending / cardPrinted) * 100) : 0
                      const imgPct = acCreated ? Math.round((imgPending / acCreated) * 100) : 0
                      return (
                        <tr key={idx}>
                          <td className="td-plaza">
                            <span className="rank-num">{idx + 1}</span>
                            <span className="plaza-name">{r['WP']}</span>
                          </td>
                          <td>{formatNumber(acCreated)}</td>
                          <td>{formatNumber(r[METRIC_KEYS.imgUploaded])}</td>
                          <td>{formatNumber(cardPrinted)}</td>
                          <td className={Number(String(r[METRIC_KEYS.notPrinted] || '0').replace(/,/g, '')) > 0 ? 'cell-warn' : ''}>
                            {r[METRIC_KEYS.notPrinted] ? formatNumber(r[METRIC_KEYS.notPrinted]) : '—'}
                          </td>
                          <td className="cell-good">{formatNumber(delivered)}</td>
                          <td>
                            {delPending > 0 ? (
                              <span className="plaza-pill pending-pill">
                                <span className="pill-icon">⏱</span>
                                {formatNumber(delPending)}
                                <span className="pill-pct">{pendingPct}% of printed</span>
                              </span>
                            ) : (
                              <span className="plaza-pill neutral-pill">
                                <span className="pill-icon">✓</span>
                                {formatNumber(delPending)}
                                <span className="pill-pct">{pendingPct}% of printed</span>
                              </span>
                            )}
                          </td>
                          <td>
                            {imgPending > 0 ? (
                              <span className="plaza-pill pending-pill">
                                <span className="pill-icon">⏱</span>
                                {formatNumber(imgPending)}
                                <span className="pill-pct">{imgPct}% of A/C</span>
                              </span>
                            ) : (
                              <span className="plaza-pill neutral-pill">
                                <span className="pill-icon">✓</span>
                                {formatNumber(imgPending)}
                                <span className="pill-pct">{imgPct}% of A/C</span>
                              </span>
                            )}
                          </td>
                          <td className="td-rate">
                            <RateBar pct={delRate} />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>

      {!loading && !error && (
        <ScreenshotButton
          targetRef={dashboardRef}
          fileName={`kisti-surokkha-${(selectedArea || 'all').replace(/\s+/g, '-')}`}
        />
      )}
    </>
  )
}

export default KistiSurokkha
