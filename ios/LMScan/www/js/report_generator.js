/**
 * Formal Legal Metrology Inspection Certificate & Export Engine
 */

window.ReportGenerator = {
  async printCertificate(scanData) {
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanData)
      });
      if (!res.ok) throw new Error("Could not generate report");
      const data = await res.json();

      // Use hidden iframe to avoid popup blocker on iOS Safari / Android Chrome / WebViews
      let iframe = document.getElementById('report-print-iframe');
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'report-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(data.html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 500);
    } catch (err) {
      console.error("Report print error:", err);
      window.print();
    }
  },

  exportJSON(scanData) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `LM_Audit_Report_${scanData.id || 'scan'}.json`);
    dlAnchorElem.click();
  },

  exportCSV(scansList) {
    if (!scansList || scansList.length === 0) {
      alert("No scans available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Product Name,Brand,Status,Rules Passed,Total Score %,Critical Violations,Date,Summary\n";

    scansList.forEach(s => {
      const row = [
        s.id,
        `"${(s.productName || '').replace(/"/g, '""')}"`,
        `"${(s.brandName || '').replace(/"/g, '""')}"`,
        s.status,
        `${s.presentCount}/6`,
        s.totalScore,
        s.criticalViolations || 0,
        `"${s.createdAt}"`,
        `"${(s.summary || '').replace(/"/g, '""')}"`
      ];
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Legal_Metrology_Audit_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
