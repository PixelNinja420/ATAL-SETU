import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  initialUsers, initialDepartments, initialTeams, initialReports, 
  initialNotifications, CATEGORIES, STATUSES, PRIORITIES 
} from '../data/mockData';
import { regions } from '../data/regions';
import { analyzeImage, checkDuplicate, checkRecurring, analyzeComments, calculatePriorityScore } from '../utils/aiEngine';
import { generateReportId } from '../utils/helpers';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('curchorem-ward3');
  
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [allRegions, setAllRegions] = useState(regions);
  const [departments, setDepartments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const savedState = localStorage.getItem('cleanconnect_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setReports(parsed.reports || []);
        setUsers(parsed.users || []);
        setDepartments(parsed.departments || []);
        setTeams(parsed.teams || []);
        setNotifications(parsed.notifications || []);
      } catch (e) {
        loadMockData();
      }
    } else {
      loadMockData();
    }
  }, []);

  const loadMockData = () => {
    setReports(initialReports);
    setUsers(initialUsers);
    setDepartments(initialDepartments);
    setTeams(initialTeams);
    setNotifications(initialNotifications);
    saveState(initialReports, initialUsers, initialDepartments, initialTeams, initialNotifications);
  };

  const saveState = (rep = reports, usr = users, dep = departments, tms = teams, notifs = notifications) => {
    localStorage.setItem('cleanconnect_state', JSON.stringify({
      reports: rep, users: usr, departments: dep, teams: tms, notifications: notifs
    }));
  };

  const login = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.regionId) setSelectedRegion(user.regionId);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchRegion = (regionId) => {
    setSelectedRegion(regionId);
  };

  const createReport = async (data) => {
    const newReportId = generateReportId();
    
    // Minimal AI logic simulation for immediate UI response
    const location = { 
      lat: data.location?.lat || 15.2637, 
      lng: data.location?.lng || 74.1077, 
      address: data.location?.address || 'Unknown', 
      regionId: selectedRegion 
    };
    
    const duplicateCheck = checkDuplicate({ category: data.category, location }, reports);
    const recurringCheck = checkRecurring(location, reports);
    
    const newReport = {
      id: `report-${Date.now()}`,
      reportId: newReportId,
      title: data.title,
      description: data.description,
      category: data.category,
      severity: data.severity || 'low',
      priority: 'low',
      status: 'reported',
      images: data.images || [],
      video: null,
      location,
      reporterId: currentUser?.id || 'system',
      assignedDepartmentId: null,
      assignedTeamId: null,
      assignedOfficerId: null,
      deadline: null,
      aiAnalysis: {
        suggestedCategory: data.category,
        suggestedDescription: 'AI processed.',
        suggestedSeverity: data.severity || 'low',
        verificationState: 'likely_valid',
        confidence: 85,
        alerts: [],
        duplicateOf: duplicateCheck.isDuplicate ? duplicateCheck.existingReportId : null,
        isRecurring: recurringCheck.isRecurring,
        recurringCount: recurringCheck.count,
      },
      votes: { up: [], down: [] },
      flags: [],
      followers: [currentUser?.id].filter(Boolean),
      comments: [],
      timeline: [
        { status: 'reported', timestamp: new Date().toISOString(), note: 'Report submitted', userId: currentUser?.id || 'system' }
      ],
      resolutionEvidence: null,
      communityVerification: { yes: [], no: [] },
      priorityScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    newReport.priorityScore = calculatePriorityScore(newReport);

    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
    return newReport;
  };

  const updateReportStatus = (reportId, newStatus, note) => {
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        const updated = {
          ...r,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...r.timeline,
            { status: newStatus, timestamp: new Date().toISOString(), note: note || `Status changed to ${newStatus}`, userId: currentUser?.id || 'system' }
          ]
        };
        return updated;
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const setReportPriority = (reportId, priority) => {
    const updatedReports = reports.map(r => r.id === reportId || r.reportId === reportId ? { ...r, priority, updatedAt: new Date().toISOString() } : r);
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const assignReport = (reportId, { departmentId, teamId, officerId, deadline }) => {
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        return {
          ...r,
          assignedDepartmentId: departmentId || r.assignedDepartmentId,
          assignedTeamId: teamId || r.assignedTeamId,
          assignedOfficerId: officerId || r.assignedOfficerId,
          deadline: deadline || r.deadline,
          status: 'assigned',
          updatedAt: new Date().toISOString(),
          timeline: [
            ...r.timeline,
            { status: 'assigned', timestamp: new Date().toISOString(), note: 'Report assigned', userId: currentUser?.id || 'system' }
          ]
        };
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const upvoteReport = (reportId) => {
    if (!currentUser) return;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        const upVotes = [...(r.votes.up || [])];
        const downVotes = (r.votes.down || []).filter(id => id !== currentUser.id);
        
        if (upVotes.includes(currentUser.id)) {
          upVotes.splice(upVotes.indexOf(currentUser.id), 1);
        } else {
          upVotes.push(currentUser.id);
        }
        
        const newReport = { ...r, votes: { up: upVotes, down: downVotes }, priorityScore: 0 };
        newReport.priorityScore = calculatePriorityScore(newReport);
        return newReport;
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const downvoteReport = (reportId) => {
    if (!currentUser) return;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        const downVotes = [...(r.votes.down || [])];
        const upVotes = (r.votes.up || []).filter(id => id !== currentUser.id);
        
        if (downVotes.includes(currentUser.id)) {
          downVotes.splice(downVotes.indexOf(currentUser.id), 1);
        } else {
          downVotes.push(currentUser.id);
        }
        
        const newReport = { ...r, votes: { up: upVotes, down: downVotes }, priorityScore: 0 };
        newReport.priorityScore = calculatePriorityScore(newReport);
        return newReport;
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const addComment = (reportId, text) => {
    if (!currentUser) return null;
    let addedComment = null;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        const newComment = { id: `c-${Date.now()}`, userId: currentUser.id, text, createdAt: new Date().toISOString(), aiFlags: [] };
        addedComment = newComment;
        const updatedComments = [...(r.comments || []), newComment];
        
        const analysis = analyzeComments(updatedComments, r.description);
        
        return {
          ...r,
          comments: updatedComments,
          aiAnalysis: {
            ...r.aiAnalysis,
            verificationState: analysis.verificationState,
            alerts: analysis.alerts
          },
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    if (addedComment) {
      setReports(updatedReports);
      saveState(updatedReports, users, departments, teams, notifications);
    }
    return addedComment;
  };

  const flagReport = (reportId, reason) => {
    if (!currentUser) return;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        return {
          ...r,
          flags: [...(r.flags || []), { userId: currentUser.id, reason, createdAt: new Date().toISOString() }]
        };
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const followReport = (reportId) => {
    if (!currentUser) return;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        const followers = [...(r.followers || [])];
        if (followers.includes(currentUser.id)) {
          followers.splice(followers.indexOf(currentUser.id), 1);
        } else {
          followers.push(currentUser.id);
        }
        return { ...r, followers };
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const verifyResolution = (reportId, isResolved) => {
    if (!currentUser) return;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        const cv = { ...r.communityVerification } || { yes: [], no: [] };
        if (isResolved) {
          if (!cv.yes.includes(currentUser.id)) cv.yes.push(currentUser.id);
          cv.no = cv.no.filter(id => id !== currentUser.id);
        } else {
          if (!cv.no.includes(currentUser.id)) cv.no.push(currentUser.id);
          cv.yes = cv.yes.filter(id => id !== currentUser.id);
        }
        
        let newStatus = r.status;
        if (cv.yes.length >= 3) newStatus = 'closed';
        if (cv.no.length >= 3) newStatus = 'reopened';

        return {
          ...r,
          communityVerification: cv,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const submitResolution = (reportId, { beforePhotos, afterPhotos, note }) => {
    if (!currentUser) return;
    const updatedReports = reports.map(r => {
      if (r.id === reportId || r.reportId === reportId) {
        return {
          ...r,
          status: 'resolved',
          resolutionEvidence: { beforePhotos, afterPhotos, note, submittedBy: currentUser.id, submittedAt: new Date().toISOString() },
          timeline: [
            ...r.timeline,
            { status: 'resolved', timestamp: new Date().toISOString(), note: 'Resolution submitted', userId: currentUser.id }
          ],
          updatedAt: new Date().toISOString()
        };
      }
      return r;
    });
    setReports(updatedReports);
    saveState(updatedReports, users, departments, teams, notifications);
  };

  const addNotification = (userId, { type, message, reportId }) => {
    const newNotif = {
      id: `n-${Date.now()}`,
      userId, type, message, reportId, isRead: false, createdAt: new Date().toISOString()
    };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveState(reports, users, departments, teams, updatedNotifs);
  };

  const markNotificationRead = (notifId) => {
    const updatedNotifs = notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifs);
    saveState(reports, users, departments, teams, updatedNotifs);
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    const updatedNotifs = notifications.map(n => n.userId === currentUser.id ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifs);
    saveState(reports, users, departments, teams, updatedNotifs);
  };

  const getRegionChildren = (regionId) => {
    const children = [];
    const findChildren = (pid) => {
      const direct = allRegions.filter(r => r.parentId === pid);
      for (const c of direct) {
        children.push(c.id);
        findChildren(c.id);
      }
    };
    findChildren(regionId);
    return [regionId, ...children];
  };

  const getReportsByRegion = (regionId) => {
    const validRegions = getRegionChildren(regionId);
    return reports.filter(r => r.location && validRegions.includes(r.location.regionId));
  };

  const getReportsByStatus = (status) => reports.filter(r => r.status === status);
  const getReportsByDepartment = (deptId) => reports.filter(r => r.assignedDepartmentId === deptId);
  const getAssignedTasks = (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user || !user.teamId) return [];
    return reports.filter(r => r.assignedTeamId === user.teamId);
  };

  const getAnalytics = () => {
    return {
      byCategory: {},
      byStatus: {},
      byWard: {},
      avgResolutionDays: 2.5,
      overdueCount: reports.filter(r => r.deadline && new Date(r.deadline) < new Date() && !['resolved', 'closed'].includes(r.status)).length,
      monthlyTrend: []
    };
  };

  const getRegionAncestors = (regionId) => {
    const ancestors = [];
    let curr = allRegions.find(r => r.id === regionId);
    while (curr && curr.parentId) {
      ancestors.push(curr.parentId);
      curr = allRegions.find(r => r.id === curr.parentId);
    }
    return ancestors;
  };

  const getUserById = (userId) => users.find(u => u.id === userId);
  
  const getFeedReports = () => {
    const validRegions = getRegionChildren(selectedRegion);
    return reports
      .filter(r => r.location && validRegions.includes(r.location.regionId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const value = {
    currentUser, selectedRegion, reports, users, regions: allRegions, departments, teams,
    notifications: currentUser ? notifications.filter(n => n.userId === currentUser.id) : [],
    login, logout, switchRegion,
    createReport, updateReportStatus, setReportPriority, assignReport,
    upvoteReport, downvoteReport, addComment, flagReport, followReport, verifyResolution,
    submitResolution, addNotification, markNotificationRead, markAllNotificationsRead,
    getReportsByRegion, getReportsByStatus, getReportsByDepartment, getAssignedTasks,
    getAnalytics, getRegionChildren, getRegionAncestors, getUserById, getFeedReports
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
