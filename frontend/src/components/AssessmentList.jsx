import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './AssessmentList.css';

const AssessmentList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/assessments');
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      // Assume the backend returns an array of assessments
      setData(result || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (data.length === 0) return;
    
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Auto-size columns loosely based on header names
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length + 5, 15) 
    }));
    ws['!cols'] = colWidths;

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Assessments");
    
    // Save file
    XLSX.writeFile(wb, `ACM_Audits_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  if (loading) return <div className="loading-state">Loading assessment data...</div>;
  if (error) return <div className="alert error">Error loading data: {error}</div>;

  return (
    <div className="glass-container list-view">
      <div className="list-header">
        <h2>Assessment Reports</h2>
        <button className="btn btn-primary" onClick={exportToExcel} disabled={data.length === 0}>
          Export to Excel
        </button>
      </div>

      <div className="table-responsive">
        {data.length === 0 ? (
          <p className="no-data">No assessments recorded yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID / Date</th>
                <th>Company</th>
                <th>Area</th>
                <th>Assessor</th>
                <th>Overall Perf.</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, idx) => (
                <tr key={idx}>
                  <td>
                    <strong>{row.assessment_id || 'N/A'}</strong><br/>
                    <span className="text-muted">{row.assessment_date ? new Date(row.assessment_date).toLocaleDateString() : 'N/A'}</span>
                  </td>
                  <td>{row.bus_company || 'N/A'}</td>
                  <td>{row.area || 'N/A'}</td>
                  <td>{row.assessor || 'N/A'}</td>
                  <td>
                    <span className={`badge ${row.overall_performance?.toLowerCase()}`}>
                      {row.overall_performance || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button className="btn btn-secondary" onClick={handlePrevPage} disabled={currentPage === 1}>
            Previous
          </button>
          <span className="page-info">Page {currentPage} of {totalPages}</span>
          <button className="btn btn-secondary" onClick={handleNextPage} disabled={currentPage === totalPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
