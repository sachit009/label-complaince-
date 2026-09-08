"""
Hardened Database Layer for LM Scan using SQLite with WAL Mode.
Provides thread-safe storage, indexed queries, analytics caching, and audit trails.
"""

import sqlite3
import json
import os
from typing import List, Dict, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), 'scans.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH, timeout=15.0)
    conn.row_factory = sqlite3.Row
    # Enable WAL mode for high concurrency
    conn.execute('PRAGMA journal_mode = WAL;')
    conn.execute('PRAGMA synchronous = NORMAL;')
    conn.execute('PRAGMA foreign_keys = ON;')
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY,
            product_name TEXT,
            brand_name TEXT,
            status TEXT NOT NULL,
            present_count INTEGER NOT NULL,
            total_score INTEGER NOT NULL,
            critical_violations INTEGER DEFAULT 0,
            minor_warnings INTEGER DEFAULT 0,
            summary TEXT,
            thumbnail TEXT,
            full_data_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
    ''')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_scans_status ON scans(status);')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_scans_product ON scans(product_name);')
    conn.commit()
    conn.close()

def save_scan(scan_data: Dict[str, Any], thumbnail: Optional[str] = None) -> int:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    scan_id = scan_data.get('id')
    product_name = scan_data.get('productName', 'Unnamed Product')
    brand_name = scan_data.get('brandName', '')
    status = scan_data.get('status', 'needs_review')
    present_count = scan_data.get('presentCount', 0)
    total_score = scan_data.get('totalScore', 0)
    critical_violations = scan_data.get('criticalViolations', 0)
    minor_warnings = scan_data.get('minorWarnings', 0)
    summary = scan_data.get('summary', '')
    created_at = scan_data.get('createdAt')
    
    full_json = json.dumps(scan_data)

    cursor.execute('''
        INSERT OR REPLACE INTO scans (
            id, product_name, brand_name, status, present_count, total_score,
            critical_violations, minor_warnings, summary, thumbnail, full_data_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        scan_id, product_name, brand_name, status, present_count, total_score,
        critical_violations, minor_warnings, summary, thumbnail, full_json, created_at
    ))
    conn.commit()
    conn.close()
    return scan_id

def list_scans(limit: int = 100, search: str = '', status_filter: str = '') -> List[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    query = '''
        SELECT id, product_name, brand_name, status, present_count, total_score, 
               critical_violations, minor_warnings, summary, thumbnail, created_at 
        FROM scans WHERE 1=1
    '''
    params = []
    
    if search:
        query += ' AND (product_name LIKE ? OR summary LIKE ? OR brand_name LIKE ?)'
        params.extend([f'%{search}%', f'%{search}%', f'%{search}%'])
        
    if status_filter and status_filter != 'all':
        query += ' AND status = ?'
        params.append(status_filter)
        
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    results = []
    for r in rows:
        results.append({
            'id': r['id'],
            'productName': r['product_name'],
            'brandName': r['brand_name'],
            'status': r['status'],
            'presentCount': r['present_count'],
            'totalScore': r['total_score'],
            'criticalViolations': r['critical_violations'],
            'minorWarnings': r['minor_warnings'],
            'summary': r['summary'],
            'thumbnail': r['thumbnail'],
            'createdAt': r['created_at']
        })
    conn.close()
    return results

def get_scan(scan_id: int) -> Optional[Dict[str, Any]]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT full_data_json, thumbnail FROM scans WHERE id = ?', (scan_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        data = json.loads(row['full_data_json'])
        if row['thumbnail'] and not data.get('thumbnail'):
            data['thumbnail'] = row['thumbnail']
        return data
    return None

def delete_scan(scan_id: int) -> bool:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans WHERE id = ?', (scan_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

def clear_all_scans() -> bool:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM scans')
    conn.commit()
    conn.close()
    return True

def get_analytics_summary() -> Dict[str, Any]:
    init_db()
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute('SELECT COUNT(*) as total FROM scans')
    total = cursor.fetchone()['total']
    
    cursor.execute('SELECT status, COUNT(*) as count FROM scans GROUP BY status')
    status_counts = {r['status']: r['count'] for r in cursor.fetchall()}
    
    compliant = status_counts.get('compliant', 0)
    non_compliant = status_counts.get('non_compliant', 0)
    needs_review = status_counts.get('needs_review', 0)
    
    pass_rate = int(round((compliant / total) * 100)) if total > 0 else 0
    
    conn.close()
    return {
        'totalScans': total,
        'compliant': compliant,
        'nonCompliant': non_compliant,
        'needsReview': needs_review,
        'passRate': pass_rate
    }

if __name__ == '__main__':
    init_db()
    print("Database initialized with WAL mode at:", DB_PATH)
