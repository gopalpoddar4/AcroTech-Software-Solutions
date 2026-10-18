/**
 * IT World — Career Page Interactions & Firebase Integration
 * 
 * Handles:
 * 1. Rendering Section 1: Current Openings (from centralized jobs-data)
 * 2. Section 1 "Apply Now" informational modal
 * 3. Section 2: Join as Intern deadline calculation (25 October 2026 Asia/Kolkata)
 * 4. Section 2: Internship Application Modal & accessible Form Validation
 * 5. Firebase Realtime Database application submission (push ID, status pending)
 * 6. Section 3: Realtime "Our Interns" showcase listener (loading, empty, error states)
 * 7. Horizontal carousel scroll controls
 */

// Import centralized configuration and data
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';
import { JOB_OPENINGS } from './jobs-data.js';

(function () {
  'use strict';

  // =========================================================================
  // CONSTANTS & CONFIGURATION
  // =========================================================================

  // Internship Application Deadline: 25 October 2026, 23:59:59 IST (+05:30)
  // Asia/Kolkata timezone standard
  const DEADLINE_DATE_STRING = "2026-10-25T23:59:59+05:30";
  const DEADLINE_EPOCH = new Date(DEADLINE_DATE_STRING).getTime();

  // Reference to jobs list
  const jobListings = (typeof JOB_OPENINGS !== 'undefined' ? JOB_OPENINGS : window.IT_WORLD_JOB_OPENINGS) || [];

  // Firebase references
  let firebaseApp = null;
  let database = null;
  let dbRef = null;
  let dbPush = null;
  let dbSet = null;
  let dbOnValue = null;
  let dbOff = null;
  let dbServerTimestamp = null;
  let internsListenerRef = null;

  // =========================================================================
  // 1. SECTION ONE: CURRENT OPENINGS
  // =========================================================================

  function renderJobOpenings() {
    const jobsContainer = document.getElementById('jobs-grid');
    if (!jobsContainer) return;

    if (!jobListings || jobListings.length === 0) {
      jobsContainer.innerHTML = `
        <div class="jobs-empty-state">
          <p>There are no current job openings available. Please check back later.</p>
        </div>
      `;
      return;
    }

    jobsContainer.innerHTML = jobListings.map(function (job) {
      const skillsHtml = (job.skillTags || []).map(function (skill) {
        return `<span class="job-skill-tag">${escapeHtml(skill)}</span>`;
      }).join('');

      const responsibilitiesHtml = (job.responsibilities || []).map(function (resp) {
        return `
          <li class="job-list-item">
            <svg class="job-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>${escapeHtml(resp)}</span>
          </li>
        `;
      }).join('');

      const requiredSkillsHtml = (job.requiredSkills || []).map(function (skill) {
        return `
          <li class="job-list-item">
            <svg class="job-item-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            <span>${escapeHtml(skill)}</span>
          </li>
        `;
      }).join('');

      return `
        <article class="job-card" data-job-id="${escapeHtml(job.id)}">
          <div class="job-card-header">
            <div class="job-card-header-top">
              <span class="job-dept-badge">${escapeHtml(job.department)}</span>
              ${job.isSample ? `<span class="sample-badge">${escapeHtml(job.sampleBadge || 'Sample Opening')}</span>` : ''}
            </div>
            <h3 class="job-title">${escapeHtml(job.title)}</h3>
            <div class="job-meta-grid">
              <div class="job-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                <span>${escapeHtml(job.employmentType)}</span>
              </div>
              <div class="job-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>${escapeHtml(job.experience)}</span>
              </div>
              <div class="job-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>${escapeHtml(job.location)}</span>
              </div>
              <div class="job-meta-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>${escapeHtml(job.workMode)}</span>
              </div>
            </div>
            <div class="job-salary-banner">
              <span class="salary-label">Compensation:</span>
              <span class="salary-value">${escapeHtml(job.salary)}</span>
            </div>
          </div>

          <div class="job-card-body">
            <p class="job-description">${escapeHtml(job.description)}</p>

            <div class="job-detail-block">
              <h4 class="job-subheading">Key Responsibilities:</h4>
              <ul class="job-detail-list">
                ${responsibilitiesHtml}
              </ul>
            </div>

            <div class="job-detail-block">
              <h4 class="job-subheading">Required Skills:</h4>
              <ul class="job-detail-list">
                ${requiredSkillsHtml}
              </ul>
            </div>

            <div class="job-skills-wrap">
              ${skillsHtml}
            </div>
          </div>

          <div class="job-card-footer">
            <button type="button" class="btn btn-primary btn-apply-job" data-job-title="${escapeHtml(job.title)}" data-job-id="${escapeHtml(job.id)}">
              Apply Now
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach click listener to job application buttons
    const applyButtons = jobsContainer.querySelectorAll('.btn-apply-job');
    applyButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        const jobTitle = this.getAttribute('data-job-title') || 'this position';
        showJobNoticeModal(jobTitle);
      });
    });
  }

  // Informational modal for Job Openings (distinct from Internship application)
  function showJobNoticeModal(jobTitle) {
    const noticeModal = document.getElementById('job-notice-modal');
    const noticeTitle = document.getElementById('job-notice-title');
    const noticeDesc = document.getElementById('job-notice-desc');
    if (!noticeModal) return;

    if (noticeTitle) {
      noticeTitle.textContent = `${jobTitle} — Application Status`;
    }
    if (noticeDesc) {
      noticeDesc.textContent = "Applications for this position will be available soon.";
    }

    openModal(noticeModal);
  }

  // =========================================================================
  // 2. SECTION TWO: JOIN AS INTERN & DEADLINE LOGIC
  // =========================================================================

  function evaluateDeadline() {
    const now = Date.now();
    const isExpired = now > DEADLINE_EPOCH;

    const joinBtn = document.getElementById('btn-join-now');
    const statusPill = document.getElementById('deadline-status-pill');
    const countdownText = document.getElementById('deadline-countdown-text');
    const closedNotice = document.getElementById('deadline-closed-notice');

    if (isExpired) {
      if (joinBtn) {
        joinBtn.disabled = true;
        joinBtn.classList.remove('btn-primary');
        joinBtn.classList.add('btn-secondary');
        joinBtn.setAttribute('aria-disabled', 'true');
        joinBtn.innerHTML = `
          <span>Applications Closed</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
          </svg>
        `;
      }
      if (statusPill) {
        statusPill.className = 'status-pill status-pill-closed';
        statusPill.textContent = 'Applications Closed';
      }
      if (countdownText) {
        countdownText.textContent = 'Application period ended on 25 October 2026.';
      }
      if (closedNotice) {
        closedNotice.hidden = false;
      }
      return true;
    } else {
      if (joinBtn) {
        joinBtn.disabled = false;
        joinBtn.classList.add('btn-primary');
        joinBtn.classList.remove('btn-secondary');
        joinBtn.removeAttribute('aria-disabled');
        joinBtn.innerHTML = `
          <span>Join Now</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
      if (statusPill) {
        statusPill.className = 'status-pill status-pill-open';
        statusPill.textContent = 'Applications Open';
      }
      if (countdownText) {
        const remainingMs = DEADLINE_EPOCH - now;
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (days > 0) {
          countdownText.textContent = `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''} remaining`;
        } else {
          countdownText.textContent = `Less than 24 hours remaining — Final day!`;
        }
      }
      if (closedNotice) {
        closedNotice.hidden = true;
      }
      return false;
    }
  }

  // =========================================================================
  // 3. INTERNSHIP APPLICATION MODAL & ACCESSIBLE FORM VALIDATION
  // =========================================================================

  let activeModal = null;
  let previousFocusedElement = null;

  function openModal(modalEl) {
    if (!modalEl) return;
    activeModal = modalEl;
    previousFocusedElement = document.activeElement;

    modalEl.classList.add('is-open');
    modalEl.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    // Focus the first input or close button
    requestAnimationFrame(function () {
      const focusable = modalEl.querySelector('input, select, textarea, button:not([disabled])');
      if (focusable) focusable.focus();
    });
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
      previousFocusedElement.focus();
    }
    activeModal = null;
  }

  function initModalHandlers() {
    // Join Now button opens internship application modal
    const joinBtn = document.getElementById('btn-join-now');
    const internshipModal = document.getElementById('internship-modal');

    if (joinBtn && internshipModal) {
      joinBtn.addEventListener('click', function () {
        if (evaluateDeadline()) {
          // If deadline expired, do not open application form
          return;
        }
        openModal(internshipModal);
      });
    }

    // Modal Close buttons
    document.querySelectorAll('[data-close-modal]').forEach(function (button) {
      button.addEventListener('click', function () {
        const targetModal = this.closest('.modal-backdrop');
        if (targetModal) closeModal(targetModal);
      });
    });

    // Close when clicking outside modal content
    document.querySelectorAll('.modal-backdrop').forEach(function (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) {
          closeModal(backdrop);
        }
      });
    });

    // Close with Escape key and trap Tab focus
    document.addEventListener('keydown', function (e) {
      if (!activeModal) return;

      if (e.key === 'Escape') {
        closeModal(activeModal);
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = activeModal.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }

  // Form Validation logic
  function validateField(fieldEl) {
    const name = fieldEl.name;
    const value = fieldEl.value.trim();
    const errorEl = document.getElementById(`error-${name}`);
    let errorMessage = '';

    if (fieldEl.hasAttribute('required') && !value) {
      errorMessage = 'This field is required.';
    } else if (name === 'email' && value) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(value)) {
        errorMessage = 'Please enter a valid email address (e.g., name@example.com).';
      }
    } else if (name === 'mobileNumber' && value) {
      // Indian mobile format: 10 digits starting with 6, 7, 8, or 9, optional +91 or 0 prefix
      const cleaned = value.replace(/[\s-]/g, '');
      const indianPhoneRegex = /^(?:\+?91|0)?[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(cleaned)) {
        errorMessage = 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
      }
    } else if (name === 'profileUrl' && value) {
      try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          errorMessage = 'URL must begin with http:// or https://';
        }
      } catch (_) {
        errorMessage = 'Please enter a valid URL (e.g., https://linkedin.com/in/yourprofile).';
      }
    } else if (name === 'introduction' && value && value.length < 20) {
      errorMessage = 'Please provide a brief introduction (at least 20 characters).';
    }

    if (errorMessage) {
      fieldEl.classList.add('is-invalid');
      fieldEl.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = errorMessage;
        errorEl.hidden = false;
      }
      return false;
    } else {
      fieldEl.classList.remove('is-invalid');
      fieldEl.removeAttribute('aria-invalid');
      if (errorEl) {
        errorEl.textContent = '';
        errorEl.hidden = true;
      }
      return true;
    }
  }

  function initFormValidationAndSubmission() {
    const form = document.getElementById('internship-application-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, select, textarea');

    // Real-time blur validation
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        if (this.value.trim() !== '') {
          validateField(this);
        }
      });
      input.addEventListener('input', function () {
        if (this.classList.contains('is-invalid')) {
          validateField(this);
        }
      });
    });

    // Form submit handler
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Check deadline before processing
      if (evaluateDeadline()) {
        displayFormAlert('Applications for the Autumn Internship have closed.', 'error');
        return;
      }

      let isValid = true;
      let firstInvalid = null;

      inputs.forEach(function (input) {
        const fieldValid = validateField(input);
        if (!fieldValid && !firstInvalid) {
          firstInvalid = input;
          isValid = false;
        }
      });

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        displayFormAlert('Please resolve the highlighted errors before submitting.', 'error');
        return;
      }

      // Collect data safely
      const formData = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        mobileNumber: form.mobileNumber.value.trim(),
        interestedRole: form.interestedRole.value,
        collegeName: form.collegeName.value.trim(),
        degree: form.degree.value.trim(),
        studyYear: form.studyYear.value,
        skills: form.skills.value.trim(),
        introduction: form.introduction.value.trim(),
        profileUrl: form.profileUrl.value.trim() || null,
        status: 'pending'
      };

      const submitBtn = document.getElementById('internship-submit-btn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnSpinner = submitBtn.querySelector('.btn-spinner');

      // Prevent accidental duplicate submissions
      submitBtn.disabled = true;
      if (btnText) btnText.textContent = 'Submitting Application...';
      if (btnSpinner) btnSpinner.hidden = false;
      clearFormAlert();

      try {
        const submissionResult = await submitInternshipApplication(formData);

        if (submissionResult.success) {
          // Show persistent success card
          showFormSuccess(submissionResult.applicationId);
          form.reset();
        } else {
          // Submission failure - DO NOT erase inputs
          displayFormAlert(submissionResult.message, 'error');
        }
      } catch (err) {
        console.error('Submission error:', err);
        displayFormAlert(
          'We were unable to complete your submission due to a connection error. Please try again. Your information has been preserved.',
          'error'
        );
      } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Submit Application';
        if (btnSpinner) btnSpinner.hidden = true;
      }
    });
  }

  function displayFormAlert(message, type) {
    const alertBox = document.getElementById('form-alert-message');
    if (!alertBox) return;
    alertBox.className = `form-alert form-alert-${type}`;
    alertBox.textContent = message;
    alertBox.hidden = false;
    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function clearFormAlert() {
    const alertBox = document.getElementById('form-alert-message');
    if (!alertBox) return;
    alertBox.hidden = true;
    alertBox.textContent = '';
  }

  function showFormSuccess(applicationId) {
    const formContainer = document.getElementById('modal-form-container');
    const successContainer = document.getElementById('modal-success-container');
    const refCodeEl = document.getElementById('application-ref-code');

    if (formContainer && successContainer) {
      formContainer.hidden = true;
      successContainer.hidden = false;
      if (refCodeEl && applicationId) {
        refCodeEl.textContent = applicationId;
      }
    }
  }

  // Reset modal state when closed
  const resetSuccessBtn = document.getElementById('btn-success-close');
  if (resetSuccessBtn) {
    resetSuccessBtn.addEventListener('click', function () {
      const formContainer = document.getElementById('modal-form-container');
      const successContainer = document.getElementById('modal-success-container');
      const internshipModal = document.getElementById('internship-modal');

      if (internshipModal) closeModal(internshipModal);

      // Reset view back to form for future opening
      setTimeout(function () {
        if (formContainer) formContainer.hidden = false;
        if (successContainer) successContainer.hidden = true;
        clearFormAlert();
      }, 300);
    });
  }

  // =========================================================================
  // 4. FIREBASE REALTIME DATABASE APPLICATION SUBMISSION
  // =========================================================================

  async function submitInternshipApplication(data) {
    // Check if Firebase configuration has been provided
    const configured = isFirebaseConfigured();

    if (!configured) {
      // Graceful fallback when Firebase credentials are not yet set
      console.info('Firebase Realtime Database configuration pending in js/firebase-config.js.');
      return {
        success: false,
        message: 'Firebase Realtime Database configuration is pending. Please configure your Firebase project credentials in js/firebase-config.js. Your form inputs have been preserved.'
      };
    }

    // Initialize Firebase SDK if needed
    const initialized = await ensureFirebaseInitialized();
    if (!initialized || !database) {
      return {
        success: false,
        message: 'Database connection could not be established. Please verify your internet connection or check Firebase settings.'
      };
    }

    try {
      // 1. Generate a unique application ID via push-key
      const applicationsRef = dbRef(database, 'internshipApplications');
      const newAppRef = dbPush(applicationsRef);
      const applicationId = newAppRef.key;

      // 2. Prepare payload with server timestamp
      const payload = {
        applicationId: applicationId,
        fullName: data.fullName,
        email: data.email,
        mobileNumber: data.mobileNumber,
        interestedRole: data.interestedRole,
        collegeName: data.collegeName,
        degree: data.degree,
        studyYear: data.studyYear,
        skills: data.skills,
        introduction: data.introduction,
        profileUrl: data.profileUrl || null,
        status: 'pending',
        submittedAt: dbServerTimestamp ? dbServerTimestamp() : new Date().toISOString()
      };

      // 3. Write to database using set()
      await dbSet(newAppRef, payload);

      return {
        success: true,
        applicationId: applicationId
      };
    } catch (err) {
      console.error('Firebase submission write error:', err);
      return {
        success: false,
        message: 'Submission failed while writing to the database. Please verify Realtime Database Security Rules and try again. Your information has been preserved.'
      };
    }
  }

  // =========================================================================
  // 5. SECTION THREE: OUR INTERNS REALTIME LISTENER & CAROUSEL
  // =========================================================================

  async function initInternsShowcase() {
    const loadingEl = document.getElementById('interns-loading');
    const emptyEl = document.getElementById('interns-empty');
    const errorEl = document.getElementById('interns-error');
    const trackEl = document.getElementById('interns-track');

    function showState(state) {
      if (loadingEl) loadingEl.hidden = (state !== 'loading');
      if (emptyEl) emptyEl.hidden = (state !== 'empty');
      if (errorEl) errorEl.hidden = (state !== 'error');
      if (trackEl) trackEl.hidden = (state !== 'content');
    }

    // Default loading state
    showState('loading');

    const configured = isFirebaseConfigured();
    if (!configured) {
      // If Firebase is not configured with live credentials, transition to empty state
      setTimeout(function () {
        showState('empty');
      }, 600);
      return;
    }

    const initialized = await ensureFirebaseInitialized();
    if (!initialized || !database) {
      showState('error');
      return;
    }

    try {
      // Prefer publicProfiles path for clean public separation; fallback to interns path
      const profilesRef = dbRef(database, 'publicProfiles');
      internsListenerRef = profilesRef;

      dbOnValue(profilesRef, function (snapshot) {
        if (!snapshot.exists()) {
          // If publicProfiles does not exist, attempt fallback to interns
          fetchFallbackInterns(function (fallbackData) {
            handleInternsData(fallbackData, showState, trackEl);
          });
          return;
        }

        const data = snapshot.val();
        handleInternsData(data, showState, trackEl);
      }, function (error) {
        console.warn('Realtime Database listener error:', error);
        // If publicProfiles has permission or path issue, try interns
        fetchFallbackInterns(function (fallbackData) {
          handleInternsData(fallbackData, showState, trackEl);
        });
      });

    } catch (err) {
      console.error('Error attaching intern listener:', err);
      showState('error');
    }
  }

  function fetchFallbackInterns(callback) {
    if (!database) {
      callback(null);
      return;
    }
    try {
      const internsRef = dbRef(database, 'interns');
      dbOnValue(internsRef, function (snapshot) {
        if (snapshot.exists()) {
          callback(snapshot.val());
        } else {
          callback(null);
        }
      }, function (err) {
        console.warn('Fallback interns fetch error:', err);
        callback(null);
      }, { onlyOnce: true });
    } catch (_) {
      callback(null);
    }
  }

  function handleInternsData(dataObj, showState, trackEl) {
    if (!dataObj) {
      showState('empty');
      return;
    }

    // Extract records and filter by profileVisible and active status
    const publicInterns = [];
    Object.keys(dataObj).forEach(function (key) {
      const intern = dataObj[key];
      // STRICT PUBLIC DISPLAY RULES:
      // Only display interns where profileVisible is explicitly true and status is 'active'
      if (intern && intern.profileVisible === true && (intern.status === 'active' || !intern.status)) {
        publicInterns.push({
          fullName: intern.fullName || 'IT World Intern',
          role: intern.role || 'Engineering Intern',
          imageUrl: intern.imageUrl || ''
        });
      }
    });

    if (publicInterns.length === 0) {
      showState('empty');
      return;
    }

    // Render cards safely without exposing any internal IDs, emails, or credentials
    trackEl.innerHTML = publicInterns.map(function (intern) {
      const initials = getInitials(intern.fullName);
      const safeName = escapeHtml(intern.fullName);
      const safeRole = escapeHtml(intern.role);

      return `
        <div class="intern-card">
          <div class="intern-avatar-container">
            ${intern.imageUrl ? `
              <img 
                src="${escapeHtml(intern.imageUrl)}" 
                alt="${safeName}" 
                class="intern-avatar-img"
                loading="lazy"
                onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';"
              >
              <div class="intern-avatar-fallback" style="display:none;" aria-hidden="true">${initials}</div>
            ` : `
              <div class="intern-avatar-fallback" aria-hidden="true">${initials}</div>
            `}
          </div>
          <div class="intern-info">
            <h3 class="intern-name">${safeName}</h3>
            <p class="intern-role">${safeRole}</p>
            <span class="intern-status-badge">
              <span class="status-dot"></span>
              Active Intern
            </span>
          </div>
        </div>
      `;
    }).join('');

    showState('content');
    updateCarouselControls();
  }

  // Intern Showcase Carousel controls
  function initCarouselControls() {
    const track = document.getElementById('interns-track');
    const prevBtn = document.getElementById('carousel-btn-prev');
    const nextBtn = document.getElementById('carousel-btn-next');

    if (!track || !prevBtn || !nextBtn) return;

    prevBtn.addEventListener('click', function () {
      const cardWidth = track.querySelector('.intern-card')?.offsetWidth || 300;
      track.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function () {
      const cardWidth = track.querySelector('.intern-card')?.offsetWidth || 300;
      track.scrollBy({ left: cardWidth + 24, behavior: 'smooth' });
    });

    track.addEventListener('scroll', updateCarouselControls, { passive: true });
  }

  function updateCarouselControls() {
    const track = document.getElementById('interns-track');
    const prevBtn = document.getElementById('carousel-btn-prev');
    const nextBtn = document.getElementById('carousel-btn-next');
    if (!track || !prevBtn || !nextBtn) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    prevBtn.disabled = track.scrollLeft <= 5;
    nextBtn.disabled = track.scrollLeft >= maxScroll - 5;
  }

  // =========================================================================
  // 6. FIREBASE INITIALIZATION HELPER (MODULAR SDK)
  // =========================================================================

  async function ensureFirebaseInitialized() {
    if (database) return true;

    try {
      // Dynamic import from official modular Google CDN
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
      const { getDatabase, ref, push, set, onValue, off, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');

      // Reuse existing Firebase app instance if already created to avoid duplicates
      if (getApps().length > 0) {
        firebaseApp = getApps()[0];
      } else {
        firebaseApp = initializeApp(firebaseConfig);
      }

      database = getDatabase(firebaseApp);
      dbRef = ref;
      dbPush = push;
      dbSet = set;
      dbOnValue = onValue;
      dbOff = off;
      dbServerTimestamp = serverTimestamp;

      return true;
    } catch (err) {
      console.warn('Firebase Modular SDK dynamic load error:', err);
      return false;
    }
  }

  // Detach listeners when user navigates away
  window.addEventListener('beforeunload', function () {
    if (internsListenerRef && dbOff) {
      try {
        dbOff(internsListenerRef);
      } catch (_) {}
    }
  });

  // =========================================================================
  // UTILITY HELPERS
  // =========================================================================

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getInitials(name) {
    if (!name) return 'IT';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================

  function init() {
    renderJobOpenings();
    evaluateDeadline();
    // Re-check deadline every 60 seconds
    setInterval(evaluateDeadline, 60000);
    initModalHandlers();
    initFormValidationAndSubmission();
    initInternsShowcase();
    initCarouselControls();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
