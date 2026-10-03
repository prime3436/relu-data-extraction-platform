// Relu Consultancy Hiring Challenge - Web Application
// Data Presentation & Bonus Challenge Implementation

document.addEventListener('DOMContentLoaded', () => {
  const disneyData = window.DISNEY_DATA || [];
  const ingredientsData = window.INGREDIENTS_DATA || [];

  let currentTab = 'disney';
  let currentView = 'table';
  let currentPage = 1;
  let rowsPerPage = 25;
  let sortColumn = null;
  let sortAsc = true;
  let searchQuery = '';
  let primaryFilter = '';
  let secondaryFilter = '';

  // Elements
  const tabs = document.querySelectorAll('.tab-btn');
  const kpiBar = document.getElementById('kpiBar');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const primaryFilterSelect = document.getElementById('primaryFilterSelect');
  const secondaryFilterSelect = document.getElementById('secondaryFilterSelect');
  const btnTableView = document.getElementById('btnTableView');
  const btnGridView = document.getElementById('btnGridView');
  const tableViewSection = document.getElementById('tableViewSection');
  const gridViewSection = document.getElementById('gridViewSection');
  const insightsViewSection = document.getElementById('insightsViewSection');
  const architectureViewSection = document.getElementById('architectureViewSection');
  const toolbar = document.getElementById('toolbar');
  const paginationFooter = document.getElementById('paginationFooter');
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');
  const recordsCounter = document.getElementById('recordsCounter');
  const rowsPerPageSelect = document.getElementById('rowsPerPageSelect');
  const btnPrevPage = document.getElementById('btnPrevPage');
  const btnNextPage = document.getElementById('btnNextPage');
  const pageIndicator = document.getElementById('pageIndicator');
  const btnDownloadCsv = document.getElementById('btnDownloadCsv');
  const btnExportJson = document.getElementById('btnExportJson');

  // Modal elements
  const detailModal = document.getElementById('detailModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      currentPage = 1;
      searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      primaryFilter = '';
      secondaryFilter = '';
      sortColumn = null;
      sortAsc = true;
      updateUI();
    });
  });

  // View toggle
  btnTableView.addEventListener('click', () => {
    currentView = 'table';
    btnTableView.classList.add('active');
    btnGridView.classList.remove('active');
    tableViewSection.style.display = 'block';
    gridViewSection.style.display = 'none';
    renderContent();
  });

  btnGridView.addEventListener('click', () => {
    currentView = 'grid';
    btnGridView.classList.add('active');
    btnTableView.classList.remove('active');
    tableViewSection.style.display = 'none';
    gridViewSection.style.display = 'grid';
    renderContent();
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim().toLowerCase();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    currentPage = 1;
    renderContent();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    currentPage = 1;
    renderContent();
  });

  // Filters
  primaryFilterSelect.addEventListener('change', (e) => {
    primaryFilter = e.target.value;
    currentPage = 1;
    renderContent();
  });

  secondaryFilterSelect.addEventListener('change', (e) => {
    secondaryFilter = e.target.value;
    currentPage = 1;
    renderContent();
  });

  // Pagination
  rowsPerPageSelect.addEventListener('change', (e) => {
    rowsPerPage = e.target.value === 'all' ? Infinity : parseInt(e.target.value);
    currentPage = 1;
    renderContent();
  });

  btnPrevPage.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderContent();
    }
  });

  btnNextPage.addEventListener('click', () => {
    const totalRecords = getFilteredData().length;
    const maxPages = rowsPerPage === Infinity ? 1 : Math.ceil(totalRecords / rowsPerPage);
    if (currentPage < maxPages) {
      currentPage++;
      renderContent();
    }
  });

  // Export JSON
  btnExportJson.addEventListener('click', () => {
    const data = currentTab === 'disney' ? disneyData : ingredientsData;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTab}_scraped_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Modal close
  modalClose.addEventListener('click', () => {
    detailModal.classList.remove('active');
  });

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.remove('active');
    }
  });

  function updateUI() {
    if (currentTab === 'insights') {
      kpiBar.style.display = 'none';
      toolbar.style.display = 'none';
      tableViewSection.style.display = 'none';
      gridViewSection.style.display = 'none';
      paginationFooter.style.display = 'none';
      architectureViewSection.style.display = 'none';
      insightsViewSection.style.display = 'flex';
      renderInsightsView();
      return;
    }

    if (currentTab === 'architecture') {
      kpiBar.style.display = 'none';
      toolbar.style.display = 'none';
      tableViewSection.style.display = 'none';
      gridViewSection.style.display = 'none';
      paginationFooter.style.display = 'none';
      insightsViewSection.style.display = 'none';
      architectureViewSection.style.display = 'flex';
      renderArchitectureView();
      return;
    }

    // Normal dataset tabs
    kpiBar.style.display = 'grid';
    toolbar.style.display = 'flex';
    paginationFooter.style.display = 'flex';
    insightsViewSection.style.display = 'none';
    architectureViewSection.style.display = 'none';

    if (currentView === 'table') {
      tableViewSection.style.display = 'block';
      gridViewSection.style.display = 'none';
    } else {
      tableViewSection.style.display = 'none';
      gridViewSection.style.display = 'grid';
    }

    // Update download CSV link
    btnDownloadCsv.href = currentTab === 'disney' ? 'disney_cruise_results.csv' : 'ingredients_network_results.csv';
    btnDownloadCsv.setAttribute('download', `${currentTab}_results.csv`);

    populateFilters();
    renderKpis();
    renderContent();
  }

  function populateFilters() {
    if (currentTab === 'disney') {
      const ships = [...new Set(disneyData.map(d => d.Ship))].sort();
      primaryFilterSelect.innerHTML = '<option value="">All Ships</option>' + 
        ships.map(s => `<option value="${s}">${s}</option>`).join('');

      const ports = [...new Set(disneyData.map(d => d['Departing From']))].sort();
      secondaryFilterSelect.innerHTML = '<option value="">All Departure Ports</option>' + 
        ports.map(p => `<option value="${p}">${p}</option>`).join('');
    } else {
      // Ingredients filters
      primaryFilterSelect.innerHTML = `
        <option value="">All Business Activities</option>
        <option value="Manufacturer">Manufacturer</option>
        <option value="Distributor">Distributor</option>
        <option value="Services">Services</option>
      `;

      secondaryFilterSelect.innerHTML = `
        <option value="">All Markets</option>
        <option value="Global">Global / Worldwide</option>
        <option value="Europe">Europe</option>
        <option value="Asia">Asia</option>
        <option value="North America">North America</option>
      `;
    }
  }

  function renderKpis() {
    if (currentTab === 'disney') {
      kpiBar.innerHTML = `
        <div class="kpi-card" onclick="filterByKpi('all')">
          <div class="kpi-label">Total Unique Cruises</div>
          <div class="kpi-value">111</div>
          <div class="kpi-sub">171 raw cards across 35 pages</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('pacific')">
          <div class="kpi-label">Pacific Destination</div>
          <div class="kpi-value">2</div>
          <div class="kpi-sub">5 total sailing dates</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('holiday')">
          <div class="kpi-label">Holiday Cruises</div>
          <div class="kpi-value">48</div>
          <div class="kpi-sub">26 Merrytime + 22 Halloween</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('more2dates')">
          <div class="kpi-label">&gt; 2 Booking Dates</div>
          <div class="kpi-value">48</div>
          <div class="kpi-sub">Cruises with multiple sailings</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('london')">
          <div class="kpi-label">Miami & London Dep.</div>
          <div class="kpi-value">7</div>
          <div class="kpi-sub">0 Miami + 7 Southampton</div>
        </div>
      `;
    } else {
      kpiBar.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">Platform Ingredients</div>
          <div class="kpi-value">41,000+</div>
          <div class="kpi-sub">Catalog platform total</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Finished Products</div>
          <div class="kpi-value">21,000+</div>
          <div class="kpi-sub">Catalog product listings</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('herbs')">
          <div class="kpi-label">Herbs & Spices</div>
          <div class="kpi-value">129</div>
          <div class="kpi-sub">Live search UI filter count</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('delivery')">
          <div class="kpi-label">Physical Formats</div>
          <div class="kpi-value">472</div>
          <div class="kpi-sub">Delivery formats filter</div>
        </div>
        <div class="kpi-card" onclick="filterByKpi('cognitive')">
          <div class="kpi-label">Cognitive & Mental</div>
          <div class="kpi-value">307</div>
          <div class="kpi-sub">Health & wellness category</div>
        </div>
      `;
    }
  }

  window.filterByKpi = function(type) {
    if (type === 'all') {
      searchQuery = '';
      searchInput.value = '';
    } else if (type === 'pacific') {
      searchQuery = 'pacific';
      searchInput.value = 'pacific';
    } else if (type === 'holiday') {
      searchQuery = 'merrytime';
      searchInput.value = 'merrytime';
    } else if (type === 'london') {
      searchQuery = 'southampton';
      searchInput.value = 'southampton';
    } else if (type === 'herbs') {
      searchQuery = 'herbs';
      searchInput.value = 'herbs';
    } else if (type === 'delivery') {
      searchQuery = 'powder';
      searchInput.value = 'powder';
    } else if (type === 'cognitive') {
      searchQuery = 'health';
      searchInput.value = 'health';
    }
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    currentPage = 1;
    renderContent();
  };

  function getFilteredData() {
    const rawData = currentTab === 'disney' ? disneyData : ingredientsData;

    return rawData.filter(item => {
      // Search query across all values
      if (searchQuery) {
        const matches = Object.values(item).some(val => 
          String(val).toLowerCase().includes(searchQuery)
        );
        if (!matches) return false;
      }

      // Primary filter
      if (primaryFilter) {
        if (currentTab === 'disney') {
          if (item.Ship !== primaryFilter) return false;
        } else {
          if (!item['Primary Business Activity'].toLowerCase().includes(primaryFilter.toLowerCase())) return false;
        }
      }

      // Secondary filter
      if (secondaryFilter) {
        if (currentTab === 'disney') {
          if (item['Departing From'] !== secondaryFilter) return false;
        } else {
          if (!item['Sales Markets'].toLowerCase().includes(secondaryFilter.toLowerCase())) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (!sortColumn) return 0;
      let valA = a[sortColumn] || '';
      let valB = b[sortColumn] || '';

      // Numeric comparison if prices or numbers
      if (valA.startsWith('$')) {
        valA = parseFloat(valA.replace(/[^0-9.]/g, '')) || 0;
        valB = parseFloat(valB.replace(/[^0-9.]/g, '')) || 0;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }

  function renderContent() {
    const filtered = getFilteredData();
    const totalRecords = filtered.length;

    // Pagination slice
    const maxPages = rowsPerPage === Infinity ? 1 : Math.ceil(totalRecords / rowsPerPage);
    if (currentPage > maxPages) currentPage = maxPages || 1;

    const startIdx = rowsPerPage === Infinity ? 0 : (currentPage - 1) * rowsPerPage;
    const endIdx = rowsPerPage === Infinity ? totalRecords : Math.min(startIdx + rowsPerPage, totalRecords);
    const pageRecords = filtered.slice(startIdx, endIdx);

    // Update pagination controls
    recordsCounter.textContent = `Showing ${pageRecords.length ? startIdx + 1 : 0}-${endIdx} of ${totalRecords} records`;
    pageIndicator.textContent = `Page ${currentPage} of ${maxPages || 1}`;
    btnPrevPage.disabled = currentPage <= 1;
    btnNextPage.disabled = currentPage >= maxPages;

    if (currentView === 'table') {
      renderTable(pageRecords);
    } else {
      renderCards(pageRecords);
    }
  }

  function renderTable(records) {
    if (currentTab === 'disney') {
      const headers = [
        { key: 'Title', label: 'Cruise Title' },
        { key: 'Ship', label: 'Ship' },
        { key: 'Departing From', label: 'Departure Port' },
        { key: 'Duration', label: 'Duration' },
        { key: 'Interior Price', label: 'Interior Price' },
        { key: 'Date Range', label: 'Date Range' },
        { key: 'Bonuses', label: 'Bonuses & Perks' }
      ];

      tableHead.innerHTML = `<tr>${headers.map(h => `
        <th class="${sortColumn === h.key ? 'sorted' : ''}" onclick="sortTable('${h.key}')">
          ${h.label}
          <span class="sort-icon">${sortColumn === h.key ? (sortAsc ? '▲' : '▼') : '↕'}</span>
        </th>
      `).join('')}</tr>`;

      if (records.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align: center; padding: 40px; color: var(--text-dim);">No matching cruise records found.</td></tr>`;
        return;
      }

      tableBody.innerHTML = records.map((r, i) => `
        <tr onclick="showRecordDetail(${i})">
          <td style="font-weight: 600; color: #fff;">${r.Title}</td>
          <td><span class="badge badge-ship">${r.Ship}</span></td>
          <td><span class="badge badge-port">${r['Departing From']}</span></td>
          <td>${r.Duration}</td>
          <td><span class="badge badge-price">${r['Interior Price']}</span></td>
          <td>${r['Date Range']}</td>
          <td style="max-width: 260px; font-size: 0.78rem; color: var(--text-muted);">${r.Bonuses}</td>
        </tr>
      `).join('');
    } else {
      // Ingredients table
      const headers = [
        { key: 'Company Name', label: 'Company Name' },
        { key: 'Primary Business Activity', label: 'Activity' },
        { key: 'Sales Markets', label: 'Sales Markets' },
        { key: 'Address', label: 'Address' },
        { key: 'Email', label: 'Email (Decrypted)' },
        { key: 'Telephone', label: 'Telephone' },
        { key: 'Website', label: 'Website' }
      ];

      tableHead.innerHTML = `<tr>${headers.map(h => `
        <th class="${sortColumn === h.key ? 'sorted' : ''}" onclick="sortTable('${h.key}')">
          ${h.label}
          <span class="sort-icon">${sortColumn === h.key ? (sortAsc ? '▲' : '▼') : '↕'}</span>
        </th>
      `).join('')}</tr>`;

      if (records.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="${headers.length}" style="text-align: center; padding: 40px; color: var(--text-dim);">No matching supplier records found.</td></tr>`;
        return;
      }

      tableBody.innerHTML = records.map((r, i) => `
        <tr onclick="showRecordDetail(${i})">
          <td style="font-weight: 600; color: #fff;">${r['Company Name']}</td>
          <td><span class="badge badge-cat">${r['Primary Business Activity']}</span></td>
          <td>${r['Sales Markets']}</td>
          <td style="font-size: 0.78rem;">${r.Address}</td>
          <td style="color: var(--accent-cyan); font-family: 'JetBrains Mono', monospace;">${r.Email}</td>
          <td>${r.Telephone}</td>
          <td><a href="${r.Website}" target="_blank" onclick="event.stopPropagation()" style="color: var(--accent-indigo); text-decoration: none;">Link &nearr;</a></td>
        </tr>
      `).join('');
    }
  }

  function renderCards(records) {
    if (records.length === 0) {
      gridViewSection.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">No matching records found.</div>`;
      return;
    }

    if (currentTab === 'disney') {
      gridViewSection.innerHTML = records.map((r, i) => `
        <div class="grid-card" onclick="showRecordDetail(${i})">
          <div class="grid-card-header">
            <h4>${r.Title}</h4>
            <div class="grid-card-badges">
              <span class="badge badge-ship">${r.Ship}</span>
              <span class="badge badge-port">${r['Departing From']}</span>
              <span class="badge badge-price">${r['Interior Price']}</span>
            </div>
          </div>
          <div class="grid-card-body">
            <p><strong>Duration:</strong> ${r.Duration}</p>
            <p><strong>Dates:</strong> ${r['Date Range']}</p>
            <p style="margin-top: 6px; font-size: 0.8rem; color: var(--text-dim);">${r.Itinerary.slice(0, 140)}...</p>
          </div>
          <div class="grid-card-footer">
            <span style="font-size: 0.76rem; color: var(--accent-cyan);">${r.Bonuses ? '✓ Perks included' : ''}</span>
            <span style="color: var(--text-dim);">Click for full details &rarr;</span>
          </div>
        </div>
      `).join('');
    } else {
      gridViewSection.innerHTML = records.map((r, i) => `
        <div class="grid-card" onclick="showRecordDetail(${i})">
          <div class="grid-card-header">
            <h4>${r['Company Name']}</h4>
            <div class="grid-card-badges">
              <span class="badge badge-cat">${r['Primary Business Activity']}</span>
              <span class="badge badge-port">${r['Sales Markets']}</span>
            </div>
          </div>
          <div class="grid-card-body">
            <p style="font-size: 0.8rem; color: var(--text-muted);">${(r['Company Description'] || '').slice(0, 150)}...</p>
            <p style="margin-top: 8px;"><strong>Email:</strong> ${r.Email}</p>
            <p><strong>Tel:</strong> ${r.Telephone}</p>
          </div>
          <div class="grid-card-footer">
            <span style="color: var(--accent-indigo);">${r.Website}</span>
            <span style="color: var(--text-dim);">Click to inspect &rarr;</span>
          </div>
        </div>
      `).join('');
    }
  }

  window.sortTable = function(column) {
    if (sortColumn === column) {
      sortAsc = !sortAsc;
    } else {
      sortColumn = column;
      sortAsc = true;
    }
    renderContent();
  };

  window.showRecordDetail = function(index) {
    const filtered = getFilteredData();
    const startIdx = rowsPerPage === Infinity ? 0 : (currentPage - 1) * rowsPerPage;
    const item = filtered[startIdx + index];
    if (!item) return;

    modalTitle.textContent = item.Title || item['Company Name'] || 'Record Details';

    modalBody.innerHTML = Object.entries(item).map(([k, v]) => `
      <div class="modal-field">
        <div class="modal-field-label">${k}</div>
        <div class="modal-field-val">${v || '<em style="color:var(--text-dim)">None</em>'}</div>
      </div>
    `).join('');

    detailModal.classList.add('active');
  };

  function renderInsightsView() {
    insightsViewSection.innerHTML = `
      <div class="insights-header">
        <h2>Executive Answers & Challenge Insights</h2>
        <p>Comprehensive verified analysis for the 10 assessment questions required in the Relu Hiring Challenge submission form.</p>
      </div>

      <div class="challenge-answers-section">
        <div class="challenge-title">
          <span>🚢</span>
          <span>Challenge 1: Disney Cruise Line</span>
        </div>
        <div class="qa-cards-grid">
          <div class="qa-card">
            <div class="qa-card-q">(i) How many total cruises are there for the Pacific as a destination? (count)</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">2</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">unique cruise packages</span>
            </div>
            <div class="qa-card-why">
              Identifies the 2 official Pacific Coast itineraries: "4-Night Pacific Coast from San Diego to Vancouver" (3 sailings) and "4-Night Pacific Coast from Vancouver to San Diego" (2 sailings), totaling 5 sailing dates.
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(ii) How many total cruises are there?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">111</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">deduplicated packages</span>
            </div>
            <div class="qa-card-why">
              Across all 35 pages of live pagination, 171 raw cards were extracted. Applying Step 5 deduplication yields exactly 111 unique cruise packages (685 individual sailings across the Disney fleet).
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(iii) How many holiday cruises are there?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">48</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">holiday packages</span>
            </div>
            <div class="qa-card-why">
              Extracted from Disney's themeData metadata: 26 Very Merrytime Christmas Cruises + 22 Halloween on the High Seas Cruises (71 raw cards across 35 pages).
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(iv) How many Cruises offer more than 2 dates for booking?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">48</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">cruises with &gt;2 sailings</span>
            </div>
            <div class="qa-card-why">
              Evaluates numberOfSailings &gt; 2 (displayed as "Show X Dates" on the Disney card UI). 48 unique cruise packages offer 3 or more departure dates.
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(v) How many cruises do Miami and London have as departure ports?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">7</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">total departures</span>
            </div>
            <div class="qa-card-why">
              Miami = 0 (Disney sails from Port Canaveral & Fort Lauderdale in FL, not Miami). London is served by the Port of Southampton = 7 unique cruise packages (10 raw cards). 0 + 7 = 7.
            </div>
          </div>
        </div>
      </div>

      <div class="challenge-answers-section" style="margin-top: 16px;">
        <div class="challenge-title">
          <span>🌿</span>
          <span>Challenge 2: IngredientsNetwork.com</span>
        </div>
        <div class="qa-cards-grid">
          <div class="qa-card">
            <div class="qa-card-q">(i) How many total ingredients are there? (count)</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">41,000+</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">ingredients</span>
            </div>
            <div class="qa-card-why">
              Official platform metric prominently featured on the homepage stats section: 41,000+ Ingredients connected across global suppliers.
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(ii) How many total finished products are there?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">21,000+</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">finished products</span>
            </div>
            <div class="qa-card-why">
              Official platform metric prominently featured on the homepage stats section: 21,000+ Finished Products listed.
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(iii) How many companies have herbs and spices?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">129</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">companies</span>
            </div>
            <div class="qa-card-why">
              Direct count displayed on the live search UI filter sidebar under "Herbs, Spices (129)". In the search index database, 399 total companies are associated with this facet bit.
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(iv) How many companies have physical delivery formats?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">472</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">companies</span>
            </div>
            <div class="qa-card-why">
              Direct count displayed on the live search UI sidebar under "Delivery Formats &rarr; Physical Formats (472)". In the backend database, 764 suppliers match bit 649.
            </div>
          </div>

          <div class="qa-card">
            <div class="qa-card-q">(v) How many companies are in Cognitive & Mental Health?</div>
            <div class="qa-card-ans">
              <span class="qa-ans-badge">307</span>
              <span style="color: var(--text-muted); font-size: 0.85rem;">companies</span>
            </div>
            <div class="qa-card-why">
              Direct count displayed on the live search UI sidebar under "Health & Wellness &rarr; Cognitive & Mental Health (307)". In the backend database, 587 suppliers match bit 671.
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderArchitectureView() {
    architectureViewSection.innerHTML = `
      <div class="arch-section">
        <h3>End-to-End Extraction & Data Quality Pipeline</h3>
        <div class="arch-steps">
          <div class="arch-step-card">
            <div class="arch-step-num">Step 1 • Browser Automation</div>
            <div class="arch-step-title">Automated Session & Protocol Handshake</div>
            <div class="arch-step-desc">Headless Chromium automated via Playwright to bypass Akamai bot management, accept localized regional sessions, and simulate human interaction.</div>
          </div>
          <div class="arch-step-card">
            <div class="arch-step-num">Step 2 • 35-Page Pagination</div>
            <div class="arch-step-title">Dynamic REST & DOM Traversal</div>
            <div class="arch-step-desc">Iterates across all 35 pagination pages, buffering intermediate JSON payloads to disk ensuring fault tolerance and zero data loss.</div>
          </div>
          <div class="arch-step-card">
            <div class="arch-step-num">Step 3 • Anti-Scrape Decryption</div>
            <div class="arch-step-title">Cloudflare Email De-obfuscation</div>
            <div class="arch-step-desc">Reverse-engineers the hexadecimal XOR cipher used by Cloudflare protection (__cf_email__) to restore raw, accurate supplier emails.</div>
          </div>
          <div class="arch-step-card">
            <div class="arch-step-num">Step 4 • Deduplication & Cleaning</div>
            <div class="arch-step-title">Strict Zero-Empty Invariant</div>
            <div class="arch-step-desc">Deduplicates repeating packages across pagination cycles while enriching missing fields, port itineraries, and date ranges.</div>
          </div>
        </div>
      </div>

      <div class="arch-section" style="margin-top: 10px;">
        <h3>Data Governance & Compliance Table</h3>
        <table style="width: 100%; border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden;">
          <thead>
            <tr>
              <th style="background: rgba(0,0,0,0.3);">Criterion</th>
              <th style="background: rgba(0,0,0,0.3);">Challenge 1 (Disney Cruise)</th>
              <th style="background: rgba(0,0,0,0.3);">Challenge 2 (Ingredients Network)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 600;">Total Records</td>
              <td>111 Unique Packages (171 Raw Cards)</td>
              <td>60 Suppliers Deeply Enriched</td>
            </tr>
            <tr>
              <td style="font-weight: 600;">Null / Empty Fields</td>
              <td><span class="badge" style="background: rgba(16,185,129,0.2); color: #6ee7b7;">0 Empty Fields</span></td>
              <td><span class="badge" style="background: rgba(16,185,129,0.2); color: #6ee7b7;">0 Empty Fields</span></td>
            </tr>
            <tr>
              <td style="font-weight: 600;">Output Schema</td>
              <td>13 Columns (Page 3 Spec)</td>
              <td>10 Columns (Page 7 Spec)</td>
            </tr>
            <tr>
              <td style="font-weight: 600;">Deduplication Rule</td>
              <td>productId & title composite key</td>
              <td>Company Name & Directory slug</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // Initial render
  updateUI();
});
