/**
 * Vema24 EmailJS Configuration — LOCAL ONLY (gitignored)
 * Replace placeholder values with your real EmailJS credentials.
 * See email.config.example.js for setup instructions.
 */

window.VEMA_EMAIL_CONFIG = {
    publicKey:  '09dmR9_e1weZ0J3ZA',
    serviceId:  'service_ivdg2co',
    adminEmail: 'vemastokvel@gmail.com',
    templates: {
        /** Reserved for future: notify member when join request is submitted (not wired in code yet). */
        user: 'tmpl_join_request_user',
        /** Reserved for future: notify member when join is approved (not wired in code yet). */
        admin: 'tmpl_join_approved_user',
        /** Used by dashboard/index.html when a member submits a contribution + proof (notifies admin). */
        contribution: 'tmpl_contribution_approval',
    },
};
