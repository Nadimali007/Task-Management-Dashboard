import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Mail, 
  MapPin, 
  Clock,
  Share2,
  Edit,
  Star,
  User,
  X,
  Save,
  Loader2,
  Lock,
  Award
} from "lucide-react";
import { getProfiles, updateProfile } from "@/services/authservices";
import '../css/profile.css';

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({});

  const [pakistanTime, setPakistanTime] = useState("");

  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Karachi",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(now);

      setPakistanTime(`${formattedTime} (PKT)`);
    };

    updateTime(); 
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        const sessionUser = JSON.parse(sessionStorage.getItem("user") || "{}");
        const localUser = JSON.parse(localStorage.getItem("user") || "{}");

        const targetUserId =
          location.state?.UserID ||
          location.state?.userId ||
          sessionUser?.id ||
          sessionUser?.userId ||
          localUser?.id ||
          localUser?.userId ||
          sessionStorage.getItem("currentUserId");

        const targetEmail =
          location.state?.email ||
          sessionUser?.email ||
          localUser?.email;

        const allProfiles = await getProfiles();

        let matchedProfile = null;

        if (targetUserId) {
          matchedProfile = allProfiles.find(
            (p) => String(p.userId || p.id || p._id).trim() === String(targetUserId).trim()
          );
        }

        if (!matchedProfile && targetEmail) {
          matchedProfile = allProfiles.find(
            (p) => p.email?.trim().toLowerCase() === targetEmail.trim().toLowerCase()
          );
        }

        if (!matchedProfile && allProfiles.length > 0) {
          matchedProfile = allProfiles[0];
        }

        setProfile(matchedProfile || null);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [location.state]);

  const handleOpenEditModal = () => {
    if (!profile) return;

    const rawSkills = Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : typeof profile.skills === "string"
      ? profile.skills
      : "Strategic Planning, Operations, Team Leadership, Process Scaling";

    setFormData({
      id: profile.id || profile._id || "",
      userId: profile.userId || profile.id || "",
      email: profile.email || "",
      fullName: profile.fullName || "",
      jobTitle: profile.jobTitle || "",
      location: profile.location || "",
      availability: profile.availability || "Available Now",
      bio: profile.bio || "",
      employeeId: profile.employeeId || "",
      joinedDate: profile.joinedDate || "",
      reportsTo: profile.reportsTo || "",
      directLine: profile.directLine || "",
      workExtension: profile.workExtension || "",
      slackHandle: profile.slackHandle || "",
      skills: rawSkills,
      performanceRating: profile.performanceRating !== undefined ? profile.performanceRating : 4.5
    });

    setIsEditModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const parsedRating = parseFloat(formData.performanceRating);
      const cleanPerformanceRating = isNaN(parsedRating) ? 4.5 : parsedRating;

      const targetId = profile?.id || profile?.userId || profile?._id || formData.id || formData.userId;

      const skillsArray = typeof formData.skills === "string"
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : Array.isArray(formData.skills) ? formData.skills : [];

      const payload = {
        id: formData.id || targetId,
        userId: String(formData.userId || targetId),
        email: profile?.email || formData.email, 
        fullName: formData.fullName,
        jobTitle: formData.jobTitle,
        location: formData.location,
        availability: formData.availability,
        bio: formData.bio,
        employeeId: profile?.employeeId || formData.employeeId, 
        joinedDate: profile?.joinedDate || formData.joinedDate, 
        reportsTo: formData.reportsTo,
        directLine: formData.directLine,
        workExtension: formData.workExtension,
        slackHandle: formData.slackHandle,
        skills: skillsArray,
        performanceRating: cleanPerformanceRating
      };

      let updatedResult = null;

      if (typeof updateProfile === "function") {
        try {
          updatedResult = await updateProfile(targetId, payload);
        } catch (err) {
          updatedResult = await updateProfile(payload);
        }
      }

      const finalProfileData = updatedResult || payload;

      setProfile((prev) => ({
        ...prev,
        ...finalProfileData
      }));

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile in database:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Error saving profile changes.";
      alert(`Save Failed: ${errorMessage}`);
    } finally {
      setIsSaving(false);
    }
  };

  const displaySkills = Array.isArray(profile?.skills) && profile.skills.length > 0
    ? profile.skills
    : typeof profile?.skills === "string" && profile.skills.trim()
    ? profile.skills.split(",").map((s) => s.trim())
    : ["Strategic Planning", "Operations", "Team Leadership", "Process Scaling"];

  return (
    <SidebarProvider>
      <div className="profile-page-wrapper">
        <AppSidebar className="m-5 p-5" />

        <main className="profile-main-content">
          <header className="dashboard-header">
            <SidebarTrigger className="md:hidden" />
            <div className="search-container-header">
              <Search className="search-icon" />
              <Input
                type="search"
                placeholder="Search tasks..."
                className="search-input"
              />
            </div>
          </header>

          <div className="profile-container">
            {loading ? (
              <div className="profile-loading">Loading profile information...</div>
            ) : profile ? (
              <div className="profile-wrapper-layout">
                
                <div className="profile-top-card">
                  <div className="profile-avatar-container">
                    <User className="profile-user-icon" size={54} />
                  </div>
                  
                  <div className="profile-header-details">
                    <div className="profile-header-top-row">
                      <div>
                        <h1 className="profile-user-name">{profile.fullName || "Alexander J. Sterling"}</h1>
                        <h2 className="profile-job-title">{profile.jobTitle || "Director of Strategic Operations"}</h2>
                      </div>
                      <div className="profile-action-buttons">
                        <button className="profile-btn btn-secondary">
                          <Share2 size={14} /> Share
                        </button>
                        <button className="profile-btn btn-primary" onClick={handleOpenEditModal}>
                          <Edit size={14} /> Edit Profile
                        </button>
                      </div>
                    </div>

                    <div className="profile-meta-info">
                      <span><MapPin size={15} /> {profile.location || "Islamabad, Pakistan"}</span>
                      <span><Mail size={15} /> {profile.email || "a.sterling@taskmaster.pro"}</span>
                      <span><Clock size={15} /> Local time: {pakistanTime || "Loading time..."}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-row-two-col">
                  <div className="profile-card bio-card">
                    <h3 className="card-heading">Executive Biography</h3>
                    <p className="bio-text">
                      {profile.bio || "With over 15 years of experience in enterprise project management..."}
                    </p>
                  </div>

                  <div className="profile-card performance-card">
                    <h3 className="card-heading">Q3 Performance</h3>
                    <div className="performance-chart-placeholder">
                      <div className="chart-ring">
                        <Star size={22} className="chart-star-icon" />
                        <span className="rating-score">{profile.performanceRating || "4.9"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-row-two-col">
                  <div className="profile-card info-card">
                    <h3 className="card-heading">Personal Information</h3>
                    <div className="info-pairs-grid">
                      <div className="info-pair">
                        <span className="info-label">FULL NAME</span>
                        <span className="info-value">{profile.fullName || "Alexander J. Sterling"}</span>
                      </div>
                      <div className="info-pair">
                        <span className="info-label">EMPLOYEE ID</span>
                        <span className="info-value">{profile.employeeId || "TM-99283"}</span>
                      </div>
                      <div className="info-pair">
                        <span className="info-label">JOINED</span>
                        <span className="info-value">{profile.joinedDate || "Oct 2018 (6 years)"}</span>
                      </div>
                      <div className="info-pair">
                        <span className="info-label">REPORTS TO</span>
                        <span className="info-value">{profile.reportsTo || "Chief Tech Officer"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-card info-card">
                    <h3 className="card-heading">Contact Details</h3>
                    <div className="info-pairs-grid">
                      <div className="info-pair">
                        <span className="info-label">DIRECT LINE</span>
                        <span className="info-value">{profile.directLine || "+1 (555) 092-3341"}</span>
                      </div>
                      <div className="info-pair">
                        <span className="info-label">WORK EXTENSION</span>
                        <span className="info-value">{profile.workExtension || "#440"}</span>
                      </div>
                      <div className="info-pair">
                        <span className="info-label">SLACK HANDLE</span>
                        <span className="info-value">{profile.slackHandle || "@asterling_hq"}</span>
                      </div>
                      <div className="info-pair">
                        <span className="info-label">AVAILABILITY</span>
                        <span className="info-value highlight-availability">{profile.availability || "Available Now"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="profile-card full-width-card">
                  <div className="skills-header">
                    <h3 className="card-heading">Core Competencies & Skills</h3>
                    <button className="profile-btn btn-secondary text-xs" onClick={handleOpenEditModal}>
                      <Award size={13} /> Manage Skills
                    </button>
                  </div>
                  <div className="skills-badges-container">
                    {displaySkills.map((skill, index) => (
                      <span key={index} className="skill-badge">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="profile-not-found">No profile found.</div>
            )}
          </div>
        </main>

        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <div className="modal-header-spacer"></div>
                <h3 className="modal-title">Edit Profile Information</h3>
                <button className="modal-close-btn" onClick={() => setIsEditModalOpen(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="modal-form">
                <div className="modal-form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Job Title</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Email <Lock size={12} />
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#181d2a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Employee ID <Lock size={12} />
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      readOnly
                      style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#181d2a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      Joined Date <Lock size={12} />
                    </label>
                    <input
                      type="text"
                      name="joinedDate"
                      value={formData.joinedDate}
                      readOnly
                      style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#181d2a' }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Reports To</label>
                    <input
                      type="text"
                      name="reportsTo"
                      value={formData.reportsTo}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Performance Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      name="performanceRating"
                      value={formData.performanceRating}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Direct Line</label>
                    <input
                      type="text"
                      name="directLine"
                      value={formData.directLine}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Work Extension</label>
                    <input
                      type="text"
                      name="workExtension"
                      value={formData.workExtension}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Slack Handle</label>
                    <input
                      type="text"
                      name="slackHandle"
                      value={formData.slackHandle}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Availability</label>
                    <input
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Skills & Core Competencies (separated by comma)</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. Strategic Planning, Operations, React.js"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Executive Biography</label>
                    <textarea
                      name="bio"
                      rows="4"
                      value={formData.bio}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="profile-btn btn-secondary"
                    onClick={() => setIsEditModalOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="profile-btn btn-primary" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 size={14} className="spin-icon" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save size={14} /> Save Changes
                      </>
                    )}
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

export default Profile;