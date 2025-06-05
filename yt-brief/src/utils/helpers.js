export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const parseVideoSummary = (summaryText) => {
  const sections = {
    mainTopics: [],
    insights: [],
    conclusions: []
  };

  const lines = summaryText.split('\n');
  let currentSection = null;

  lines.forEach(line => {
    const trimmedLine = line.trim();
    
    if (trimmedLine.toLowerCase().includes('main topics') || trimmedLine.toLowerCase().includes('key points')) {
      currentSection = 'mainTopics';
    } else if (trimmedLine.toLowerCase().includes('important insights')) {
      currentSection = 'insights';
    } else if (trimmedLine.toLowerCase().includes('core conclusions')) {
      currentSection = 'conclusions';
    } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•')) {
      if (currentSection && trimmedLine.length > 1) {
        sections[currentSection].push(trimmedLine.substring(1).trim());
      }
    }
  });

  return sections;
};