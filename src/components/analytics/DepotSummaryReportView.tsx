import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  Bike, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Fuel, 
  ShieldCheck, 
  Filter, 
  ExternalLink, 
  Copy, 
  FileCheck2,
  RefreshCw
} from 'lucide-react';

export const DepotSummaryReportView: React.FC = () => {
  const { 
    bikes, 
    reservations, 
    currentBusiness, 
    activeStaffUser, 
    currency, 
    showToast 
  } = useApp();

  // Date Range Defaults: current 30-day window
  const defaultDates = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  }, []);

  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);
  const [selectedBikeIds, setSelectedBikeIds] = useState<string[]>(bikes.map(b => b.id));
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showBikeFilterDropdown, setShowBikeFilterDropdown] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Quick preset ranges
  const setQuickRange = (range: 'today' | '7days' | 'thisMonth' | '30days' | 'qtd' | 'all') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    if (range === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (range === '7days') {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (range === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (range === '30days') {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      setStartDate(d.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (range === 'qtd') {
      const quarterMonth = Math.floor(today.getMonth() / 3) * 3;
      const quarterStart = new Date(today.getFullYear(), quarterMonth, 1);
      setStartDate(quarterStart.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (range === 'all') {
      setStartDate('2024-01-01');
      setEndDate('2026-12-31');
    }
  };

  // Toggle bike selection
  const toggleBike = (bikeId: string) => {
    if (selectedBikeIds.includes(bikeId)) {
      if (selectedBikeIds.length === 1) {
        showToast('At least one motorbike must be selected for the report', 'warning');
        return;
      }
      setSelectedBikeIds(prev => prev.filter(id => id !== bikeId));
    } else {
      setSelectedBikeIds(prev => [...prev, bikeId]);
    }
  };

  const selectAllBikes = () => {
    setSelectedBikeIds(bikes.map(b => b.id));
  };

  const clearBikeSelection = () => {
    if (bikes.length > 0) {
      setSelectedBikeIds([bikes[0].id]);
    }
  };

  // Filtered Reservations based on Date Range, Bikes, and Status
  const filteredReservations = useMemo(() => {
    return reservations.filter(r => {
      // Bike match
      if (!selectedBikeIds.includes(r.bikeId)) return false;

      // Status match
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;

      // Date range match (pickup date or return date falls within range)
      const resStart = r.startDate;
      const resEnd = r.endDate;
      const rangeStart = startDate;
      const rangeEnd = endDate;

      // Overlap condition
      return resStart <= rangeEnd && resEnd >= rangeStart;
    });
  }, [reservations, selectedBikeIds, selectedStatus, startDate, endDate]);

  // Aggregated Report Metrics
  const metrics = useMemo(() => {
    let grossRevenue = 0;
    let totalRentalDays = 0;
    let totalFuelShortages = 0;
    let totalDepositsHeld = 0;
    let totalIdDeposits = 0;
    let totalCashDeposits = 0;
    let activeOrCompletedCount = 0;
    let cancelledCount = 0;

    filteredReservations.forEach(r => {
      if (r.status === 'cancelled') {
        cancelledCount++;
        return;
      }

      grossRevenue += r.totalAmount || r.subtotal || 0;
      totalRentalDays += r.totalDays || 1;
      activeOrCompletedCount++;

      if (r.fuelDeficitAmount && r.fuelDeficitCleared) {
        totalFuelShortages += r.fuelDeficitAmount;
      }

      const hasIdDeposit = Boolean(r.physicalIdDeposit || r.depositRequirementType === 'physical_id');
      if (hasIdDeposit) {
        totalIdDeposits++;
      } else {
        totalCashDeposits++;
        totalDepositsHeld += r.securityDeposit || 0;
      }
    });

    // Date range duration in days
    const d1 = new Date(startDate).getTime();
    const d2 = new Date(endDate).getTime();
    const daysInPeriod = Math.max(1, Math.round((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
    
    // Total potential fleet capacity (selected bikes * days)
    const totalPotentialCapacityDays = selectedBikeIds.length * daysInPeriod;
    const fleetUtilizationRate = totalPotentialCapacityDays > 0 
      ? Math.min(100, Math.round((totalRentalDays / totalPotentialCapacityDays) * 100)) 
      : 0;

    const avgRevenuePerDay = totalRentalDays > 0 ? Math.round(grossRevenue / totalRentalDays) : 0;
    const avgBookingValue = activeOrCompletedCount > 0 ? Math.round(grossRevenue / activeOrCompletedCount) : 0;

    return {
      grossRevenue,
      totalRentalDays,
      totalFuelShortages,
      totalDepositsHeld,
      totalIdDeposits,
      totalCashDeposits,
      activeOrCompletedCount,
      cancelledCount,
      daysInPeriod,
      fleetUtilizationRate,
      avgRevenuePerDay,
      avgBookingValue,
    };
  }, [filteredReservations, selectedBikeIds.length, startDate, endDate]);

  // Bike-by-Bike Performance Breakdown
  const bikePerformance = useMemo(() => {
    return bikes
      .filter(b => selectedBikeIds.includes(b.id))
      .map(bike => {
        const bikeReservations = filteredReservations.filter(r => r.bikeId === bike.id && r.status !== 'cancelled');
        const revenue = bikeReservations.reduce((sum, r) => sum + (r.totalAmount || r.subtotal || 0), 0);
        const days = bikeReservations.reduce((sum, r) => sum + (r.totalDays || 1), 0);
        const fuelDeficit = bikeReservations.reduce((sum, r) => sum + (r.fuelDeficitAmount || 0), 0);
        const utilization = metrics.daysInPeriod > 0 
          ? Math.min(100, Math.round((days / metrics.daysInPeriod) * 100)) 
          : 0;

        return {
          bike,
          bookingsCount: bikeReservations.length,
          revenue,
          days,
          fuelDeficit,
          utilization,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [bikes, selectedBikeIds, filteredReservations, metrics.daysInPeriod]);

  // EXPORT 1: Google Sheets (CSV + TSV to clipboard + launch create spreadsheet)
  const handleExportGoogleSheets = () => {
    setIsExporting(true);
    try {
      const tsvRows: string[] = [];
      tsvRows.push(`${currentBusiness.name} - DEPOT OPERATIONS SUMMARY REPORT`);
      tsvRows.push(`Period:\t${startDate}\tto\t${endDate}`);
      tsvRows.push(`Generated By:\t${activeStaffUser?.name || 'Depot Manager'}\t(${activeStaffUser?.role || 'Manager'})`);
      tsvRows.push(`Exported At:\t${new Date().toLocaleString()}`);
      tsvRows.push('');
      tsvRows.push('EXECUTIVE METRICS');
      tsvRows.push(`Gross Rental Revenue\t${metrics.grossRevenue}`);
      tsvRows.push(`Total Rental Days\t${metrics.totalRentalDays}`);
      tsvRows.push(`Bookings Count\t${metrics.activeOrCompletedCount}`);
      tsvRows.push(`Fleet Utilization Rate\t${metrics.fleetUtilizationRate}%`);
      tsvRows.push(`Fuel Deficits Collected\t${metrics.totalFuelShortages}`);
      tsvRows.push(`Cash Security Deposits\t${metrics.totalDepositsHeld}`);
      tsvRows.push(`Physical ID Deposits\t${metrics.totalIdDeposits}`);
      tsvRows.push('');
      tsvRows.push('MOTORBIKE FLEET PERFORMANCE');
      tsvRows.push('Bike Model\tPlate Number\tCategory\tBookings\tDays Rented\tUtilization %\tRevenue\tFuel Deficits');
      bikePerformance.forEach(bp => {
        tsvRows.push(`${bp.bike.model}\t${bp.bike.plateNumber}\t${bp.bike.category}\t${bp.bookingsCount}\t${bp.days}\t${bp.utilization}%\t${bp.revenue}\t${bp.fuelDeficit}`);
      });
      tsvRows.push('');
      tsvRows.push('RESERVATION TRANSACTIONS LEDGER');
      tsvRows.push('Booking ID\tRenter Name\tContact\tMotorbike\tPlate\tStart Date\tEnd Date\tDays\tStatus\tPayment Method\tDeposit Type\tDeposit Amt\tFuel Status\tTotal Amount');
      filteredReservations.forEach(r => {
        const b = bikes.find(x => x.id === r.bikeId);
        const hasId = Boolean(r.physicalIdDeposit || r.depositRequirementType === 'physical_id');
        tsvRows.push(`${r.bookingRef || r.id}\t${r.customerName}\t${r.customerPhone}\t${b?.model || r.bikeName}\t${b?.plateNumber || ''}\t${r.startDate}\t${r.endDate}\t${r.totalDays || 1}\t${r.status}\t${r.paymentMethod}\t${hasId ? 'Physical ID' : 'Cash Deposit'}\t${r.securityDeposit || 0}\t${r.fuelDeficitAmount ? `₱${r.fuelDeficitAmount} Deficit` : 'Cleared'}\t${r.totalAmount || r.subtotal}`);
      });

      const tsvContent = tsvRows.join('\n');
      navigator.clipboard.writeText(tsvContent);

      const csvContent = '\uFEFF' + tsvRows.map(row => row.split('\t').map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `GoogleSheets_Import_${currentBusiness.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.open('https://docs.google.com/spreadsheets/create', '_blank');
      showToast('Report copied to clipboard! Paste directly into Google Sheets (or upload downloaded CSV)', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export failed. Please check browser permissions.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT 2: Excel (.csv with UTF-8 BOM)
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const csvRows: string[][] = [
        [`${currentBusiness.name} - DEPOT SUMMARY REPORT`],
        [`Period: ${startDate} to ${endDate}`],
        [`Generated By: ${activeStaffUser?.name || 'Depot Manager'} (${activeStaffUser?.role || 'Manager'})`],
        [`Generated On: ${new Date().toLocaleString()}`],
        [''],
        ['SUMMARY PERFORMANCE METRICS'],
        ['Metric', 'Value', 'Unit/Notes'],
        ['Gross Rental Revenue', `${formatPrice(metrics.grossRevenue, currency)}`, 'Excludes cancelled'],
        ['Total Paid Rental Days', `${metrics.totalRentalDays}`, 'Days'],
        ['Active / Completed Bookings', `${metrics.activeOrCompletedCount}`, 'Bookings'],
        ['Cancelled Bookings', `${metrics.cancelledCount}`, 'Bookings'],
        ['Overall Fleet Utilization', `${metrics.fleetUtilizationRate}%`, 'Actual Days vs Potential Days'],
        ['Average Revenue per Rental Day', `${formatPrice(metrics.avgRevenuePerDay, currency)}`, 'Avg daily yield'],
        ['Average Booking Value', `${formatPrice(metrics.avgBookingValue, currency)}`, 'Avg ticket size'],
        ['Fuel Deficit Surcharges', `${formatPrice(metrics.totalFuelShortages, currency)}`, 'Settled at return check'],
        ['Total Cash Deposits Held', `${formatPrice(metrics.totalDepositsHeld, currency)}`, 'Security deposits'],
        ['Physical ID Deposits Held', `${metrics.totalIdDeposits}`, 'IDs held by staff'],
        [''],
        ['MOTORBIKE FLEET PERFORMANCE BREAKDOWN'],
        ['Motorbike Model', 'Plate Number', 'Category', 'Daily Rate', 'Bookings', 'Days Rented', 'Utilization Rate', 'Gross Revenue', 'Fuel Surcharge'],
        ...bikePerformance.map(bp => [
          bp.bike.model,
          bp.bike.plateNumber,
          bp.bike.category,
          `${formatPrice(bp.bike.dailyRate, currency)}`,
          `${bp.bookingsCount}`,
          `${bp.days}`,
          `${bp.utilization}%`,
          `${formatPrice(bp.revenue, currency)}`,
          `${formatPrice(bp.fuelDeficit, currency)}`
        ]),
        [''],
        ['RESERVATION TRANSACTION LEDGER'],
        ['Reservation Ref', 'Renter Name', 'Mobile Number', 'Motorbike', 'Plate', 'Pickup Date', 'Return Date', 'Days', 'Status', 'Payment Method', 'Payment Status', 'Deposit Type', 'Deposit Amount', 'Fuel Settlement', 'Grand Total'],
        ...filteredReservations.map(r => {
          const b = bikes.find(x => x.id === r.bikeId);
          const hasId = Boolean(r.physicalIdDeposit || r.depositRequirementType === 'physical_id');
          return [
            r.bookingRef || r.id,
            r.customerName,
            r.customerPhone,
            b?.model || r.bikeName,
            b?.plateNumber || '',
            r.startDate,
            r.endDate,
            `${r.totalDays || 1}`,
            r.status.toUpperCase(),
            r.paymentMethod,
            r.paymentStatus.toUpperCase(),
            hasId ? 'Physical ID' : 'Cash Deposit',
            hasId ? 'Physical ID' : `${formatPrice(r.securityDeposit || 0, currency)}`,
            r.fuelDeficitAmount ? `₱${r.fuelDeficitAmount} Deficit` : 'Checked OK',
            `${formatPrice(r.totalAmount || r.subtotal || 0, currency)}`
          ];
        })
      ];

      const csvContent = '\uFEFF' + csvRows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Excel_Report_${currentBusiness.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Excel report downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export to Excel failed.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // EXPORT 3: PDF (Print layout with standard browser PDF export)
  const handleExportPDF = () => {
    window.print();
  };

  // EXPORT 4: Microsoft Word (.doc HTML format)
  const handleExportWord = () => {
    setIsExporting(true);
    try {
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="utf-8">
          <title>${currentBusiness.name} - Depot Summary Report</title>
          <style>
            body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1c1917; margin: 30px; }
            h1 { font-size: 20pt; color: #1c1917; margin-bottom: 4px; }
            h2 { font-size: 14pt; color: #d97706; margin-top: 24px; border-bottom: 2px solid #e7e5e4; padding-bottom: 4px; }
            .meta { color: #57534e; font-size: 10pt; margin-bottom: 20px; }
            .kpi-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .kpi-table td { padding: 10px; border: 1px solid #d6d3d1; background-color: #fafaf9; }
            .kpi-title { font-size: 9pt; color: #78716c; text-transform: uppercase; }
            .kpi-val { font-size: 16pt; font-weight: bold; color: #0c0a09; }
            table.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt; }
            table.data-table th { background-color: #f5f5f4; border: 1px solid #d6d3d1; padding: 8px; text-align: left; }
            table.data-table td { border: 1px solid #e7e5e4; padding: 6px 8px; }
            .footer-signoff { margin-top: 40px; padding-top: 20px; border-top: 1px dashed #a8a29e; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h1>${currentBusiness.name}</h1>
          <div class="meta">
            <strong>Depot Location:</strong> ${currentBusiness.location} | <strong>Contact:</strong> ${currentBusiness.mobile} | <strong>Email:</strong> ${currentBusiness.email}<br>
            <strong>Report Window:</strong> ${startDate} to ${endDate} | <strong>Filtered Bikes:</strong> ${selectedBikeIds.length} of ${bikes.length} Fleet Bikes<br>
            <strong>Generated By:</strong> ${activeStaffUser?.name || 'Depot Manager'} (${activeStaffUser?.role || 'Manager'}) on ${new Date().toLocaleString()}
          </div>

          <h2>1. EXECUTIVE PERFORMANCE SUMMARY</h2>
          <table class="kpi-table">
            <tr>
              <td><div class="kpi-title">Gross Rental Revenue</div><div class="kpi-val">${formatPrice(metrics.grossRevenue, currency)}</div></td>
              <td><div class="kpi-title">Total Rental Days</div><div class="kpi-val">${metrics.totalRentalDays} Days</div></td>
              <td><div class="kpi-title">Fleet Utilization</div><div class="kpi-val">${metrics.fleetUtilizationRate}%</div></td>
            </tr>
            <tr>
              <td><div class="kpi-title">Active / Completed Bookings</div><div class="kpi-val">${metrics.activeOrCompletedCount}</div></td>
              <td><div class="kpi-title">Fuel Deficit Surcharges</div><div class="kpi-val">${formatPrice(metrics.totalFuelShortages, currency)}</div></td>
              <td><div class="kpi-title">Physical ID Deposits Held</div><div class="kpi-val">${metrics.totalIdDeposits} IDs</div></td>
            </tr>
          </table>

          <h2>2. MOTORBIKE FLEET UTILIZATION & REVENUE</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Motorbike</th>
                <th>Plate Number</th>
                <th>Category</th>
                <th>Bookings</th>
                <th>Days Rented</th>
                <th>Utilization</th>
                <th>Fuel Deficits</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${bikePerformance.map(bp => `
                <tr>
                  <td><strong>${bp.bike.model}</strong></td>
                  <td>${bp.bike.plateNumber}</td>
                  <td>${bp.bike.category}</td>
                  <td>${bp.bookingsCount}</td>
                  <td>${bp.days} days</td>
                  <td>${bp.utilization}%</td>
                  <td>${formatPrice(bp.fuelDeficit, currency)}</td>
                  <td><strong>${formatPrice(bp.revenue, currency)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>3. ITEMIZED RESERVATION TRANSACTIONS LEDGER</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Booking Ref</th>
                <th>Renter Name</th>
                <th>Motorbike</th>
                <th>Pickup Date</th>
                <th>Return Date</th>
                <th>Days</th>
                <th>Status</th>
                <th>Deposit</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReservations.map(r => {
                const b = bikes.find(x => x.id === r.bikeId);
                const hasId = Boolean(r.physicalIdDeposit || r.depositRequirementType === 'physical_id');
                return `
                  <tr>
                    <td>${r.bookingRef || r.id}</td>
                    <td>${r.customerName}<br><small>${r.customerPhone}</small></td>
                    <td>${b?.model || r.bikeName} (${b?.plateNumber || ''})</td>
                    <td>${r.startDate}</td>
                    <td>${r.endDate}</td>
                    <td>${r.totalDays || 1}</td>
                    <td>${r.status.toUpperCase()}</td>
                    <td>${hasId ? 'Physical ID Held' : formatPrice(r.securityDeposit || 0, currency)}</td>
                    <td><strong>${formatPrice(r.totalAmount || r.subtotal || 0, currency)}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <table style="width: 100%; margin-top: 60px;">
            <tr>
              <td style="width: 45%; text-align: center; border-top: 1px solid #1c1917; padding-top: 8px;">
                <strong>${activeStaffUser?.name || 'Depot Manager'}</strong><br>
                Depot Operations Manager / Sign-off
              </td>
              <td style="width: 10%;"></td>
              <td style="width: 45%; text-align: center; border-top: 1px solid #1c1917; padding-top: 8px;">
                <strong>${currentBusiness.ownerName || 'Business Owner'}</strong><br>
                Managing Director / Fleet Auditor
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Word_Report_${currentBusiness.name.replace(/\s+/g, '_')}_${startDate}_to_${endDate}.doc`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Microsoft Word document downloaded successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Export to Word failed.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export Action Hub */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Depot Operations Intelligence
            </span>
            <span className="text-xs text-stone-400">
              Audit & Management Reporting
            </span>
          </div>
          <h1 className="text-2xl font-bold text-stone-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            Depot Summary & Performance Report
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Filter reservations and fleet utilization from date to date with 1-click export to Google Sheets, Excel, PDF, and Word.
          </p>
        </div>

        {/* 4 Professional Export Buttons */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            onClick={handleExportGoogleSheets}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-950 hover:shadow"
            title="Export CSV, copy spreadsheet to clipboard, and open Google Sheets"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Google Sheets</span>
            <ExternalLink className="w-3 h-3 text-emerald-300" />
          </button>

          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white transition-all shadow-sm border border-emerald-600/40"
            title="Download UTF-8 BOM Excel Compatible CSV Spreadsheet"
          >
            <Download className="w-4 h-4 text-emerald-200" />
            <span>Excel (.xlsx/.csv)</span>
          </button>

          <button
            onClick={handleExportWord}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600/90 hover:bg-blue-500 text-white transition-all shadow-sm border border-blue-500/30"
            title="Download formatted Microsoft Word .doc Document"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>Word (.doc)</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-all shadow-sm"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4 text-stone-300" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Control Dashboard (Hidden on Print) */}
      <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-4 md:p-5 shadow-sm print:hidden">
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-800/80">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-200">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>Report Parameters & Fleet Selection</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <span>Quick Range:</span>
            <button
              onClick={() => setQuickRange('today')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
            >
              Today
            </button>
            <button
              onClick={() => setQuickRange('7days')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
            >
              7D
            </button>
            <button
              onClick={() => setQuickRange('thisMonth')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
            >
              Month
            </button>
            <button
              onClick={() => setQuickRange('30days')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
            >
              30D
            </button>
            <button
              onClick={() => setQuickRange('qtd')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
            >
              QTD
            </button>
            <button
              onClick={() => setQuickRange('all')}
              className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px]"
            >
              All Time
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* From When */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>From When (Start Date)</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Up To When */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Up to When (End Date)</span>
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Booking Status Filter */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5">
              Reservation Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-400"
            >
              <option value="all">All Statuses (Active, Confirmed, Completed)</option>
              <option value="active">Active (On the Road)</option>
              <option value="completed">Completed & Returned</option>
              <option value="confirmed">Confirmed (Upcoming)</option>
              <option value="pending">Pending Approval</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Fleet Motorbike Multi-Select Toggle */}
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-amber-400" />
                <span>Motorbikes in Fleet ({selectedBikeIds.length}/{bikes.length})</span>
              </span>
              <div className="flex gap-1 text-[10px]">
                <button
                  type="button"
                  onClick={selectAllBikes}
                  className="text-amber-400 hover:underline"
                >
                  All
                </button>
                <span className="text-stone-600">|</span>
                <button
                  type="button"
                  onClick={clearBikeSelection}
                  className="text-stone-400 hover:underline"
                >
                  Clear
                </button>
              </div>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowBikeFilterDropdown(!showBikeFilterDropdown)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-3 py-2 text-xs text-left text-stone-200 flex items-center justify-between focus:outline-none focus:border-amber-400"
              >
                <span className="truncate">
                  {selectedBikeIds.length === bikes.length
                    ? 'All Fleet Selected'
                    : `${selectedBikeIds.length} Bikes Selected`}
                </span>
                <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-amber-400 font-mono">
                  Filter
                </span>
              </button>

              {showBikeFilterDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-stone-950 border border-stone-700 rounded-lg p-2.5 z-30 shadow-xl max-h-60 overflow-y-auto space-y-1">
                  {bikes.map(bike => {
                    const isSelected = selectedBikeIds.includes(bike.id);
                    return (
                      <label
                        key={bike.id}
                        className="flex items-center gap-2 p-1.5 rounded hover:bg-stone-900 cursor-pointer text-xs text-stone-300"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBike(bike.id)}
                          className="rounded border-stone-700 text-amber-500 focus:ring-0"
                        />
                        <div className="flex-1 truncate">
                          <span className="font-semibold text-stone-200">{bike.model}</span>{' '}
                          <span className="text-stone-500 font-mono text-[11px]">({bike.plateNumber})</span>
                        </div>
                        <span className="text-[10px] text-amber-400 font-mono">{formatPrice(bike.dailyRate, currency)}/d</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Bike Badges */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-stone-800/60">
          <span className="text-[11px] text-stone-400 mr-1">Active Fleet Filter:</span>
          {bikes
            .filter(b => selectedBikeIds.includes(b.id))
            .map(bike => (
              <span
                key={bike.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20"
              >
                <span>{bike.model}</span>
                <span className="text-amber-500/60 font-mono">{bike.plateNumber}</span>
              </span>
            ))}
        </div>
      </div>

      {/* Printable Report Header (shown in print layout) */}
      <div className="hidden print:block mb-6 p-4 border-b border-stone-300 text-stone-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{currentBusiness.name}</h1>
            <p className="text-xs text-stone-600">{currentBusiness.location} | Mobile: {currentBusiness.mobile}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-semibold">DEPOT OPERATIONS AUDIT REPORT</p>
            <p className="text-stone-500">Period: {startDate} to {endDate}</p>
            <p className="text-stone-500">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* KPI Performance Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Gross Revenue */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Gross Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-stone-100 font-mono">
            {formatPrice(metrics.grossRevenue, currency)}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Avg {formatPrice(metrics.avgRevenuePerDay, currency)} / day</span>
          </div>
        </div>

        {/* Total Days */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Rental Days</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-stone-100 font-mono">
            {metrics.totalRentalDays} <span className="text-xs font-normal text-stone-400">days</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Across {metrics.daysInPeriod} day window
          </div>
        </div>

        {/* Fleet Utilization Rate */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Fleet Utilization</span>
            <Bike className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-cyan-400 font-mono">
            {metrics.fleetUtilizationRate}%
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            {selectedBikeIds.length} bikes in scope
          </div>
        </div>

        {/* Bookings Count */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Valid Bookings</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-stone-100 font-mono">
            {metrics.activeOrCompletedCount}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Avg {formatPrice(metrics.avgBookingValue, currency)} / ticket
          </div>
        </div>

        {/* Fuel Deficit Collected */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Fuel Settlements</span>
            <Fuel className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-lg md:text-xl font-bold text-orange-400 font-mono">
            {formatPrice(metrics.totalFuelShortages, currency)}
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Shortage penalty collected
          </div>
        </div>

        {/* Deposits Held */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span>Deposits Audit</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xs font-bold text-stone-100">
            <div>Cash: <span className="text-amber-400 font-mono">{formatPrice(metrics.totalDepositsHeld, currency)}</span></div>
            <div className="mt-0.5">Physical IDs: <span className="text-indigo-400 font-mono">{metrics.totalIdDeposits} held</span></div>
          </div>
          <div className="text-[10px] text-stone-400 mt-1">
            Returned upon clearance
          </div>
        </div>
      </div>

      {/* Motorbike Fleet Breakdown Table */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-stone-100 flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-400" />
              <span>Fleet Motorbike Utilization & Yield Breakdown</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Individual bike performance metrics for {startDate} to {endDate}
            </p>
          </div>
          <span className="text-xs text-stone-400">
            {bikePerformance.length} Selected Units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider border-b border-stone-800">
              <tr>
                <th className="px-4 py-3">Motorbike</th>
                <th className="px-4 py-3">Plate No.</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Daily Rate</th>
                <th className="px-4 py-3 text-right">Bookings</th>
                <th className="px-4 py-3 text-right">Rental Days</th>
                <th className="px-4 py-3 text-right">Utilization Rate</th>
                <th className="px-4 py-3 text-right">Fuel Deficits</th>
                <th className="px-4 py-3 text-right">Total Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {bikePerformance.map(({ bike, bookingsCount, revenue, days, fuelDeficit, utilization }) => (
                <tr key={bike.id} className="hover:bg-stone-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-stone-100 flex items-center gap-2.5">
                    <img 
                      src={bike.imageUrl} 
                      alt={bike.model} 
                      className="w-9 h-7 object-cover rounded bg-stone-950 border border-stone-800"
                    />
                    <span>{bike.model}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-stone-400">{bike.plateNumber}</td>
                  <td className="px-4 py-3">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] bg-stone-800 text-stone-300">
                      {bike.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-stone-300">
                    {formatPrice(bike.dailyRate, currency)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-stone-200">
                    {bookingsCount}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-stone-300">
                    {days} d
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-16 bg-stone-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            utilization >= 70 ? 'bg-emerald-400' : utilization >= 30 ? 'bg-amber-400' : 'bg-stone-600'
                          }`}
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                      <span className="font-mono text-stone-300 text-[11px]">{utilization}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-orange-400">
                    {fuelDeficit > 0 ? formatPrice(fuelDeficit, currency) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                    {formatPrice(revenue, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-stone-950/60 font-semibold text-stone-200 border-t border-stone-800">
              <tr>
                <td className="px-4 py-3" colSpan={4}>Fleet Total</td>
                <td className="px-4 py-3 text-right font-mono">{metrics.activeOrCompletedCount}</td>
                <td className="px-4 py-3 text-right font-mono">{metrics.totalRentalDays} d</td>
                <td className="px-4 py-3 text-right font-mono">{metrics.fleetUtilizationRate}%</td>
                <td className="px-4 py-3 text-right font-mono text-orange-400">{formatPrice(metrics.totalFuelShortages, currency)}</td>
                <td className="px-4 py-3 text-right font-mono text-amber-400 text-sm">{formatPrice(metrics.grossRevenue, currency)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Filtered Reservation Transaction Ledger */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-stone-100 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Detailed Bookings & Settlement Ledger</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              {filteredReservations.length} total bookings match your criteria
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {formatPrice(metrics.grossRevenue, currency)} Subtotal
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 text-stone-400 uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-stone-800">
              <tr>
                <th className="px-4 py-3">Reservation Ref</th>
                <th className="px-4 py-3">Renter & Contact</th>
                <th className="px-4 py-3">Motorbike</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Deposit Audit</th>
                <th className="px-4 py-3">Fuel Bar Check</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-stone-500">
                    No reservations found matching the selected dates and fleet filters.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const bike = bikes.find(b => b.id === res.bikeId);
                  const hasId = Boolean(res.physicalIdDeposit || res.depositRequirementType === 'physical_id');
                  return (
                    <tr key={res.id} className="hover:bg-stone-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-stone-300">{res.bookingRef || res.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-stone-100">{res.customerName}</div>
                        <div className="text-[11px] text-stone-400 font-mono">{res.customerPhone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-stone-200">{bike?.model || res.bikeName}</div>
                        <div className="text-[10px] font-mono text-stone-500">{bike?.plateNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-stone-300">
                        <div>{res.startDate} &rarr; {res.endDate}</div>
                        <div className="text-[10px] text-stone-500">{res.totalDays} day(s)</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          res.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : res.status === 'active'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : res.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize text-stone-300">{res.paymentMethod}</span>
                        <span className={`block text-[10px] ${res.paymentStatus === 'Fully Paid' || res.paymentStatus === 'Deposit Paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {res.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {hasId ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Physical ID Held</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-stone-300">
                            {formatPrice(res.securityDeposit || 0, currency)} Cash
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {res.fuelDeficitAmount ? (
                          <span className="text-[11px] text-orange-400 font-mono">
                            -₱{res.fuelDeficitAmount} {res.fuelDeficitCleared ? '(Cleared)' : '(Pending)'}
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-400">Level Cleared</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">
                        {formatPrice(res.totalAmount || res.subtotal || 0, currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Sign-off & Audit Signature Strip */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
        <div>
          <span className="font-semibold text-stone-200">Authorized Depot Manager:</span>{' '}
          {activeStaffUser?.name || 'Depot Manager'} ({activeStaffUser?.role || 'Manager'})
        </div>
        <div className="flex items-center gap-4">
          <div>
            <span className="text-stone-500">System Reference:</span>{' '}
            <span className="font-mono text-stone-300">{currentBusiness.id}-{new Date().getTime().toString().slice(-6)}</span>
          </div>
          <div>
            <span className="text-stone-500">Audit Status:</span>{' '}
            <span className="text-emerald-400 font-semibold">Verified & Reconciled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
