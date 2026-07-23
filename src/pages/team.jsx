import React, { useState, useEffect, useRef } from "react";
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Search, Filter, UserPlus, Plus, MoreVertical, X, Trash2 } from "lucide-react";
import { getUsers, getProfiles, updateUser, updateProfile } from "@/services/authservices";
import { getAllTasks, getProjects, getUserTeams, updateProject } from "@/services/taskservices";
import "@/css/team.css";

function Team() {
  const [members, setMembers] = useState([]);
  const [nonMembers, setNonMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All Members");
  const [searchQuery, setSearchQuery] = useState("");

  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentTeamId, setCurrentTeamId] = useState(null);
  const [isManager, setIsManager] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [userProjects, setUserProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");

  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    let storedId = sessionStorage.getItem("currentUserId") || localStorage.getItem("currentUserId");
    if (!storedId) {
      storedId = sessionStorage.getItem("userId") || localStorage.getItem("userId");
    }

    let userTeamId = null;
    const sessionUser = sessionStorage.getItem("user") || localStorage.getItem("user");

    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        if (parsed.id || parsed._id) {
          storedId = parsed.id || parsed._id;
        }
        if (parsed.teamId) {
          userTeamId = String(parsed.teamId);
        }
      } catch (e) {
        console.error("Error parsing user from storage", e);
      }
    }

    if (storedId) setCurrentUserId(String(storedId));
    if (userTeamId) setCurrentTeamId(userTeamId);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAndFilterTeam = async () => {
      try {
        setLoading(true);

        const [usersData, profilesData, allTasks, allProjects] = await Promise.all([
          getUsers().catch(() => []),
          getProfiles().catch(() => []),
          getAllTasks().catch(() => []),
          getProjects().catch(() => [])
        ]);

        const currentUserRaw = usersData.find(u => String(u.id || u._id) === String(currentUserId)) || {};
        const currentProfileRaw = profilesData.find(p => String(p.userId || p.id) === String(currentUserId)) || {};
        const currentUserTaskProjectIds = allTasks
          .filter(t => String(t.userId) === String(currentUserId) && t.projectId)
          .map(t => String(t.projectId));

        const currentUserDirectProjectIds = [
          currentUserRaw.projectId ? String(currentUserRaw.projectId) : null,
          currentProfileRaw.projectId ? String(currentProfileRaw.projectId) : null,
          ...currentUserTaskProjectIds
        ].filter(Boolean);

        let userTeamIds = [];
        if (currentUserId) {
          try {
            const userTeams = (await getUserTeams(currentUserId).catch(() => [])) || [];
            userTeamIds = userTeams.map((m) => String(m.teamId));
          } catch (err) {
            console.error("Error fetching user teams:", err);
          }
        }

        const filteredUserProjects = allProjects.filter((project) => {
          const pId = String(project.id || project._id);
          
          const isCreator = String(project.createdByUserId || project.userId) === String(currentUserId);
          const isTeamMatch = userTeamIds.some((tId) => String(project.teamId) === String(tId));
          const isMemberInArray =
            Array.isArray(project.members) &&
            project.members.some((m) => String(m.id || m.userId || m) === String(currentUserId));
          
          const isDirectlyAssigned = currentUserDirectProjectIds.includes(pId);

          return isCreator || isTeamMatch || isMemberInArray || isDirectlyAssigned;
        });

        setUserProjects(filteredUserProjects);

        let activeTeamId = currentTeamId;

        if (currentUserId) {
          const loggedInUserObj = usersData.find((u) => String(u.id || u._id) === String(currentUserId));
          if (loggedInUserObj && loggedInUserObj.teamId) {
            activeTeamId = String(loggedInUserObj.teamId);
            setCurrentTeamId(activeTeamId);
          } else if (!activeTeamId) {
            const userTask = allTasks.find(
              (task) => String(task.userId) === String(currentUserId) && task.teamId
            );
            if (userTask) {
              activeTeamId = String(userTask.teamId);
              setCurrentTeamId(activeTeamId);
            }
          }
        }

        const mergedMembers = usersData.map((user) => {
          const userIdStr = String(user.id || user._id);
          const profile = profilesData.find(
            (p) => String(p.userId || p.id) === userIdStr
          ) || {};

          const memberTeamId =
            user.teamId ||
            profile.teamId ||
            allTasks.find((t) => String(t.userId) === userIdStr)?.teamId;

          const userTaskProjectIds = allTasks
            .filter((t) => String(t.userId) === userIdStr && t.projectId)
            .map((t) => String(t.projectId));

          const projectMembershipIds = allProjects
            .filter(project => {
              if (!Array.isArray(project.members)) return false;
              return project.members.some(m => String(m.id || m.userId || m) === userIdStr);
            })
            .map(p => String(p.id || p._id));

          const allProjectIds = Array.from(new Set([
            ...userTaskProjectIds,
            ...projectMembershipIds,
            ...(user.projectId ? [String(user.projectId)] : []),
            ...(profile.projectId ? [String(profile.projectId)] : [])
          ]));

          const memberProjectId = user.projectId || profile.projectId || null;

          let rawSkills = profile.skills || user.skills || [];
          let skillsArray = [];
          if (Array.isArray(rawSkills)) {
            skillsArray = rawSkills;
          } else if (typeof rawSkills === "string" && rawSkills.trim().length > 0) {
            skillsArray = rawSkills.split(",").map((s) => s.trim());
          }

          let rawStatus = user.status || profile.availability || "Available";
          let statusLabel = "Available";
          const statusLower = String(rawStatus).toLowerCase();

          if (statusLower.includes("busy") || statusLower.includes("capacity")) {
            statusLabel = "Busy";
          } else if (statusLower.includes("offline") || statusLower.includes("inactive")) {
            statusLabel = "Offline";
          } else {
            statusLabel = "Available";
          }

          return {
            id: userIdStr,
            teamId: memberTeamId ? String(memberTeamId) : null,
            projectId: memberProjectId ? String(memberProjectId) : null,
            projectIds: allProjectIds,
            name: user.name || profile.fullName || "Team Member",
            role: profile.jobTitle || user.role || "Employee",
            department: profile.department || user.department || "General",
            status: statusLabel,
            avatar: profile.avatar || user.avatar || null,
            email: user.email || profile.email || "",
            skills: skillsArray
          };
        });

        const currentUserData = mergedMembers.find((m) => m.id === currentUserId);
        if (currentUserData) {
          const roleLower = (currentUserData.role || "").toLowerCase();
          const managerRoles = ["manager", "admin", "lead", "cto", "product manager", "team leader"];
          const userIsManager = managerRoles.some((r) => roleLower.includes(r));
          setIsManager(userIsManager);
        } else {
          setIsManager(false);
        }

        const userTeamMembers = mergedMembers.filter((member) => {
          if (activeTeamId) {
            return String(member.teamId) === String(activeTeamId);
          }
          return String(member.id) === String(currentUserId);
        });

        const availableNonMembers = mergedMembers.filter((member) => {
          if (String(member.id) === String(currentUserId)) return false;
          if (!activeTeamId) return true;
          return String(member.teamId) !== String(activeTeamId);
        });

        setMembers(userTeamMembers);
        setNonMembers(availableNonMembers);
      } catch (error) {
        console.error("Failed to load team directory:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId || currentTeamId) {
      fetchAndFilterTeam();
    } else {
      setLoading(false);
    }
  }, [currentUserId, currentTeamId]);

  const canAddMemberToCurrentContext = () => {
    if (isManager) return true;
    if (selectedProjectId && selectedProjectId !== "ALL") {
      const targetProject = userProjects.find((p) => String(p.id || p._id) === String(selectedProjectId));
      if (targetProject) {
        const isCreator = String(targetProject.createdByUserId || targetProject.userId) === String(currentUserId);
        return isCreator;
      }
    }
    return false;
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      setIsSubmitting(true);

      const targetMember = nonMembers.find((m) => String(m.id) === String(selectedUserId));
      if (!targetMember) return;

      const isSpecificProjectSelected = selectedProjectId && selectedProjectId !== "ALL";
      
      let effectiveTeamId = currentTeamId || "1";
      if (isSpecificProjectSelected) {
        const targetProject = userProjects.find((p) => String(p.id || p._id) === String(selectedProjectId));
        if (targetProject && targetProject.teamId) {
          effectiveTeamId = String(targetProject.teamId);
        }
      }

      const isSpecificDepartmentSelected = activeFilter && activeFilter !== "All Members";

      const updatePayload = {
        teamId: effectiveTeamId,
        ...(isSpecificProjectSelected && { projectId: selectedProjectId }),
        ...(isSpecificDepartmentSelected && { department: activeFilter })
      };

      if (typeof updateProfile === "function") {
        await updateProfile(selectedUserId, updatePayload).catch(() => {});
      }
      if (typeof updateUser === "function") {
        await updateUser(selectedUserId, updatePayload).catch(() => {});
      }

      if (isSpecificProjectSelected && typeof updateProject === "function") {
        const currentProj = userProjects.find((p) => String(p.id || p._id) === String(selectedProjectId));
        if (currentProj) {
          const existingMembers = Array.isArray(currentProj.members) ? currentProj.members : [];
          const alreadyMember = existingMembers.some(
            (m) => String(m.id || m.userId || m) === String(selectedUserId)
          );

          if (!alreadyMember) {
            const updatedMembersList = [...existingMembers, { id: selectedUserId }];
            await updateProject(selectedProjectId, { members: updatedMembersList }).catch((err) => {
              console.error("Failed to update project members in database:", err);
            });
          }
        }
      }

      const updatedMember = {
        ...targetMember,
        teamId: effectiveTeamId,
        department: isSpecificDepartmentSelected ? activeFilter : targetMember.department,
        projectId: isSpecificProjectSelected ? selectedProjectId : targetMember.projectId,
        projectIds: isSpecificProjectSelected
          ? Array.from(new Set([...(targetMember.projectIds || []), selectedProjectId]))
          : (targetMember.projectIds || [])
      };

      if (isSpecificProjectSelected) {
        setUserProjects((prevProjects) =>
          prevProjects.map((p) => {
            const pId = String(p.id || p._id);
            if (pId === String(selectedProjectId)) {
              const existingMembers = Array.isArray(p.members) ? p.members : [];
              const alreadyMember = existingMembers.some(
                (m) => String(m.id || m.userId || m) === String(selectedUserId)
              );
              if (!alreadyMember) {
                return { ...p, members: [...existingMembers, { id: selectedUserId }] };
              }
            }
            return p;
          })
        );
      }

      setMembers((prev) => [...prev, updatedMember]);
      setNonMembers((prev) => prev.filter((m) => String(m.id) !== String(selectedUserId)));

      setSelectedUserId("");
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error("Error adding user to team:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    try {
      if (typeof updateProfile === "function") {
        await updateProfile(memberId, { teamId: null }).catch(() => {});
      }
      if (typeof updateUser === "function") {
        await updateUser(memberId, { teamId: null }).catch(() => {});
      }

      const memberToRemove = members.find((m) => String(m.id) === String(memberId));
      setMembers((prev) => prev.filter((m) => String(m.id) !== String(memberId)));

      if (memberToRemove) {
        setNonMembers((prev) => [...prev, { ...memberToRemove, teamId: null }]);
      }

      setOpenMenuId(null);
    } catch (error) {
      console.error("Error removing member from team:", error);
    }
  };

  const handleToggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId((prevId) => (prevId === id ? null : id));
  };

  const isMemberInSelectedProject = (member) => {
    if (selectedProjectId === "ALL") return true;

    if (String(member.id) === String(currentUserId)) return true;

    if (String(member.projectId) === String(selectedProjectId)) return true;

    if (Array.isArray(member.projectIds) && member.projectIds.includes(String(selectedProjectId))) return true;

    const currentProj = userProjects.find((p) => String(p.id || p._id) === String(selectedProjectId));
    if (currentProj && Array.isArray(currentProj.members)) {
      const isMemberInProject = currentProj.members.some((m) => {
        const memberId = String(m.id || m.userId || m);
        return memberId === String(member.id);
      });
      
      if (isMemberInProject) return true;
    }

    if (currentProj && member.teamId && String(currentProj.teamId) === String(member.teamId)) {
      return true;
    }

    return false;
  };

  const filteredMembers = members.filter((member) => {
    const matchesProject = isMemberInSelectedProject(member);

    const matchesFilter =
      activeFilter === "All Members" ||
      member.department?.toLowerCase() === activeFilter.toLowerCase();

    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesProject && matchesFilter && matchesSearch;
  });

  const selectedUserObject = nonMembers.find(
    (user) => String(user.id) === String(selectedUserId)
  );

  const filterTabs = ["All Members", "IT", "Development", "QA", "Design", "Marketing", "HR"];
  const hasAddPermission = canAddMemberToCurrentContext();

  return (
    <SidebarProvider>
      <div className="team-page-wrapper">
        <AppSidebar className="sidebar-wrapper-custom" />

        <header className="dashboard-header">
          <SidebarTrigger className="sidebar-trigger-custom" />
          <div className="search-container-header">
            <Search className="search-icon" />
            <input
              type="search"
              placeholder="Search team members, roles, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        <main className="team-main-content">
          <div className="team-header-bar">
            <div>
              <h1 className="tasks-title">Team Directory</h1>
              <p className="tasks-subtitle">
                Manage roles, departments, and members across Team {currentTeamId || ""}. ({filteredMembers.length} members found)
              </p>
            </div>
            <div className="team-header-actions">
              <div className="project-filter-wrapper">
                <Filter size={16} className="project-filter-icon" />
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="project-filter-select"
                >
                  <option value="ALL">All My Projects</option>
                  {userProjects.map((project) => {
                    const pId = project.id || project._id;
                    return (
                      <option key={pId} value={pId}>
                        {project.name || project.title || `Project ${pId}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              {hasAddPermission && (
                <button className="createTaskBtn" onClick={() => setIsInviteModalOpen(true)}>
                  <UserPlus size={16} /> Add Member
                </button>
              )}
            </div>
          </div>

          <div className="status-filter-bar">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab;

              const projectFiltered = members.filter((m) => isMemberInSelectedProject(m));

              const count =
                tab === "All Members"
                  ? projectFiltered.length
                  : projectFiltered.filter((m) => m.department?.toLowerCase() === tab.toLowerCase()).length;

              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`status-filter-tab ${isActive ? "active" : ""}`}
                >
                  <span>{tab}</span>
                  <span className="status-filter-count">{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="empty-tasks-state">
              <p className="empty-tasks-message">Loading team directory...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="empty-tasks-state">
              <p className="empty-tasks-message">No team members match the current project or filter criteria.</p>
            </div>
          ) : (
            <div className="team-grid">
              {filteredMembers.map((member) => {
                const isCurrentUser = String(member.id) === String(currentUserId);
                return (
                  <div
                    key={member.id}
                    className={`team-card ${isCurrentUser ? "team-card-mine" : ""}`}
                  >
                    {hasAddPermission && (
                      <div className="card-menu-container">
                        <button
                          className="card-more-btn"
                          aria-label="Member options"
                          onClick={(e) => handleToggleMenu(member.id, e)}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {openMenuId === member.id && (
                          <div className="card-dropdown-menu" ref={menuRef}>
                            <button
                              className="dropdown-item delete"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="member-card-body">
                      <div className="member-avatar">
                        {member.avatar && member.avatar.startsWith("http") ? (
                          <img src={member.avatar} alt={member.name} />
                        ) : (
                          member.name.split(" ").map((n) => n[0]).join("")
                        )}
                      </div>
                      <h3 className="member-name">
                        {member.name}{" "}
                        {isCurrentUser && <span className="current-user-badge">(You)</span>}
                      </h3>
                      <p className="member-role">{member.role}</p>
                    </div>

                    <div className="member-card-footer">
                      <span className="status-badge">
                        <span className={`status-dot ${member.status?.toLowerCase()}`} />
                        {member.status}
                      </span>
                    </div>
                  </div>
                );
              })}

              {hasAddPermission && (
                <div
                  className="add-member-card"
                  onClick={() => setIsInviteModalOpen(true)}
                >
                  <div className="add-member-icon">
                    <Plus size={20} />
                  </div>
                  <h4 className="add-member-title">Add Member</h4>
                  <p className="add-member-subtitle">Scale your workspace team</p>
                </div>
              )}
            </div>
          )}
        </main>

        {isInviteModalOpen && hasAddPermission && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <button
                  className="modal-close-btn"
                  onClick={() => {
                    setIsInviteModalOpen(false);
                    setSelectedUserId("");
                  }}
                >
                  <X size={18} />
                </button>
              </div>
              <h2 className="modal-title">Add User to Team</h2>
              <p className="modal-description">
                Select a user to assign them to Team {currentTeamId || "1"}.
              </p>

              <form className="taskform" onSubmit={handleAssignMember}>
                <div>
                  <label>Select User</label>
                  {nonMembers.length === 0 ? (
                    <p className="tasks-subtitle no-users-text">
                      No available users found outside Team {currentTeamId || "1"}.
                    </p>
                  ) : (
                    <>
                      <select
                        className="inputfield"
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        required
                      >
                        <option value="" disabled>-- Select Name --</option>
                        {nonMembers.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>

                      {selectedUserObject && (
                        <div className="skills-preview-box">
                          <span className="skills-preview-title">
                            Member Skills:
                          </span>
                          {selectedUserObject.skills && selectedUserObject.skills.length > 0 ? (
                            <div className="skills-tags-container">
                              {selectedUserObject.skills.map((skill, idx) => (
                                <span key={idx} className="skill-tag-pill">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="no-skills-text">
                              No skills listed for this member.
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="buttons form-buttons-container">
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setSelectedUserId("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="saveButton"
                    disabled={!selectedUserId || isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add to Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}

export default Team;