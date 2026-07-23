import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import './AssessmentList.css';

const AssessmentList = ({ onViewDetail }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/assessments', {
        credentials: 'include'
      });
      if (res.status === 401 || res.status === 403) {
        window.location.reload();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch data');
      const result = await res.json();
      setData(result || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    if (data.length === 0) return;
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assessments");
    
    // Extract format and keys
    const keys = Object.keys(data[0] || {});
    const headers = keys.map(key => key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    
    worksheet.columns = keys.map((key, i) => ({
      header: headers[i],
      key: key,
      width: Math.max(headers[i].length + 5, 20)
    }));
    
    // Add Data
    worksheet.addRows(data);
    
    // Style the Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF18459D' }
      };
      cell.font = {
        name: 'Poppins',
        color: { argb: 'FFFFFFFF' },
        bold: true,
        size: 11
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
    
    // Style Data Rows
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      row.eachCell((cell) => {
        cell.font = { name: 'Poppins', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });
    
    // Generate and Download
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `ACM_Audits_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filter and Pagination logic
  const filteredData = data.filter(row => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (row.assessor && row.assessor.toLowerCase().includes(term)) ||
      (row.bus_company && row.bus_company.toLowerCase().includes(term)) ||
      (row.assessment_id && row.assessment_id.toLowerCase().includes(term)) ||
      (row.area && row.area.toLowerCase().includes(term))
    );
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(p => p - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(p => p + 1);
  };

  // Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) return <div className="loading-state">Loading assessment data...</div>;
  if (error) return <div className="alert error">Error loading data: {error}</div>;

  return (
    <div className="glass-container list-view">
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h2>Assessment Reports</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder="Search by Assessor, Company, or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              width: '250px',
              fontFamily: 'Poppins'
            }}
          />
          <button className="btn btn-primary" onClick={exportToExcel} disabled={data.length === 0}>
            Export to Excel
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {filteredData.length === 0 ? (
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
                <th>Actions</th>
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
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => onViewDetail(row)}>
                      View Details
                    </button>
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
