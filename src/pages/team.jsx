import React, { useState, useEffect, useRef } from "react";
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Search, 
  Filter, 
  UserPlus, 
  Plus, 
  MoreVertical, 
  X,
  Trash2
} from "lucide-react";
import { getUsers, getProfiles, updateUser, updateProfile } from "@/services/authservices";
import { getAllTasks } from "@/services/taskservices";
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

        const [usersData, profilesData, allTasks] = await Promise.all([
          getUsers().catch(() => []),
          getProfiles().catch(() => []),
          getAllTasks().catch(() => [])
        ]);

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
          const profile = profilesData.find(
            (p) => String(p.userId || p.id) === String(user.id || user._id)
          ) || {};

          const memberTeamId =
            user.teamId ||
            profile.teamId ||
            allTasks.find((t) => String(t.userId) === String(user.id || user._id))?.teamId;

          let rawSkills = profile.skills || user.skills || [];
          let skillsArray = [];
          if (Array.isArray(rawSkills)) {
            skillsArray = rawSkills;
          } else if (typeof rawSkills === "string" && rawSkills.trim().length > 0) {
            skillsArray = rawSkills.split(",").map((s) => s.trim());
          }

          // Updated status parsing to map database values accurately
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
            id: String(user.id || user._id),
            teamId: memberTeamId ? String(memberTeamId) : null,
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
          const managerRoles = ["manager", "admin", "lead", "cto", "product manager"];
          const userIsManager = managerRoles.some((r) => roleLower.includes(r));
          setIsManager(userIsManager);
        } else {
          setIsManager(true);
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

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId || !currentTeamId) return;

    try {
      setIsSubmitting(true);

      const targetMember = nonMembers.find((m) => String(m.id) === String(selectedUserId));
      if (!targetMember) return;

      if (typeof updateProfile === "function") {
        await updateProfile(selectedUserId, { teamId: currentTeamId }).catch(() => {});
      }
      if (typeof updateUser === "function") {
        await updateUser(selectedUserId, { teamId: currentTeamId }).catch(() => {});
      }

      const updatedMember = { ...targetMember, teamId: currentTeamId };

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

  const filteredMembers = members.filter((member) => {
    const matchesFilter =
      activeFilter === "All Members" ||
      member.department?.toLowerCase() === activeFilter.toLowerCase();

    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const selectedUserObject = nonMembers.find(
    (user) => String(user.id) === String(selectedUserId)
  );

  const filterTabs = ["All Members", "IT", "Development", "QA", "Design", "Marketing", "HR"];

  return (
    <SidebarProvider>
      <div className="team-page-wrapper">
        <AppSidebar className="m-5 p-5" />

        <header className="dashboard-header">
          <SidebarTrigger className="md:hidden text-white" />
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
                Manage roles, departments, and members across Team {currentTeamId || ""}. ({members.length} members found)
              </p>
            </div>
            <div className="team-header-actions">
              <button className="btn-secondary">
                <Filter size={16} /> Filter
              </button>
              {isManager && (
                <button className="createTaskBtn" onClick={() => setIsInviteModalOpen(true)}>
                  <UserPlus size={16} /> Add Member
                </button>
              )}
            </div>
          </div>

          <div className="status-filter-bar">
            {filterTabs.map((tab) => {
              const isActive = activeFilter === tab;
              const count = tab === "All Members" 
                ? members.length 
                : members.filter(m => m.department?.toLowerCase() === tab.toLowerCase()).length;

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
              <p className="empty-tasks-message">No team members match the current filter criteria.</p>
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
                    {isManager && (
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

              {isManager && (
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

        {isInviteModalOpen && isManager && (
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
                Select a user to assign them to Team {currentTeamId || ""}.
              </p>

              <form className="taskform" onSubmit={handleAssignMember}>
                <div>
                  <label>Select User</label>
                  {nonMembers.length === 0 ? (
                    <p className="tasks-subtitle" style={{ padding: "0.5rem 0" }}>
                      No available users found outside Team {currentTeamId}.
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
                        <div style={{ marginTop: "12px", padding: "10px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "8px" }}>
                          <span style={{ fontSize: "0.8rem", color: "#9ca3af", display: "block", marginBottom: "6px" }}>
                            Member Skills:
                          </span>
                          {selectedUserObject.skills && selectedUserObject.skills.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {selectedUserObject.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: "0.75rem",
                                    padding: "3px 9px",
                                    borderRadius: "12px",
                                    background: "rgba(99, 102, 241, 0.2)",
                                    color: "#a5b4fc",
                                    border: "1px solid rgba(99, 102, 241, 0.4)"
                                  }}
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                              No skills listed for this member.
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="buttons" style={{ marginTop: "20px" }}>
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