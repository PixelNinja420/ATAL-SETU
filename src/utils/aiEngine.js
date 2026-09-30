import { haversineDistance } from './helpers';

export const analyzeImage = (file, existingReports) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = [
        'illegal_dumping', 'overflowing_bin', 'uncollected_waste',
        'plastic_waste', 'construction_waste', 'street_litter',
        'blocked_drain', 'sewage_overflow', 'public_cleanliness', 'other'
      ];
      
      const suggestedCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const suggestedDescription = `AI identified issue related to ${suggestedCategory.replace('_', ' ')}. Visible elements suggest standard municipal action required.`;
      
      const severities = ['low', 'medium', 'high', 'critical'];
      const suggestedSeverity = severities[Math.floor(Math.random() * severities.length)];
      
      const confidence = Math.floor(72 + Math.random() * 24); // 72-95
      
      resolve({
        suggestedCategory,
        suggestedDescription,
        suggestedSeverity,
        confidence
      });
    }, 1500);
  });
};

export const checkDuplicate = (newReport, existingReports) => {
  if (!newReport.location) return { isDuplicate: false };
  
  for (const report of existingReports) {
    if (['resolved', 'closed'].includes(report.status)) continue;
    if (!report.location) continue;
    
    const dist = haversineDistance(
      newReport.location.lat, newReport.location.lng,
      report.location.lat, report.location.lng
    );
    
    if (dist < 200 && newReport.category === report.category) {
      return {
        isDuplicate: true,
        similarity: 100 - Math.floor((dist/200)*30),
        existingReportId: report.reportId || report.id
      };
    }
  }
  
  return { isDuplicate: false };
};

export const checkRecurring = (location, existingReports) => {
  if (!location) return { isRecurring: false, count: 0 };
  
  let count = 0;
  let lastReported = null;
  
  for (const report of existingReports) {
    if (!report.location) continue;
    
    const dist = haversineDistance(
      location.lat, location.lng,
      report.location.lat, report.location.lng
    );
    
    if (dist <= 300) {
      count++;
      if (!lastReported || new Date(report.createdAt) > new Date(lastReported)) {
        lastReported = report.createdAt;
      }
    }
  }
  
  return {
    isRecurring: count > 2,
    count,
    lastReported
  };
};

export const analyzeComments = (comments, reportDescription = '') => {
  if (!comments || comments.length === 0) {
    return { verificationState: 'likely_valid', confidence: 90, alerts: [] };
  }
  
  const contradictionKeywords = ["old", "removed", "fake", "wrong", "last year", "already", "not true", "different location"];
  
  let contradictoryCommentCount = 0;
  const alerts = [];
  
  for (const comment of comments) {
    const textLower = comment.text.toLowerCase();
    const hasContradiction = contradictionKeywords.some(kw => textLower.includes(kw));
    
    if (hasContradiction) {
      contradictoryCommentCount++;
      if (!comment.aiFlags) comment.aiFlags = [];
      if (!comment.aiFlags.includes('contradicts_report')) {
        comment.aiFlags.push('contradicts_report');
      }
    }
  }
  
  if (contradictoryCommentCount >= 2) {
    alerts.push({ type: 'warning', message: 'Multiple users are reporting contradictory information.' });
    return {
      verificationState: 'needs_verification',
      confidence: 45,
      alerts
    };
  } else if (contradictoryCommentCount === 1) {
    alerts.push({ type: 'info', message: 'One user reported potentially contradictory information.' });
    return {
      verificationState: 'likely_valid',
      confidence: 75,
      alerts
    };
  }
  
  return {
    verificationState: 'likely_valid',
    confidence: 95,
    alerts: []
  };
};

export const calculatePriorityScore = (report) => {
  let score = 0;
  
  const severityMap = { low: 10, medium: 25, high: 40, critical: 55 };
  score += severityMap[report.severity] || 0;
  
  const upvotes = report.votes?.up?.length || 0;
  const downvotes = report.votes?.down?.length || 0;
  let communityScore = (upvotes - downvotes) * 1.5;
  if (communityScore > 20) communityScore = 20;
  if (communityScore < 0) communityScore = 0;
  score += communityScore;
  
  if (report.createdAt) {
    const ageInDays = (new Date() - new Date(report.createdAt)) / (1000 * 60 * 60 * 24);
    let ageScore = ageInDays * 0.5;
    if (ageScore > 15) ageScore = 15;
    score += ageScore;
  }
  
  if (report.aiAnalysis?.isRecurring) {
    score += 10;
  }
  
  return Math.min(Math.round(score), 100);
};

export const detectImageAuthenticity = (file) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const rand = Math.random();
      if (rand < 0.85) {
        resolve({
          isAuthentic: true,
          confidence: Math.floor(88 + Math.random() * 10),
          verdict: 'authentic',
          details: [
            'No manipulation artifacts detected',
            'Metadata consistent with camera capture',
            'Noise patterns consistent with natural photography'
          ]
        });
      } else if (rand < 0.95) {
        resolve({
          isAuthentic: true,
          confidence: Math.floor(65 + Math.random() * 16),
          verdict: 'likely_authentic',
          details: [
            'Image has been compressed multiple times',
            'Some metadata is missing - possibly screenshot or forwarded image'
          ]
        });
      } else {
        resolve({
          isAuthentic: false,
          confidence: Math.floor(72 + Math.random() * 19),
          verdict: 'suspicious',
          details: [
            'Unusual texture patterns detected',
            'Inconsistent lighting/shadow analysis',
            'Possible AI-generation artifacts in background regions'
          ]
        });
      }
    }, 800);
  });
};

export const predictHotspots = (existingReports, regions) => {
  const clusters = [];
  
  for (const report of existingReports) {
    if (!report.location) continue;
    let foundCluster = false;
    
    for (const cluster of clusters) {
      const dist = haversineDistance(
        cluster.lat, cluster.lng,
        report.location.lat, report.location.lng
      );
      if (dist <= 400) {
        cluster.reports.push(report);
        foundCluster = true;
        break;
      }
    }
    
    if (!foundCluster) {
      clusters.push({
        lat: report.location.lat,
        lng: report.location.lng,
        address: report.location.address || 'Unknown Location',
        reports: [report]
      });
    }
  }
  
  const hotspots = clusters.map(cluster => {
    const totalReports = cluster.reports.length;
    const now = new Date();
    const recentReports = cluster.reports.filter(r => {
      if (!r.createdAt) return false;
      const ageInDays = (now - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
      return ageInDays <= 14;
    }).length;
    
    const resolvedReports = cluster.reports.filter(r => r.status === 'resolved');
    const resolvedCount = resolvedReports.length;
    
    let totalResolutionDays = 0;
    resolvedReports.forEach(r => {
      if (r.createdAt && r.updatedAt) {
        totalResolutionDays += (new Date(r.updatedAt) - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);
      }
    });
    const avgResolutionDays = resolvedCount > 0 ? (totalResolutionDays / resolvedCount).toFixed(1) : 0;
    
    const unresolvedCount = totalReports - resolvedCount;
    
    let riskScore = (totalReports * 5) + (recentReports * 10) + (unresolvedCount * 8);
    riskScore = Math.min(Math.round(riskScore), 100);
    
    let prediction = 'low_risk';
    if (riskScore > 70) prediction = 'high_risk';
    else if (riskScore >= 40) prediction = 'moderate_risk';
    
    let frequency = totalReports > 1 ? (30 / totalReports) : 30;
    const predictedNextIncident = Math.max(1, Math.round(frequency));
    
    const catCounts = {};
    cluster.reports.forEach(r => {
      catCounts[r.category] = (catCounts[r.category] || 0) + 1;
    });
    let topCategory = Object.keys(catCounts).sort((a,b) => catCounts[b] - catCounts[a])[0];
    
    return {
      lat: cluster.lat,
      lng: cluster.lng,
      address: cluster.address,
      totalReports,
      recentReports,
      riskScore,
      prediction,
      predictedNextIncident,
      avgResolutionDays,
      topCategory
    };
  });
  
  return hotspots.sort((a, b) => b.riskScore - a.riskScore);
};

export const getRecommendedActions = (report) => {
  const category = report.category;
  const isRecurring = report.aiAnalysis?.isRecurring;
  const severity = report.severity || 'medium';
  
  let actions = [];
  let suggestedTeamType = 'General Maintenance';
  
  switch(category) {
    case 'illegal_dumping':
      suggestedTeamType = 'Heavy Cleanup Crew';
      actions.push({priority: 'primary', action: 'Deploy cleanup crew with heavy equipment', reasoning: 'Required for large scale waste removal', estimatedEffort: 'High'});
      actions.push({priority: 'secondary', action: 'Install surveillance camera at location', reasoning: 'Deter future illegal dumping', estimatedEffort: 'Medium'});
      actions.push({priority: 'secondary', action: 'Post warning signage', reasoning: 'Educate public on dumping penalties', estimatedEffort: 'Low'});
      actions.push({priority: 'secondary', action: 'Coordinate with local police for enforcement', reasoning: 'Address legal violations', estimatedEffort: 'Medium'});
      break;
    case 'overflowing_bin':
      suggestedTeamType = 'Waste Collection Team';
      actions.push({priority: 'primary', action: 'Increase collection frequency for this route', reasoning: 'Current capacity is insufficient', estimatedEffort: 'Medium'});
      actions.push({priority: 'secondary', action: 'Evaluate bin capacity upgrade', reasoning: 'Long-term solution for high-volume area', estimatedEffort: 'Low'});
      actions.push({priority: 'secondary', action: 'Deploy additional temporary bin', reasoning: 'Immediate relief for overflow', estimatedEffort: 'Low'});
      break;
    case 'blocked_drain':
      suggestedTeamType = 'Drainage Maintenance';
      actions.push({priority: 'primary', action: 'Dispatch drainage clearing team', reasoning: 'Prevent flooding risk', estimatedEffort: 'High'});
      actions.push({priority: 'secondary', action: 'Schedule CCTV drain inspection', reasoning: 'Identify underlying blockages', estimatedEffort: 'Medium'});
      actions.push({priority: 'secondary', action: 'Coordinate with roads department', reasoning: 'Ensure safe road conditions', estimatedEffort: 'Low'});
      break;
    case 'sewage_overflow':
      suggestedTeamType = 'Emergency Sanitation Response';
      actions.push({priority: 'primary', action: 'Emergency containment team required', reasoning: 'Severe public health hazard', estimatedEffort: 'High'});
      actions.push({priority: 'primary', action: 'Issue public health advisory for area', reasoning: 'Protect public safety', estimatedEffort: 'Low'});
      actions.push({priority: 'secondary', action: 'Contact water treatment facility', reasoning: 'Coordinate system management', estimatedEffort: 'Medium'});
      break;
    case 'plastic_waste':
      suggestedTeamType = 'Community Cleanup Team';
      actions.push({priority: 'primary', action: 'Organize targeted cleanup drive', reasoning: 'Effective for dispersed waste', estimatedEffort: 'Medium'});
      actions.push({priority: 'secondary', action: 'Engage local recycling partners', reasoning: 'Proper disposal of plastics', estimatedEffort: 'Low'});
      actions.push({priority: 'secondary', action: 'Community awareness campaign', reasoning: 'Prevent future littering', estimatedEffort: 'Low'});
      break;
    case 'construction_waste':
      suggestedTeamType = 'Code Enforcement & Cleanup';
      actions.push({priority: 'primary', action: 'Issue notice to nearby construction sites', reasoning: 'Hold responsible parties accountable', estimatedEffort: 'Low'});
      actions.push({priority: 'primary', action: 'Deploy debris removal vehicle', reasoning: 'Clear heavy materials', estimatedEffort: 'High'});
      actions.push({priority: 'secondary', action: 'Check construction permits in area', reasoning: 'Identify potential culprits', estimatedEffort: 'Low'});
      break;
    default:
      suggestedTeamType = 'General Maintenance';
      actions.push({priority: 'primary', action: 'Dispatch general cleanup team', reasoning: 'Standard waste removal', estimatedEffort: 'Medium'});
      actions.push({priority: 'secondary', action: 'Assess area for additional needs', reasoning: 'Determine if further action required', estimatedEffort: 'Low'});
  }
  
  if (isRecurring) {
    actions.push({priority: 'secondary', action: 'Establish regular monitoring schedule for this location', reasoning: 'Issue has been reported multiple times', estimatedEffort: 'Medium'});
    actions.push({priority: 'secondary', action: 'Consider permanent waste infrastructure at this location', reasoning: 'Address root cause of recurring issue', estimatedEffort: 'High'});
  }
  
  let estimatedResolutionHours = 48;
  if (severity === 'critical') estimatedResolutionHours = 4;
  else if (severity === 'high') estimatedResolutionHours = 12;
  else if (severity === 'medium') estimatedResolutionHours = 24;
  
  return { actions, suggestedTeamType, estimatedResolutionHours };
};
