// ============================================
// ADMIN TEMPLATE MANAGER - v1.0
// Customs Admin Letters Management System
// ============================================

const AdminTemplateManager = {
  
  // ===== CUSTOMS BHUBANESWAR OFFICER HIERARCHY =====
  officers: {
    'customs_bhubaneswar': [
      {
        id: 'so_001',
        name: 'Subhendra Pattanaik',
        designation: 'Superintendent Admin',
        shortCode: 'SO',
        level: 1,
        section: 'Admin',
        status: 'active',
        authority: {
          canSign: ['pao_letter', 'gpf_withdrawal', 'vigilance_letter'],
          canApprove: ['internal_notes', 'pension_letters']
        }
      },
      {
        id: 'ac_001',
        name: 'Ashok Kumar Kar',
        designation: 'Assistant Commissioner',
        shortCode: 'AC',
        level: 2,
        section: 'Operations',
        status: 'active',
        authority: {
          canSign: ['orders', 'approvals'],
          canApprove: ['pension_letters', 'transfer_orders']
        }
      },
      {
        id: 'addcomm_001',
        name: 'Abhinav Yadav',
        designation: 'Additional Commissioner',
        shortCode: 'Ad.Comm',
        level: 3,
        section: 'Administration',
        status: 'active',
        authority: {
          canSign: ['critical_orders'],
          canApprove: ['all_documents']
        }
      },
      {
        id: 'comm_001',
        name: 'Aseem Kumar',
        designation: 'Commissioner',
        shortCode: 'Commr',
        level: 4,
        section: 'Executive',
        status: 'active',
        authority: {
          canSign: ['all_critical'],
          canApprove: ['all_documents']
        }
      }
    ]
  },

  // ===== ADMIN LETTER TEMPLATES =====
  templates: {
    'pao_vigilance_letter': {
      id: 'tmpl_pao_vig',
      name: 'PAO Vigilance Clearance Letter',
      category: 'PAO Communication',
      description: 'Forwarding vigilance clearance to PAO',
      fields: [
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'designation', label: 'Designation', type: 'text', required: true },
        { name: 'retirementDate', label: 'Retirement Date', type: 'date', required: true },
        { name: 'serviceVerificationDate', label: 'Service Verification Till', type: 'date', required: true },
        { name: 'vigilanceStatus', label: 'Vigilance Status', type: 'select', options: ['Pending', 'Cleared', 'Conditional'], required: true },
        { name: 'remarks', label: 'Additional Remarks', type: 'textarea', required: false }
      ],
      signatories: ['so_001'],
      referenceFormat: 'II-[DATE]-Admn-O/o-Commr-Cus-Prev-BBSR',
      bodyTemplate: `
Dear Sir,

It is to inform you that this office has already intimated to the Vigilance Section regarding Vigilance Clearance Certificate for [employeeName], [designation].

Service Verification has been updated till [serviceVerificationDate].

Vigilance Status: [vigilanceStatus]

[remarks]

On receipt of the Vigilance Clearance Certificate, the same will be forwarded to your office for necessary action.

Yours faithfully,
[signatoryName]
[signatoryDesignation]
CUSTOMS PREV COMMISSIONERATE, BHUBANESWAR
      `
    },

    'pension_approval_note': {
      id: 'tmpl_pension_note',
      name: 'Pension Papers Approval Note',
      category: 'Internal Note Sheet',
      description: 'Internal note for pension papers approval',
      fields: [
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'designation', label: 'Designation', type: 'text', required: true },
        { name: 'retirementDate', label: 'Retirement Date', type: 'date', required: true },
        { name: 'serviceVerificationStatus', label: 'Service Verification Status', type: 'textarea', required: true },
        { name: 'cgegisStatus', label: 'CGEGIS Status', type: 'textarea', required: true },
        { name: 'vigilanceCertStatus', label: 'Vigilance Cert Status', type: 'textarea', required: true },
        { name: 'ourResponses', label: 'Our Responses to PAO Observations', type: 'textarea', required: true }
      ],
      signatories: ['so_001', 'ac_001'],
      referenceFormat: 'NOTE-[DATE]-[SERIAL]',
      bodyTemplate: `
For kind perusal please - Placed opposite may be seen:

The pension papers of [employeeName], [designation], have been returned by PAO with observations.

Our Responses/Actions:
[ourResponses]

Service Verification Status: [serviceVerificationStatus]
CGEGIS Status: [cgegisStatus]
Vigilance Certificate Status: [vigilanceCertStatus]

Submitted for approval and signature please.
      `
    },

    'gpf_withdrawal_letter': {
      id: 'tmpl_gpf_withdraw',
      name: 'GPF Withdrawal Forwarding Letter',
      category: 'PAO Communication',
      description: 'Forwarding GPF withdrawal application to PAO',
      fields: [
        { name: 'employeeName', label: 'Employee Name', type: 'text', required: true },
        { name: 'designation', label: 'Designation', type: 'text', required: true },
        { name: 'retirementDate', label: 'Retirement Date', type: 'date', required: true },
        { name: 'gpfAccountNo', label: 'GPF Account No', type: 'text', required: true },
        { name: 'remarks', label: 'Remarks', type: 'textarea', required: false }
      ],
      signatories: ['so_001'],
      referenceFormat: 'II-[DATE]-Admin-O/o-Commr-Cus-Prev-BBSR',
      bodyTemplate: `
Dear Sir,

Enclosed please find herewith the final withdrawal application of GPF in respect of [employeeName], [designation].

GPF Account No: [gpfAccountNo]
Retirement Date: [retirementDate]

[remarks]

Kindly process the final payment.

Yours faithfully,
[signatoryName]
[signatoryDesignation]
CUSTOMS PREV COMMISSIONERATE, BHUBANESWAR
      `
    },

    'generic_admin_letter': {
      id: 'tmpl_generic',
      name: 'Generic Admin Letter',
      category: 'Generic',
      description: 'Customizable admin letter',
      fields: [
        { name: 'recipient', label: 'Recipient', type: 'text', required: true },
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        { name: 'body', label: 'Body', type: 'textarea', required: true },
        { name: 'enclosures', label: 'Enclosures', type: 'textarea', required: false }
      ],
      signatories: ['so_001'],
      referenceFormat: 'II-[DATE]-Custom-O/o-Commr',
      bodyTemplate: `
[body]

[enclosures]

Yours faithfully,
[signatoryName]
[signatoryDesignation]
CUSTOMS PREV COMMISSIONERATE, BHUBANESWAR
      `
    }
  },

  // ===== CORE FUNCTIONS =====

  getTemplateByType: function(templateType) {
    return this.templates[templateType];
  },

  getOfficers: function(officeId = 'customs_bhubaneswar') {
    return this.officers[officeId] || [];
  },

  getOfficerById: function(officerId, officeId = 'customs_bhubaneswar') {
    const officers = this.officers[officeId];
    if (!officers) return null;
    return officers.find(o => o.id === officerId);
  },

  generateReferenceNumber: function(templateId) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const serial = Math.floor(Math.random() * 9000) + 1000;
    const template = this.templates[templateId];
    
    if (template) {
      return template.referenceFormat
        .replace('[DATE]', dateStr)
        .replace('[SERIAL]', serial);
    }
    return `II${serial}${dateStr}-Admn-O/o-Commr-Cus-Prev-BBSR`;
  },

  renderTemplate: function(templateId, data, signatories = []) {
    const template = this.templates[templateId];
    if (!template) return null;

    let output = template.bodyTemplate;

    // Replace field placeholders
    template.fields.forEach(field => {
      const placeholder = new RegExp(`\\[${field.name}\\]`, 'g');
      const value = data[field.name] || '';
      output = output.replace(placeholder, value);
    });

    // Replace signatory details
    if (signatories.length > 0) {
      const firstSignatory = this.getOfficerById(signatories[0]);
      if (firstSignatory) {
        output = output.replace(/\[signatoryName\]/g, firstSignatory.name);
        output = output.replace(/\[signatoryDesignation\]/g, firstSignatory.designation);
      }
    }

    return output;
  },

  saveAdminLetter: async function(letter, userId, workspaceId) {
    try {
      // Save to Firebase
      const db = firebase.firestore();
      const letterRef = await db.collection('users').doc(userId)
        .collection('admin_letters').add({
          ...letter,
          createdAt: new Date(),
          workspace: workspaceId,
          synced: true
        });

      // Save to Local Storage
      const localLetters = JSON.parse(localStorage.getItem(`admin_letters_${userId}`) || '{}');
      localLetters[letterRef.id] = {
        ...letter,
        id: letterRef.id,
        savedAt: new Date().toISOString(),
        synced: true
      };
      localStorage.setItem(`admin_letters_${userId}`, JSON.stringify(localLetters));

      return letterRef.id;
    } catch (e) {
      console.error('Save failed:', e);
      return null;
    }
  }
};

// Export for global use
window.AdminTemplateManager = AdminTemplateManager;
