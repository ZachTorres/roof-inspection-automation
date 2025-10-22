'use client';

import { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { InspectionData, ReportData } from '@/lib/types';
import { showToast } from '@/lib/toast';

interface ReportGeneratorProps {
  inspectionData: InspectionData;
  onNext: (reportData: ReportData) => void;
  onBack: () => void;
}

export default function ReportGenerator({ inspectionData, onNext, onBack }: ReportGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  // Cleanup URL on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (reportUrl) {
        URL.revokeObjectURL(reportUrl);
      }
    };
  }, [reportUrl]);

  const generatePDF = async () => {
    setGenerating(true);

    try {
      const doc = new jsPDF();
      const { customerInfo, analysis, photos } = inspectionData;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('ROOF INSPECTION REPORT', 105, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Report Date: ${format(new Date(), 'MMMM dd, yyyy')}`, 105, 28, { align: 'center' });

      // Customer Information
      let yPos = 45;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('CUSTOMER INFORMATION', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${customerInfo?.name || 'N/A'}`, 20, yPos);
      yPos += 6;
      doc.text(`Address: ${customerInfo?.address || 'N/A'}`, 20, yPos);
      yPos += 6;
      doc.text(`Phone: ${customerInfo?.phone || 'N/A'}`, 20, yPos);
      yPos += 6;
      doc.text(`Email: ${customerInfo?.email || 'N/A'}`, 20, yPos);
      yPos += 6;
      doc.text(`Inspection Date: ${customerInfo?.inspectionDate || 'N/A'}`, 20, yPos);
      if (customerInfo?.claimNumber) {
        yPos += 6;
        doc.text(`Claim Number: ${customerInfo.claimNumber}`, 20, yPos);
      }

      // Summary
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INSPECTION SUMMARY', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Findings: ${analysis?.damageItems?.length || 0}`, 20, yPos);
      yPos += 6;
      doc.text(`Total Estimated Cost: $${analysis?.totalEstimate?.toLocaleString() || '0'}`, 20, yPos);
      yPos += 6;
      doc.text(`Photos Documented: ${photos?.length || 0}`, 20, yPos);

      // Damage Findings
      yPos += 15;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DAMAGE FINDINGS', 20, yPos);

      analysis?.damageItems?.forEach((item: any, index: number) => {
        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 10;
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${item.category} - ${item.severity.toUpperCase()}`, 20, yPos);

        yPos += 6;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Location: ${item.location}`, 25, yPos);

        yPos += 5;
        const descLines = doc.splitTextToSize(item.description, 160);
        doc.text(descLines, 25, yPos);
        yPos += descLines.length * 5;

        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text(`Estimated Cost: $${item.estimatedCost.toLocaleString()}`, 25, yPos);
        doc.setFont('helvetica', 'normal');

        yPos += 8;
      });

      // Recommendations
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 10;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RECOMMENDATIONS', 20, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const recommendations = [
        'Address all severe and moderate damage items within 30 days to prevent further deterioration.',
        'Schedule regular roof inspections annually to catch issues early.',
        'Consider comprehensive roof maintenance program for long-term protection.',
        'File insurance claim promptly if damage is covered under policy.',
      ];

      recommendations.forEach((rec) => {
        const recLines = doc.splitTextToSize(`• ${rec}`, 170);
        doc.text(recLines, 20, yPos);
        yPos += recLines.length * 6 + 2;
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text(
          'This report is for insurance claim documentation purposes. Professional installation recommended.',
          105,
          285,
          { align: 'center' }
        );
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }

      // Save PDF
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      setReportUrl(url);
      setReportGenerated(true);
      setGenerating(false);

      // Save report data
      const reportData = {
        reportUrl: url,
        generatedDate: new Date().toISOString(),
        reportFileName: `roof-inspection-${customerInfo?.name?.replace(/\s+/g, '-') || 'report'}-${Date.now()}.pdf`,
      };

      showToast('PDF report generated successfully', 'success');
      return reportData;
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Error generating report. Please try again.', 'error');
      setGenerating(false);
      return null;
    }
  };

  const handleGenerate = async () => {
    const reportData = await generatePDF();
    if (reportData) {
      onNext(reportData);
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = reportUrl;
    link.download = `roof-inspection-${inspectionData.customerInfo?.name?.replace(/\s+/g, '-') || 'report'}.pdf`;
    link.click();
  };

  return (
    <div className="bg-white dark:bg-uc-navy-light rounded-lg shadow-xl p-8 border border-uc-blue/10">
      <h2 className="text-2xl font-bold mb-6 text-uc-navy dark:text-white">
        Step 3: Generate Professional Report
      </h2>

      {!reportGenerated ? (
        <>
          {/* Report Preview */}
          <div className="bg-slate-50 dark:bg-uc-navy rounded-lg p-6 mb-6 border border-uc-blue/20">
            <h3 className="text-lg font-semibold mb-4 text-uc-navy dark:text-white">
              Report Contents
            </h3>
            <ul className="space-y-2 text-uc-navy dark:text-slate-300">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Customer information and property details
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Comprehensive damage findings ({inspectionData.analysis?.damageItems?.length || 0} items)
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Detailed cost estimates (${inspectionData.analysis?.totalEstimate?.toLocaleString() || '0'})
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Professional recommendations
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Insurance-ready formatting
              </li>
            </ul>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Professional Report...
              </span>
            ) : (
              'Generate PDF Report'
            )}
          </button>

          <div className="flex justify-between mt-6">
            <button
              onClick={onBack}
              className="bg-slate-300 hover:bg-slate-400 text-uc-navy font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Back
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Success Message */}
          <div className="text-center py-8">
            <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-uc-navy dark:text-white mb-2">
              Report Generated Successfully!
            </h3>
            <p className="text-uc-navy/70 dark:text-slate-400 mb-6">
              Your professional inspection report is ready for download
            </p>

            <div className="flex justify-center gap-4 mb-8">
              <button
                onClick={downloadPDF}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Download PDF Report
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="bg-slate-300 hover:bg-slate-400 text-uc-navy font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => onNext({})}
              className="bg-uc-blue hover:bg-uc-blue-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
            >
              Next: Track Claim
            </button>
          </div>
        </>
      )}
    </div>
  );
}
