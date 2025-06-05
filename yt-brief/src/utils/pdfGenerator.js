import jsPDF from "jspdf";

export const generatePDF = (videoTitle, videoStats, videoSummary, setError) => {
    // Check if we have content to generate PDF
    if (!videoTitle && (!videoSummary || Object.values(videoSummary).every(arr => arr.length === 0))) {
      setError('No content available to generate PDF. Please summarize a video first.');
      return;
    }
  
    // Create a new jsPDF instance with A4 page size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    // Page width and margins
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15; // 15mm margin on all sides
    const lineHeight = 7; // Consistent line height
  
    // Colors
    const headerColor = [31, 41, 55]; // Dark blue-gray
    const textColor = [55, 65, 81]; // Slightly lighter gray
    const accentColor = [220, 38, 38]; // Red
  
    // Font setup
    doc.setFont('helvetica', 'normal');
  
    const waterMark = (page) => {
      // Background watermark
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(80);
      doc.text('YTBrief', pageWidth/2, pageHeight/2, {
        align: 'center',
        angle: -45,
        opacity: 0.1
      });
      doc.setTextColor(55, 65, 81);
    }

    waterMark(1)
  
    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
    // Header
    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(margin, margin, pageWidth - (2 * margin), 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('YouTube Video Summary', pageWidth/2, margin + 12, { align: 'center' });
  
    // Reset text color
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  
    // Video Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    // doc.text(videoTitle, pageWidth/2, 45, { align: 'center' });
  
    // Video Stats Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    let yPosition = 60;
  
    // Add video stats
    const statsToShow = [
      { label: 'Channel', value: videoStats.Channel },
      { label: 'Views', value: videoStats.Views },
      { label: 'Likes', value: videoStats.Likes },
      { label: 'Published', value: videoStats.publishedDate }
    ];
  
    statsToShow.forEach(stat => {
      doc.text(`${stat.label}: ${stat.value}`, margin + 10, yPosition);
      yPosition += 7;
    });
  
    yPosition += 10;
  
    // Function to add a section with styling and multi-page support
    const addSection = (title, items) => {
      if (!items || items.length === 0) return;
  
      // Ensure we have enough space, if not, add a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }
      

      // Video Title handling
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');

      if (doc.internal.getNumberOfPages() === 1){
        // Split the title into two lines if it's too long
        const splitTitle = doc.splitTextToSize(
          videoTitle, 
          pageWidth - (2 * margin)  // Subtract margins to ensure it fits
        );

        // If the title is longer than two lines, truncate
        const titleLines = splitTitle.length > 2 
          ? splitTitle.slice(0, 2) 
          : splitTitle;

        // Calculate the total height of the title
        const titleHeight = titleLines.length * 10;  // Adjust line height as needed

        // Calculate the starting Y position to center the title block
        const titleYStart = 45 + (20 - titleHeight) / 2;

        // Render each line of the title centered
        titleLines.forEach((line, index) => {
          doc.text(
            line, 
            pageWidth / 2, 
            titleYStart + (index * 10),  // Adjust spacing between lines
            { align: 'center' }
          );
        });
        
        // Underline
        const titleWidth = doc.getTextWidth(title);
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.line(margin + 10, yPosition + 2, margin + 10 + titleWidth, yPosition + 2);
    
        yPosition += 10;
      }
  
      // Section content
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
  
      items.forEach(item => {
        // More advanced text wrapping
        const splitText = doc.splitTextToSize(
          `• ${item}`, 
          pageWidth - (2 * margin) - 20
        );
        
        // Check if we need a new page before adding text
        if (yPosition + (splitText.length * lineHeight) > pageHeight - 30) {
          doc.addPage();
          // waterMark(doc.internal.getNumberOfPages())
          yPosition = margin;
        }
  
        doc.text(splitText, margin + 15, yPosition);
        yPosition += (splitText.length * lineHeight);
      });
  
      yPosition += 5; // Space between sections
    };
  
    // Add summary sections
    addSection('Main Topics', videoSummary.mainTopics);
    addSection('Important Insights', videoSummary.insights);
    addSection('Core Conclusions', videoSummary.conclusions);
  
    // Page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
    }
  
    // Save the PDF
    doc.save(`${videoTitle || 'YouTube Video'}-summary.pdf`);
  };