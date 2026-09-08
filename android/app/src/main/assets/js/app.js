/**
 * LM Scan — Google Stitch Enterprise Application Controller
 * High-performance mobile & desktop compliance checking with haptics, PDP calculator, and offline support.
 */

class LMScannerApp {
  constructor() {
    this.activeTab = 'scan';
    this.previousTab = 'scan';
    this.activeScan = null;
    this.historyScans = [];
    this.stats = { totalScans: 0, compliant: 0, nonCompliant: 0, needsReview: 0, passRate: 0 };
    this.isScanning = false;
    this.selectedImageData = null;
    this.currentSampleHint = '';
    this.theme = localStorage.getItem('lm_theme') || 'dark';
    this.apiKey = localStorage.getItem('lm_gemini_api_key') || '';
    
    this.cameraController = null;
    this.initElements();
    this.initTheme();
    this.initServiceWorker();
    this.bindEvents();
    this.loadHistory();
    this.renderSamples();
  }

  initElements() {
    // Bottom Nav & Top Appbar
    this.bottomNavItems = document.querySelectorAll('.stitch-bottom-nav .nav-item');
    this.viewScan = document.getElementById('viewScan');
    this.viewHistory = document.getElementById('viewHistory');
    this.viewResult = document.getElementById('viewResult');
    this.viewRules = document.getElementById('viewRules');
    this.historyCountBadge = document.getElementById('historyCountBadge');

    // Appbar Elements
    this.btnBackAppbar = document.getElementById('btnBackAppbar');
    this.appbarLogo = document.getElementById('appbarLogo');
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.btnOpenSettings = document.getElementById('btnOpenSettings');

    // Scan View Elements
    this.viewfinderCard = document.getElementById('viewfinderCard');
    this.viewfinderPlaceholder = document.getElementById('viewfinderPlaceholder');
    this.previewImg = document.getElementById('previewImg');
    this.cameraLiveStream = document.getElementById('cameraLiveStream');
    this.laserScanner = document.getElementById('laserScanner');
    this.cameraActionDock = document.getElementById('cameraActionDock');

    this.fileUploadInput = document.getElementById('fileUploadInput');
    this.cameraCaptureInput = document.getElementById('cameraCaptureInput');

    this.btnLaunchLiveCam = document.getElementById('btnLaunchLiveCam');
    this.btnSelectFile = document.getElementById('btnSelectFile');
    this.btnPerformScan = document.getElementById('btnPerformScan');
    this.btnRetakePhoto = document.getElementById('btnRetakePhoto');

    this.initialButtonRow = document.getElementById('initialButtonRow');
    this.selectedButtonRow = document.getElementById('selectedButtonRow');
    this.sampleGridTiles = document.getElementById('sampleGridTiles');

    // Result View Elements
    this.resultContainer = document.getElementById('resultContainer');
    this.btnScanAnotherBottom = document.getElementById('btnScanAnotherBottom');

    // History View Elements
    this.historyList = document.getElementById('historyList');
    this.historySearch = document.getElementById('historySearch');
    this.historyFilter = document.getElementById('historyFilter');
    this.statTotal = document.getElementById('statTotal');
    this.statPass = document.getElementById('statPass');
    this.statFail = document.getElementById('statFail');
    this.btnExportCSV = document.getElementById('btnExportCSV');
    this.btnClearAllHistory = document.getElementById('btnClearAllHistory');

    // PDP Calculator Elements
    this.pdpAreaInput = document.getElementById('pdpAreaInput');
    this.pdpTypeSelect = document.getElementById('pdpTypeSelect');
    this.pdpResultBox = document.getElementById('pdpResultBox');
    this.btnCalculatePdp = document.getElementById('btnCalculatePdp');

    // Settings Modal Sheet
    this.settingsModal = document.getElementById('settingsModal');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.btnSaveApiKey = document.getElementById('btnSaveApiKey');
    this.btnCloseModal = document.getElementById('btnCloseModal');

    this.toast = document.getElementById('toast');
    this.cameraController = new LiveCameraController(this.cameraLiveStream, () => {});
  }

  initTheme() {
    document.documentElement.setAttribute('data-theme', this.theme);
    this.updateThemeIcon();
  }

  updateThemeIcon() {
    if (this.btnThemeToggle) {
      this.btnThemeToggle.innerHTML = this.theme === 'dark' 
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
    }
  }

  initServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn("ServiceWorker registration failed:", err);
      });
    }
  }

  triggerHaptic(type = 'light') {
    // Android Native Bridge
    if (window.AndroidNative && typeof window.AndroidNative.vibrateDevice === 'function') {
      try {
        if (type === 'light') window.AndroidNative.vibrateDevice(20);
        else if (type === 'success') window.AndroidNative.vibrateDevice(45);
        else if (type === 'warning') window.AndroidNative.vibrateDevice(85);
      } catch (e) {}
    }
    // iOS Native Bridge
    if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.iosNative) {
      try {
        window.webkit.messageHandlers.iosNative.postMessage({ action: 'haptic', style: type });
      } catch (e) {}
    }
    // Web Standards Vibration API
    if ('vibrate' in navigator) {
      try {
        if (type === 'light') navigator.vibrate(15);
        else if (type === 'success') navigator.vibrate([20, 40, 20]);
        else if (type === 'warning') navigator.vibrate([50, 80, 50]);
      } catch (e) {}
    }
  }

  bindEvents() {
    // Bottom navigation
    this.bottomNavItems.forEach(item => {
      item.addEventListener('click', () => {
        this.triggerHaptic('light');
        const tab = item.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Back button in top app bar
    this.btnBackAppbar?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.switchTab(this.previousTab || 'scan');
    });

    // Theme toggle
    this.btnThemeToggle?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      localStorage.setItem('lm_theme', this.theme);
      this.initTheme();
    });

    // Settings Modal
    this.btnOpenSettings?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.apiKeyInput.value = this.apiKey;
      this.settingsModal.classList.add('open');
    });
    this.btnCloseModal?.addEventListener('click', () => {
      this.settingsModal.classList.remove('open');
    });
    this.settingsModal?.addEventListener('click', (e) => {
      if (e.target === this.settingsModal) this.settingsModal.classList.remove('open');
    });
    this.btnSaveApiKey?.addEventListener('click', () => {
      this.triggerHaptic('success');
      this.apiKey = this.apiKeyInput.value.trim();
      localStorage.setItem('lm_gemini_api_key', this.apiKey);
      this.settingsModal.classList.remove('open');
      this.showToast(this.apiKey ? "Gemini Vision AI Engine activated" : "Offline Rule Engine active");
    });

    // Upload & Capture Actions
    this.btnSelectFile?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.fileUploadInput.click();
    });
    this.fileUploadInput?.addEventListener('change', (e) => this.handleImageFile(e.target.files[0]));
    this.cameraCaptureInput?.addEventListener('change', (e) => this.handleImageFile(e.target.files[0]));

    // Live WebRTC Camera
    this.btnLaunchLiveCam?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.startLiveCamera();
    });
    document.getElementById('btnShutterAction')?.addEventListener('click', () => {
      this.triggerHaptic('success');
      this.captureLiveSnapshot();
    });
    document.getElementById('btnSwitchCamera')?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.cameraController.switchCamera();
    });
    document.getElementById('btnToggleTorch')?.addEventListener('click', async () => {
      this.triggerHaptic('light');
      const res = await this.cameraController.toggleTorch();
      if (res === null) this.showToast("Flashlight not available on this device");
    });
    document.getElementById('btnCloseCamera')?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.stopLiveCamera();
    });

    // Drag & drop
    this.viewfinderCard?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.viewfinderCard.classList.add('drag-over');
    });
    this.viewfinderCard?.addEventListener('dragleave', () => {
      this.viewfinderCard.classList.remove('drag-over');
    });
    this.viewfinderCard?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.viewfinderCard.classList.remove('drag-over');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        this.handleImageFile(e.dataTransfer.files[0]);
      }
    });

    // Retake & Scan
    this.btnRetakePhoto?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.resetCapture();
    });
    this.btnPerformScan?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.executeComplianceScan();
    });
    this.btnScanAnotherBottom?.addEventListener('click', () => {
      this.triggerHaptic('light');
      this.resetCapture();
      this.switchTab('scan');
    });

    // History controls
    this.historySearch?.addEventListener('input', () => this.filterHistoryRecords());
    this.historyFilter?.addEventListener('change', () => this.filterHistoryRecords());
    this.btnExportCSV?.addEventListener('click', () => {
      this.triggerHaptic('light');
      window.ReportGenerator.exportCSV(this.historyScans);
    });
    this.btnClearAllHistory?.addEventListener('click', () => this.clearAllHistory());

    // Schedule II PDP Calculator
    this.btnCalculatePdp?.addEventListener('click', () => this.calculatePDPHeight());
  }

  switchTab(tabName) {
    if (this.activeTab !== 'result') {
      this.previousTab = this.activeTab;
    }
    this.activeTab = tabName;

    // Bottom Navigation Pill Updates
    this.bottomNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabName);
    });

    // View Panels Toggle
    this.viewScan.classList.toggle('hidden', tabName !== 'scan');
    this.viewHistory.classList.toggle('hidden', tabName !== 'history');
    this.viewResult.classList.toggle('hidden', tabName !== 'result');
    this.viewRules.classList.toggle('hidden', tabName !== 'rules');

    // Appbar Header Button State
    if (tabName === 'result') {
      this.btnBackAppbar.classList.remove('hidden');
      this.appbarLogo.classList.add('hidden');
    } else {
      this.btnBackAppbar.classList.add('hidden');
      this.appbarLogo.classList.remove('hidden');
    }

    if (tabName !== 'scan') {
      this.stopLiveCamera();
    }
    if (tabName === 'history') {
      this.loadHistory();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderSamples() {
    if (!this.sampleGridTiles) return;
    this.sampleGridTiles.innerHTML = '';
    window.SAMPLE_CATALOG.forEach(sample => {
      const tile = document.createElement('div');
      tile.className = 'sample-tile';
      tile.innerHTML = `
        <span class="tile-title">${sample.name}</span>
        <span class="tile-subtitle">${sample.badgeText} · ${sample.category}</span>
      `;
      tile.addEventListener('click', () => {
        this.triggerHaptic('light');
        this.loadSampleCase(sample);
      });
      this.sampleGridTiles.appendChild(tile);
    });
  }

  loadSampleCase(sample) {
    this.stopLiveCamera();
    const sampleImg = window.generateSampleCanvas(sample);
    this.selectedImageData = {
      image: sampleImg,
      thumbnail: sampleImg
    };
    this.currentSampleHint = sample.hintText;

    this.previewImg.src = sampleImg;
    this.previewImg.classList.remove('hidden');
    this.viewfinderPlaceholder.classList.add('hidden');
    this.cameraLiveStream.classList.add('hidden');

    this.initialButtonRow.classList.add('hidden');
    this.selectedButtonRow.classList.remove('hidden');

    this.showToast(`Loaded: ${sample.name}`);
  }

  async handleImageFile(file) {
    if (!file) return;
    this.stopLiveCamera();
    this.showToast("Optimizing image...");
    try {
      const opt = await window.ImagePreprocessor.processFile(file);
      this.selectedImageData = opt;
      this.currentSampleHint = '';

      this.previewImg.src = opt.image;
      this.previewImg.classList.remove('hidden');
      this.viewfinderPlaceholder.classList.add('hidden');
      this.cameraLiveStream.classList.add('hidden');

      this.initialButtonRow.classList.add('hidden');
      this.selectedButtonRow.classList.remove('hidden');
    } catch (err) {
      alert("Image loading error: " + err.message);
    }
  }

  async startLiveCamera() {
    this.resetCapture();
    this.viewfinderPlaceholder.classList.add('hidden');
    this.previewImg.classList.add('hidden');
    this.cameraLiveStream.classList.remove('hidden');
    this.cameraActionDock.classList.remove('hidden');

    const started = await this.cameraController.startCamera();
    if (!started) {
      this.stopLiveCamera();
      this.cameraCaptureInput.click();
    }
  }

  stopLiveCamera() {
    this.cameraController.stopCamera();
    this.cameraLiveStream.classList.add('hidden');
    this.cameraActionDock.classList.add('hidden');
    if (!this.selectedImageData) {
      this.viewfinderPlaceholder.classList.remove('hidden');
    }
  }

  captureLiveSnapshot() {
    const frame = this.cameraController.captureFrame();
    if (frame) {
      this.stopLiveCamera();
      this.selectedImageData = frame;
      this.currentSampleHint = '';

      this.previewImg.src = frame.image;
      this.previewImg.classList.remove('hidden');
      this.viewfinderPlaceholder.classList.add('hidden');

      this.initialButtonRow.classList.add('hidden');
      this.selectedButtonRow.classList.remove('hidden');
    }
  }

  resetCapture() {
    this.stopLiveCamera();
    this.selectedImageData = null;
    this.currentSampleHint = '';
    this.fileUploadInput.value = '';
    this.cameraCaptureInput.value = '';

    this.previewImg.src = '';
    this.previewImg.classList.add('hidden');
    this.viewfinderPlaceholder.classList.remove('hidden');

    this.initialButtonRow.classList.remove('hidden');
    this.selectedButtonRow.classList.add('hidden');
  }

  async executeComplianceScan() {
    if (!this.selectedImageData) return;

    this.isScanning = true;
    this.laserScanner.classList.remove('hidden');
    this.btnPerformScan.disabled = true;
    this.btnRetakePhoto.disabled = true;
    this.btnPerformScan.innerHTML = `
      <svg class="spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      Evaluating Rules...
    `;

    try {
      const payload = {
        image: this.selectedImageData.image,
        thumbnail: this.selectedImageData.thumbnail,
        apiKey: this.apiKey,
        hint: this.currentSampleHint
      };

      const resp = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Scan analysis failed');
      }

      const scanResult = await resp.json();
      this.activeScan = scanResult;
      
      if (scanResult.status === 'compliant') this.triggerHaptic('success');
      else this.triggerHaptic('warning');

      this.renderScanResult(scanResult);
      this.switchTab('result');
      this.loadHistory();
      this.showToast("Compliance audit completed!");
    } catch (err) {
      alert("Scan error: " + err.message);
    } finally {
      this.isScanning = false;
      this.laserScanner.classList.add('hidden');
      this.btnPerformScan.disabled = false;
      this.btnRetakePhoto.disabled = false;
      this.btnPerformScan.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        Check Compliance
      `;
    }
  }

  renderScanResult(scan) {
    if (!this.resultContainer) return;
    const status = scan.status;
    const isPass = status === 'compliant';
    const isFail = status === 'non_compliant';

    let penaltyHtml = '';
    if (isFail && scan.penaltiesNotice) {
      penaltyHtml = `
        <div class="statutory-callout">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          <div>
            <h4 style="font-size: 13.5px; font-weight: 700;">Legal Metrology Act, 2009 — Section 36 Penalty Notice</h4>
            <p style="font-size: 12px; margin-top: 3px;">${scan.penaltiesNotice.first_offence}</p>
            <p style="font-size: 12px; margin-top: 2px; font-weight: 600;">${scan.penaltiesNotice.seizure}</p>
          </div>
        </div>
      `;
    }

    let cardsHtml = '';
    scan.fields.forEach(f => {
      const v = f.verdict;
      const icon = v === 'pass'
        ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
        : (v === 'fail'
          ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>');

      let issuesList = '';
      if (f.issues && f.issues.length > 0) {
        issuesList = `<ul class="issues-badge-list">` + f.issues.map(iss => {
          const isErr = iss.includes('Violation') || iss.includes('Non-compliant') || iss.includes('missing');
          return `<li class="${isErr ? 'fail-msg' : 'warn-msg'}">⚠️ ${iss}</li>`;
        }).join('') + `</ul>`;
      }

      cardsHtml += `
        <div class="rule-row-card ${v}">
          <div class="rule-verdict-icon">${icon}</div>
          <div class="rule-details">
            <div class="rule-header-line">
              <h3>${f.label}</h3>
              <span class="rule-ref-chip">${f.rule}</span>
            </div>
            ${f.value ? `<div class="rule-extracted-value">“${this.escapeHtml(f.value)}”</div>` : `<div style="font-size: 12px; font-style: italic; color: var(--md-sys-color-on-surface-variant);">Not declared on package label</div>`}
            ${issuesList}
            ${v !== 'pass' && f.recommendation ? `<div style="font-size: 11px; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">💡 <strong>Remedy:</strong> ${f.recommendation}</div>` : ''}
          </div>
        </div>
      `;
    });

    this.resultContainer.innerHTML = `
      <div class="result-banner ${status}">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <div style="font-family: var(--font-mono); font-size: 11px; opacity: 0.8; margin-bottom: 2px;">
              Inspection #${String(scan.id).padStart(4, '0')} · ${new Date(scan.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <h2 style="font-size: 19px; font-weight: 700;">${this.escapeHtml(scan.productName || 'Packaged Commodity')}</h2>
          </div>
          <span class="status-chip ${status}">
            ${isPass ? 'PASS · Compliant' : (isFail ? 'FAIL · Non-Compliant' : 'Needs Review')}
          </span>
        </div>
        <p style="font-size: 13px; line-height: 1.45;">${scan.summary}</p>
        <div style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 11px; opacity: 0.8; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 8px;">
          <span>Compliance Score: <strong>${scan.totalScore}%</strong> (${scan.presentCount}/6 Rules Verified)</span>
          <span>LM (PC) Rules, 2011</span>
        </div>
      </div>

      <div class="button-row">
        <button type="button" class="btn-stitch tonal flex-1" id="btnPrintReport">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></svg>
          Print Audit PDF
        </button>
        <button type="button" class="btn-stitch tonal flex-1" id="btnExportScanJSON">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export JSON
        </button>
      </div>

      ${penaltyHtml}

      <div class="checklist-container">
        ${cardsHtml}
      </div>

      <details class="stitch-accordion" style="margin-top: 6px;">
        <summary>
          <span>Complete Transcribed Label OCR Text</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
        </summary>
        <div style="padding: 12px; font-family: var(--font-mono); font-size: 11px; color: var(--md-sys-color-on-surface-variant); white-space: pre-wrap; word-break: break-word; max-height: 220px; overflow-y: auto;">
          ${this.escapeHtml(scan.rawText || 'No transcribed text available.')}
        </div>
      </details>
    `;

    document.getElementById('btnPrintReport')?.addEventListener('click', () => {
      this.triggerHaptic('light');
      window.ReportGenerator.printCertificate(scan);
    });
    document.getElementById('btnExportScanJSON')?.addEventListener('click', () => {
      this.triggerHaptic('light');
      window.ReportGenerator.exportJSON(scan);
    });
  }

  calculatePDPHeight() {
    this.triggerHaptic('light');
    const area = parseFloat(this.pdpAreaInput.value);
    const pType = this.pdpTypeSelect.value;
    
    if (isNaN(area) || area <= 0) {
      alert("Please enter a valid positive surface area in cm²");
      return;
    }

    let minHeight = "1.0 mm";
    let ruleRef = "Schedule II, Table I";

    if (area <= 50) {
      minHeight = "1.0 mm (Blown/Moulded: 1.5 mm)";
    } else if (area <= 100) {
      minHeight = "1.5 mm (Blown/Moulded: 3.0 mm)";
    } else if (area <= 500) {
      minHeight = "2.0 mm (Blown/Moulded: 4.0 mm)";
    } else if (area <= 2500) {
      minHeight = "4.0 mm (Blown/Moulded: 6.0 mm)";
    } else {
      minHeight = "6.0 mm (Blown/Moulded: 6.0 mm)";
    }

    this.pdpResultBox.classList.remove('hidden');
    this.pdpResultBox.innerHTML = `
      <div style="font-size: 13px; font-weight: 700; color: var(--md-sys-color-primary);">
        Mandatory Min Numeral & Font Height: ${minHeight}
      </div>
      <div style="font-size: 11.5px; color: var(--md-sys-color-on-surface-variant); margin-top: 4px;">
        Legal Standard: ${ruleRef} under Rule 7 of Legal Metrology (Packaged Commodities) Rules, 2011 for PDP area of <strong>${area} cm²</strong>.
      </div>
    `;
  }

  async loadHistory() {
    try {
      const resp = await fetch('/api/scans');
      if (!resp.ok) return;
      const data = await resp.json();
      this.historyScans = data.scans || [];
      this.stats = data.stats || { totalScans: 0, compliant: 0, nonCompliant: 0, needsReview: 0, passRate: 0 };
      
      this.updateStatsUI();
      this.renderHistoryRecords(this.historyScans);
    } catch (err) {
      console.warn("Could not load history:", err);
    }
  }

  updateStatsUI() {
    if (this.historyCountBadge) {
      this.historyCountBadge.textContent = this.stats.totalScans || '0';
    }
    if (this.statTotal) this.statTotal.textContent = this.stats.totalScans || '0';
    if (this.statPass) this.statPass.textContent = `${this.stats.passRate}%`;
    if (this.statFail) this.statFail.textContent = this.stats.nonCompliant || '0';
  }

  renderHistoryRecords(items) {
    if (!this.historyList) return;
    if (!items || items.length === 0) {
      this.historyList.innerHTML = `
        <div style="padding: 40px 16px; text-align: center; color: var(--md-sys-color-on-surface-variant); font-size: 13px;">
          <p style="font-weight: 600;">No scans in log</p>
          <p style="font-size: 11.5px; margin-top: 4px;">Inspected package labels will appear here with audit timestamps.</p>
        </div>
      `;
      return;
    }

    this.historyList.innerHTML = items.map(s => {
      const isPass = s.status === 'compliant';
      const isFail = s.status === 'non_compliant';
      const dateStr = new Date(s.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const thumb = s.thumbnail || '';

      return `
        <li class="history-card-item" data-id="${s.id}">
          ${thumb ? `<img src="${thumb}" class="history-avatar" alt="" />` : `<div class="history-avatar"></div>`}
          <div class="history-card-body">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
              <span class="history-card-title">${this.escapeHtml(s.productName || 'Unnamed')}</span>
              <span class="status-chip ${s.status}" style="font-size: 9px; padding: 2px 7px;">
                ${isPass ? 'PASS' : (isFail ? 'FAIL' : 'REVIEW')}
              </span>
            </div>
            <div class="history-card-meta">
              #${String(s.id).padStart(4, '0')} · ${s.presentCount}/6 Rules · ${dateStr}
            </div>
          </div>
          <button type="button" class="icon-button delete-item-btn" data-delete-id="${s.id}" title="Delete" style="width: 32px; height: 32px; flex-shrink: 0;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </li>
      `;
    }).join('');

    this.historyList.querySelectorAll('.history-card-item').forEach(el => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.delete-item-btn')) return;
        this.triggerHaptic('light');
        const scanId = el.dataset.id;
        this.loadSingleScan(scanId);
      });
    });

    this.historyList.querySelectorAll('.delete-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.triggerHaptic('warning');
        const scanId = btn.dataset.deleteId;
        this.deleteSingleScan(scanId);
      });
    });
  }

  filterHistoryRecords() {
    const q = (this.historySearch.value || '').toLowerCase().trim();
    const st = this.historyFilter.value;

    const filtered = this.historyScans.filter(s => {
      const matchesQ = (s.productName || '').toLowerCase().includes(q) || (s.summary || '').toLowerCase().includes(q);
      const matchesSt = st === 'all' || s.status === st;
      return matchesQ && matchesSt;
    });

    this.renderHistoryRecords(filtered);
  }

  async loadSingleScan(scanId) {
    try {
      const resp = await fetch(`/api/scans/${scanId}`);
      if (!resp.ok) throw new Error("Could not load scan record");
      const scan = await resp.json();
      this.activeScan = scan;
      this.renderScanResult(scan);
      this.switchTab('result');
    } catch (err) {
      alert(err.message);
    }
  }

  async deleteSingleScan(scanId) {
    if (!confirm(`Delete scan record #${scanId}?`)) return;
    try {
      const resp = await fetch(`/api/scans/${scanId}`, { method: 'DELETE' });
      if (resp.ok) {
        this.loadHistory();
        this.showToast(`Deleted #${scanId}`);
      }
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  }

  async clearAllHistory() {
    if (!confirm("Delete all inspection logs? This cannot be undone.")) return;
    try {
      const resp = await fetch('/api/scans', { method: 'DELETE' });
      if (resp.ok) {
        this.loadHistory();
        this.showToast("All logs cleared");
      }
    } catch (err) {
      alert("Clear error: " + err.message);
    }
  }

  showToast(msg) {
    if (!this.toast) return;
    this.toast.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2800);
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new LMScannerApp();
});
