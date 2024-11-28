const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const affiliateService = require('../services/affiliateService');
const { body, query, param, validationResult } = require('express-validator');
const multer = require('multer');
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Validation middleware
const validateAffiliate = [
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('socialMedia.facebook').optional().isURL().withMessage('Invalid Facebook URL'),
  body('socialMedia.twitter').optional().isURL().withMessage('Invalid Twitter URL'),
  body('socialMedia.instagram').optional().isURL().withMessage('Invalid Instagram URL'),
  body('socialMedia.linkedin').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('socialMedia.youtube').optional().isURL().withMessage('Invalid YouTube URL'),
  body('marketingMethods').isArray().withMessage('Marketing methods must be an array'),
  body('paymentInfo.method').isIn(['paypal', 'bank_transfer', 'stripe']).withMessage('Invalid payment method'),
  body('paymentInfo.email').optional().isEmail().withMessage('Invalid payment email')
];

// Apply to become an affiliate
router.post('/apply', auth, validateAffiliate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const affiliate = await affiliateService.createAffiliate(req.user._id, req.body);
    res.status(201).json({ affiliate });
  } catch (error) {
    console.error('Error applying for affiliate program:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get affiliate profile
router.get('/profile', auth, async (req, res) => {
  try {
    const affiliate = await affiliateService.getAffiliateByUser(req.user._id);
    res.json({ affiliate });
  } catch (error) {
    console.error('Error fetching affiliate profile:', error);
    res.status(error.message === 'Affiliate not found' ? 404 : 500).json({ error: error.message });
  }
});

// Update affiliate profile
router.patch('/profile', auth, validateAffiliate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const affiliate = await affiliateService.updateAffiliate(req.user._id, req.body);
    res.json({ affiliate });
  } catch (error) {
    console.error('Error updating affiliate profile:', error);
    res.status(error.message === 'Affiliate not found' ? 404 : 500).json({ error: error.message });
  }
});

// Generate new affiliate link
router.post('/links', auth, [
  body('campaign').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const link = await affiliateService.generateAffiliateLink(req.user._id, req.body.campaign);
    res.status(201).json({ link });
  } catch (error) {
    console.error('Error generating affiliate link:', error);
    res.status(500).json({ error: error.message });
  }
});

// Track affiliate link click
router.post('/track/:code', async (req, res) => {
  try {
    await affiliateService.trackClick(req.params.code);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get affiliate metrics
router.get('/metrics', auth, async (req, res) => {
  try {
    const metrics = await affiliateService.getAffiliateMetrics(req.user._id);
    res.json({ metrics });
  } catch (error) {
    console.error('Error fetching affiliate metrics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get affiliate analytics
router.get('/analytics', auth, [
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const analytics = await affiliateService.getAffiliateAnalytics(req.user._id);
    res.json({ analytics });
  } catch (error) {
    console.error('Error fetching affiliate analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload marketing material
router.post('/marketing-materials', auth, upload.single('file'), [
  body('type').isIn(['banner', 'email_template', 'landing_page', 'social_post']).withMessage('Invalid material type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const material = await affiliateService.generateMarketingMaterials(req.user._id, req.body.type);
    res.status(201).json({ material });
  } catch (error) {
    console.error('Error uploading marketing material:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request payout
router.post('/payouts/request', auth, [
  body('amount').isNumeric().withMessage('Invalid amount'),
  body('method').isIn(['paypal', 'bank_transfer', 'stripe']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payout = await affiliateService.processPayouts(req.user._id);
    res.status(201).json({ payout });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payout history
router.get('/payouts', auth, async (req, res) => {
  try {
    const affiliate = await affiliateService.getAffiliateByUser(req.user._id);
    res.json({ payouts: affiliate.payouts });
  } catch (error) {
    console.error('Error fetching payout history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload required documents
router.post('/documents', auth, upload.single('document'), [
  body('type').isIn(['tax_form', 'id_proof', 'address_proof', 'other']).withMessage('Invalid document type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const affiliate = await affiliateService.updateAffiliate(req.user._id, {
      $push: {
        documents: {
          type: req.body.type,
          name: req.file.originalname,
          url: req.file.path,
          uploadDate: new Date()
        }
      }
    });

    res.status(201).json({ document: affiliate.documents[affiliate.documents.length - 1] });
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update notification preferences
router.patch('/notifications', auth, [
  body('email').optional().isObject(),
  body('inApp').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const affiliate = await affiliateService.updateAffiliate(req.user._id, {
      notifications: req.body
    });

    res.json({ notifications: affiliate.notifications });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
