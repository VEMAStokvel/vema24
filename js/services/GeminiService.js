/**
 * GeminiService.js — Vema24 AI Assistant backend
 * Plain IIFE script (not an ES module). Exposes window.GeminiService.
 *
 * Depends on: js/config/gemini.config.js (sets window.VEMA_GEMINI_CONFIG)
 */
(function () {
    'use strict';

    var API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

    var SYSTEM_PROMPT = [
        'You are Vema AI, a friendly assistant for Vema24 — a South African stokvel (community savings) platform.',
        'Always respond in clear, simple English. Be warm, encouraging, and concise (max 3–4 short paragraphs).',
        '',
        '=== VEMA24 STOKVELS ===',
        '',
        'Members join rotating savings circles. Typical plans align with the constitution library:',
        '• Grocery stokvel — regular pooled contributions for household groceries.',
        '• January stokvel — year-start savings discipline and payout timing.',
        '• Planning ahead — longer-horizon goals (fees, deposits, emergencies).',
        '',
        'General guidance:',
        '• Contributions should match what each circle agreed in its constitution.',
        '• Late or missed payments may affect rotation order — direct users to their plan rules and admins.',
        '• Never invent interest rates, penalties, or eligibility rules; if unsure, say so.',
        '',
        '=== BEHAVIOUR ===',
        '• If you do not know, say so and suggest contacting support at support@vema24.co.za.',
        '• Do not discuss competitors or unrelated financial products.',
        '• Keep answers short — many users are on mobile.',
    ].join('\n');

    function getApiKey() {
        var cfg = window.VEMA_GEMINI_CONFIG;
        if (!cfg || !cfg.apiKey || cfg.apiKey === 'YOUR_GEMINI_API_KEY_HERE') return null;
        return cfg.apiKey;
    }

    function getModel() {
        var cfg = window.VEMA_GEMINI_CONFIG;
        return (cfg && cfg.model) ? cfg.model : 'gemini-2.0-flash';
    }

    function getModelCandidates() {
        var cfg = window.VEMA_GEMINI_CONFIG;
        var models = [];

        if (cfg && Array.isArray(cfg.models)) {
            models = cfg.models.slice();
        } else if (cfg && cfg.model) {
            models = [cfg.model];
        } else {
            models = ['gemini-2.0-flash', 'gemini-1.5-flash'];
        }

        if (models.indexOf('gemini-1.5-flash') === -1) {
            models.push('gemini-1.5-flash');
        }

        var unique = [];
        models.forEach(function (m) {
            if (m && unique.indexOf(m) === -1) unique.push(m);
        });
        return unique;
    }

    function extractErrorMessage(errBody, status) {
        if (errBody && errBody.error && errBody.error.message) return errBody.error.message;
        return 'API error ' + status;
    }

    function isQuotaOrRateError(status, message) {
        var msg = (message || '').toLowerCase();
        return status === 429 ||
            msg.indexOf('quota exceeded') !== -1 ||
            msg.indexOf('rate limit') !== -1 ||
            msg.indexOf('resource_exhausted') !== -1;
    }

    function toFriendlyErrorMessage(status, rawMessage) {
        var msg = rawMessage || '';
        var lower = msg.toLowerCase();

        if (lower.indexOf('api key not valid') !== -1 || lower.indexOf('api key invalid') !== -1) {
            return 'AI is not configured correctly right now. Please ask support to check the Gemini API key.';
        }

        if (isQuotaOrRateError(status, msg)) {
            var retryMatch = msg.match(/retry in\s*([0-9.]+)s/i);
            if (retryMatch && retryMatch[1]) {
                var waitSec = Math.ceil(parseFloat(retryMatch[1]));
                return 'Vema AI is temporarily busy (usage limit reached). Please try again in about ' + waitSec + ' seconds.';
            }
            return 'Vema AI is temporarily busy (usage limit reached). Please try again shortly.';
        }

        return 'I could not process that right now. Please try again shortly, or contact support@vema24.co.za.';
    }

    function buildContextBlock(ctx) {
        if (!ctx) return '';
        var lines = ['\n=== CURRENT USER CONTEXT ==='];
        if (ctx.firstName)             lines.push('Name: ' + ctx.firstName);
        if (ctx.totalSavings != null)  lines.push('Total savings: R' + Number(ctx.totalSavings).toFixed(2));
        if (ctx.activeStokvelCount != null) lines.push('Active stokvels: ' + ctx.activeStokvelCount);
        if (ctx.stokvelType)           lines.push('Stokvel type: ' + ctx.stokvelType);
        if (ctx.monthlyContribution)   lines.push('Monthly contribution: R' + ctx.monthlyContribution);
        if (ctx.nextContributionDate)  lines.push('Next contribution date: ' + ctx.nextContributionDate);
        lines.push('Today\'s date: ' + new Date().toLocaleDateString('en-ZA'));
        return lines.join('\n');
    }

    /**
     * @param {Array} history  Array of {role:'user'|'model', parts:[{text:'...'}]}
     * @param {Object|null} userContext
     * @returns {Promise<string>} model reply text
     */
    function chat(history, userContext) {
        var apiKey = getApiKey();
        if (!apiKey) {
            return Promise.reject(new Error('Gemini API key not configured. Add your key to js/config/gemini.config.js'));
        }

        var systemInstruction = SYSTEM_PROMPT + buildContextBlock(userContext);

        var trimmedHistory = history.length > 20 ? history.slice(history.length - 20) : history;

        var body = {
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: trimmedHistory,
            generationConfig: {
                maxOutputTokens: 512,
                temperature: 0.7
            }
        };

        var models = getModelCandidates();
        var lastError = null;

        function tryModel(index) {
            if (index >= models.length) {
                if (lastError) throw lastError;
                throw new Error('No Gemini model is available right now.');
            }

            var model = models[index];
            var url = API_BASE + '/' + model + ':generateContent?key=' + apiKey;

            return fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            }).then(function (res) {
                if (!res.ok) {
                    return res.json().catch(function () { return {}; }).then(function (errBody) {
                        var rawMessage = extractErrorMessage(errBody, res.status);
                        var friendlyMessage = toFriendlyErrorMessage(res.status, rawMessage);
                        var error = new Error(friendlyMessage);
                        error.status = res.status;
                        error.rawMessage = rawMessage;
                        error.model = model;
                        error.isQuotaOrRateError = isQuotaOrRateError(res.status, rawMessage);
                        throw error;
                    });
                }
                return res.json();
            }).then(function (data) {
                var candidate = data.candidates && data.candidates[0];
                if (!candidate || !candidate.content || !candidate.content.parts) {
                    throw new Error('Unexpected response format from Gemini API');
                }
                return candidate.content.parts.map(function (p) { return p.text; }).join('');
            }).catch(function (err) {
                lastError = err;
                if (err && err.isQuotaOrRateError) {
                    return tryModel(index + 1);
                }
                throw err;
            });
        }

        return tryModel(0).catch(function (err) {
            if (!err || !err.message) {
                throw new Error('I could not process that right now. Please try again shortly.');
            }
            if (!err.status) {
                var safe = new Error(toFriendlyErrorMessage(0, err.message));
                safe.rawMessage = err.message;
                throw safe;
            }
            throw err;
        });
    }

    /**
     * @param {number} budget  Monthly budget in ZAR
     * @param {string} goal    Savings goal description
     * @returns {Promise<string>}
     */
    function getStokvelRecommendation(budget, goal) {
        var prompt = 'My monthly budget for a stokvel is R' + budget + '. ' +
            'My goal: ' + (goal || 'general savings') + '. ' +
            'Which type of stokvel circle might suit me at Vema24 and what should I confirm in the constitution before I join?';
        var history = [{ role: 'user', parts: [{ text: prompt }] }];
        return chat(history, null);
    }

    window.GeminiService = {
        chat: chat,
        getStokvelRecommendation: getStokvelRecommendation
    };

}());
