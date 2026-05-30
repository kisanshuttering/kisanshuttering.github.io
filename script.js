// script.js - Kisan Shuttering & Scaffolding
// Handlers for interactive features, modal popups, FAQ accordions, and lead generation

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initFaqs();
  initForms();
  initStickyHeader();
  initQuoteModal();
  animateOnScroll();
});

// Mobile Menu toggle with proper ARIA accessibility
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('close-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
      menuBtn.setAttribute('aria-expanded', 'true');
    });
  }
  
  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = '';
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // Close mobile menu on clicking any links
  const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = '';
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Custom Accordion logic for FAQs with slide animations
function initFaqs() {
  const faqHeaders = document.querySelectorAll('.faq-header');
  
  faqHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const isExpanded = header.getAttribute('aria-expanded') === 'true';
      const panelId = header.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      
      // Close all other FAQs in the same container
      const container = header.closest('.faq-container') || document;
      const allHeadersInContainer = container.querySelectorAll('.faq-header');
      allHeadersInContainer.forEach(h => {
        if (h !== header) {
          h.setAttribute('aria-expanded', 'false');
          const p = document.getElementById(h.getAttribute('aria-controls'));
          if (p) {
            p.classList.add('hidden');
            p.style.maxHeight = null;
          }
        }
      });

      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        if (panel) {
          panel.classList.add('hidden');
          panel.style.maxHeight = null;
        }
      } else {
        header.setAttribute('aria-expanded', 'true');
        if (panel) {
          panel.classList.remove('hidden');
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      }
    });
  });
}

// Form field validation & submit handler with local logging (Leads Panel)
function initForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Field validations
      const name = form.querySelector('[name="name"]');
      const company = form.querySelector('[name="company_name"]');
      const mobile = form.querySelector('[name="mobile_number"]');
      const city = form.querySelector('[name="city"]');
      const material = form.querySelector('[name="material_requirement"]');
      const size = form.querySelector('[name="project_size"]');
      const message = form.querySelector('[name="message"]');
      
      let isValid = true;
      
      // Validate Mobile Number (Indian match: 10 digits, starting with 6-9)
      const mobilePattern = /^[6-9]\d{9}$/;
      if (mobile && !mobilePattern.test(mobile.value.trim())) {
        showFieldError(mobile, "Please enter a valid 10-digit Indian mobile number");
        isValid = false;
      } else if (mobile) {
        clearFieldError(mobile);
      }
      
      // Validate Name
      if (name && name.value.trim().length < 3) {
        showFieldError(name, "Name must be at least 3 characters");
        isValid = false;
      } else if (name) {
        clearFieldError(name);
      }

      // Check materials selected or typed
      if (material && material.value === "") {
        showFieldError(material, "Please select or describe your material needs");
        isValid = false;
      } else if (material) {
        clearFieldError(material);
      }
      
      if (!isValid) return;
      
      // Create lead payload
      const lead = {
        id: 'LID-' + Date.now(),
        name: name ? name.value.trim() : 'Anonymous',
        company: company ? company.value.trim() : 'Not Specified',
        mobile: mobile ? mobile.value.trim() : '',
        city: city ? city.value : 'General',
        material: material ? material.value : 'General Requirement',
        size: size ? size.value : 'Not Specified',
        message: message ? message.value.trim() : '',
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };
      
      // Store to local storage
      const existingLeads = JSON.parse(localStorage.getItem('kisan_leads') || '[]');
      existingLeads.unshift(lead);
      localStorage.setItem('kisan_leads', JSON.stringify(existingLeads));
      
      // Dispatch custom event to update dashboard
      window.dispatchEvent(new Event('leads_updated'));
      
      // Show Success Modal / Alert
      showSuccessPopup(lead);
      form.reset();
    });
  });
}

function showFieldError(input, msg) {
  input.classList.add('border-red-500', 'ring-1', 'ring-red-500');
  let errLabel = input.parentElement.querySelector('.error-msg');
  if (!errLabel) {
    errLabel = document.createElement('span');
    errLabel.className = 'error-msg text-xs text-red-500 mt-1 block';
    input.parentElement.appendChild(errLabel);
  }
  errLabel.textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
  const errLabel = input.parentElement.querySelector('.error-msg');
  if (errLabel) errLabel.remove();
}

// Floating alert or beautifully styled full screen popup confirming details
function showSuccessPopup(lead) {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity duration-300';
  modal.innerHTML = `
    <div class="bg-[#1E1E1E] border-t-4 border-[#FFC107] text-white p-8 rounded-xl max-w-md w-full shadow-2xl relative text-center transform scale-95 transition-transform duration-300">
      <div class="w-16 h-16 bg-[#FFC107]/10 text-[#FFC107] flex items-center justify-center rounded-full mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 class="text-2xl font-bold font-sans text-white mb-2">Quote Request Submitted!</h3>
      <p class="text-gray-300 text-sm mb-6">Thank you, <strong>${lead.name}</strong>. Our rental dispatch team is reviewing your requirements for <strong>${lead.material}</strong> in <strong>${lead.city === 'General' ? 'your city' : lead.city}</strong>.</p>
      
      <div class="bg-black/40 rounded-lg p-4 mb-6 text-left border border-white/5 space-y-2 text-xs font-mono">
        <div class="flex justify-between text-gray-400"><span>Lead ID:</span> <span class="text-white">${lead.id}</span></div>
        <div class="flex justify-between text-gray-400"><span>Mobile:</span> <span class="text-white">+91 ${lead.mobile}</span></div>
        <div class="flex justify-between text-gray-400"><span>Delivery Queue:</span> <span class="text-[#FFC107]">Same-Day Priority</span></div>
      </div>
      
      <p class="text-xs text-gray-400 mb-6">Our coordinator will connect with you on +91 ${lead.mobile} within 15 minutes to share direct pricing.</p>
      
      <button class="w-full bg-[#FFC107] text-black font-semibold py-3 px-6 rounded-lg hover:bg-[#E0A800] transition duration-200 uppercase tracking-wider text-sm outline-none" id="close-success-btn">
        Back to Site
      </button>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  const closeBtn = document.getElementById('close-success-btn');
  closeBtn.addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });
}

// Header behavior when scrolling
function initStickyHeader() {
  const header = document.querySelector('header');
  if (!header) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('shadow-xl', 'bg-[#121212]/95');
    } else {
      header.classList.remove('shadow-xl', 'bg-[#121212]/95');
    }
  });
}

// General Quote Action Modal Trigger for customizable CTAs
function initQuoteModal() {
  const quoteBtns = document.querySelectorAll('a[href="#quote-modal"], button[data-action="quote"]');
  quoteBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQuoteModal(btn.dataset.material || '');
    });
  });
}

function openQuoteModal(prefillMaterial = '') {
  let modal = document.getElementById('global-quote-modal');
  if (modal) modal.remove();
  
  const pLower = prefillMaterial.toLowerCase();
  let mappedKey = '';
  if (pLower.includes('shuttering') || pLower.includes('plate') || pLower.includes('farma') || pLower.includes('channel') || pLower.includes('beam')) {
    mappedKey = 'shuttering';
  } else if (pLower.includes('cuplock') || pLower.includes('vertical') || pLower.includes('ledger')) {
    mappedKey = 'cuplock';
  } else if (pLower.includes('scaffolding')) {
    mappedKey = 'scaffolding';
  } else if (pLower.includes('jack') || pLower.includes('prop') || pLower.includes('span')) {
    mappedKey = 'jacks';
  } else if (pLower.includes('challi') || pLower.includes('walk') || pLower.includes('board') || pLower.includes('plank')) {
    mappedKey = 'challi';
  } else {
    mappedKey = prefillMaterial;
  }

  const currentCity = window.location.pathname.split('/').pop().replace('.html', '');
  const displayCity = currentCity && currentCity !== 'index' ? currentCity.charAt(0).toUpperCase() + currentCity.slice(1) : '';

  modal = document.createElement('div');
  modal.id = 'global-quote-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-[#1E1E1E] text-white rounded-xl border border-white/10 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl transform scale-95 transition-all duration-300">
      <div class="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1E1E1E] z-10">
        <h3 class="text-xl font-bold font-sans flex items-center text-[#FFC107]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Request Instant Bulk Quote
        </h3>
        <button class="text-gray-400 hover:text-white text-2xl font-semibold focus:outline-none" id="close-modal-btn">&times;</button>
      </div>
      
      <form class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Your Full Name *</label>
          <input type="text" name="name" required class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]" placeholder="e.g. Ramesh Kumar">
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Company / Project Name</label>
          <input type="text" name="company_name" class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]" placeholder="e.g. SKV Infra Pvt Ltd">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Mobile Number *</label>
            <input type="tel" name="mobile_number" required class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]" placeholder="e.g. 9876543210">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Project Location (City)</label>
            <select name="city" class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]">
              <option value="Gurgaon" ${displayCity === 'Gurgaon' ? 'selected' : ''}>Gurgaon</option>
              <option value="Noida" ${displayCity === 'Noida' ? 'selected' : ''}>Noida / Greater Noida</option>
              <option value="Bangalore" ${displayCity === 'Bangalore' ? 'selected' : ''}>Bangalore</option>
              <option value="Chennai" ${displayCity === 'Chennai' ? 'selected' : ''}>Chennai</option>
              <option value="Hyderabad" ${displayCity === 'Hyderabad' ? 'selected' : ''}>Hyderabad</option>
              <option value="Coimbatore" ${displayCity === 'Coimbatore' ? 'selected' : ''}>Coimbatore</option>
              <option value="Other" ${displayCity === '' ? 'selected' : ''}>Other Cities in India</option>
            </select>
          </div>
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Primary Material Requirement *</label>
          <select name="material_requirement" required class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]">
            <option value="">-- Select Material --</option>
            <option value="Shuttering Plates & Materials" ${mappedKey === 'shuttering' ? 'selected' : ''}>Shuttering Materials & Centering Plates</option>
            <option value="Heavy Scaffolding Systems" ${mappedKey === 'scaffolding' ? 'selected' : ''}>Heavy Duty Scaffolding (H-Frame / Multi-lock)</option>
            <option value="Cuplock Scaffolding System" ${mappedKey === 'cuplock' ? 'selected' : ''}>Cuplock Scaffold Standards & Ledgers</option>
            <option value="Adjustable Prop Jacks & Spans" ${mappedKey === 'jacks' ? 'selected' : ''}>Premium Prop Jacks, Spans & U-Jacks</option>
            <option value="MS Challi & Steel walk boards" ${mappedKey === 'challi' ? 'selected' : ''}>Industrial MS Challi / Walkway Planks</option>
            <option value="Full Infrastructure Project Logistics">Complete Slab Shuttering Package (High-Rise / Industrial)</option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Approximate Project Size / Volume</label>
          <input type="text" name="project_size" class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]" placeholder="e.g., 10,000 sq.ft slab, 500 pcs prop jacks">
        </div>
        
        <div>
          <label class="block text-xs font-semibold text-gray-300 uppercase mb-1">Additional Project Details</label>
          <textarea name="message" rows="3" class="w-full bg-black/30 border border-white/10 text-white rounded-lg px-4 py-2 text-sm focus:border-[#FFC107] focus:outline-none focus:ring-1 focus:ring-[#FFC107]" placeholder="Specify rental duration, start date, site address, and load bearing requirements."></textarea>
        </div>
        
        <p class="text-[11px] text-gray-400">By clicking submit, you request Kisan Shuttering to verify material availability and offer premium corporate rental rates for the duration selected.</p>
        
        <button type="submit" class="w-full bg-[#FFC107] hover:bg-[#E0A800] text-black font-bold uppercase tracking-wider py-3 px-4 rounded-lg transition duration-200">
          Get Instant Pricing Sheet
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Event handlers to close
  const closeBtn = document.getElementById('close-modal-btn');
  closeBtn.addEventListener('click', () => {
    modal.remove();
    document.body.style.overflow = '';
  });

  // Handle outside click close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = '';
    }
  });

  // Re-hook validations on the modal form
  initForms();
}

// Fade in elements nicely on viewport exit
function animateOnScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  if (elements.length === 0) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  elements.forEach(el => observer.observe(el));
}
