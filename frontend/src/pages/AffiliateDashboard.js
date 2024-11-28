import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
  Divider,
  Paper
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  MonetizationOn as MoneyIcon,
  Assessment as StatsIcon,
  Campaign as CampaignIcon
} from '@mui/icons-material';
import { Line, Bar } from 'react-chartjs-2';
import affiliateService from '../services/affiliateService';

const AffiliateDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [affiliate, setAffiliate] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadAffiliateData();
  }, []);

  const loadAffiliateData = async () => {
    try {
      setLoading(true);
      const [profileData, metricsData, analyticsData] = await Promise.all([
        affiliateService.getProfile(),
        affiliateService.getMetrics(),
        affiliateService.getAnalytics(dateRange)
      ]);

      setAffiliate(profileData.affiliate);
      setMetrics(metricsData.metrics);
      setAnalytics(analyticsData.analytics);
      setError(null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      const { link } = await affiliateService.generateLink(campaignName);
      setAffiliate(prev => ({
        ...prev,
        links: [...prev.links, link]
      }));
      setShowLinkDialog(false);
      setCampaignName('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleRequestPayout = async () => {
    try {
      await affiliateService.requestPayout(parseFloat(payoutAmount), affiliate.paymentInfo.method);
      await loadAffiliateData();
      setShowPayoutDialog(false);
      setPayoutAmount('');
    } catch (error) {
      setError(error.message);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const renderOverviewCards = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Total Earnings
            </Typography>
            <Typography variant="h4">
              ${metrics?.totalCommissionEarned.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
              +{metrics?.performance?.currentMonthSales.toFixed(2)} this month
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Conversion Rate
            </Typography>
            <Typography variant="h4">
              {metrics?.conversionRate.toFixed(1)}%
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {metrics?.totalConversions} total conversions
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Total Clicks
            </Typography>
            <Typography variant="h4">
              {metrics?.totalClicks}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Across {affiliate?.links.length} active links
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary">
              Projected Earnings
            </Typography>
            <Typography variant="h4">
              ${metrics?.projectedEarnings?.nextMonth.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Next month estimate
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderPerformanceChart = () => {
    if (!analytics?.performance?.trends) return null;

    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Earnings',
          data: analytics.performance.trends.earnings,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };

    return (
      <Card sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Performance Trends
        </Typography>
        <Box sx={{ height: 300 }}>
          <Line data={data} options={{ maintainAspectRatio: false }} />
        </Box>
      </Card>
    );
  };

  const renderAffiliateLinks = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Affiliate Links
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<AddIcon />}
            onClick={() => setShowLinkDialog(true)}
          >
            Generate Link
          </Button>
        </Box>
        <Grid container spacing={2}>
          {affiliate?.links.map((link, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {link.campaign || 'General'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {affiliateService.formatAffiliateLink(link.code)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Chip
                      label={`${link.clicks} clicks`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={`${link.conversions} conversions`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(affiliateService.formatAffiliateLink(link.code))}
                    >
                      <CopyIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderPayouts = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Payouts
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<MoneyIcon />}
            onClick={() => setShowPayoutDialog(true)}
            disabled={metrics?.totalCommissionEarned < 100} // Minimum payout threshold
          >
            Request Payout
          </Button>
        </Box>
        <Grid container spacing={2}>
          {affiliate?.payouts.map((payout, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      ${payout.amount.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(payout.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={payout.status}
                    size="small"
                    color={
                      payout.status === 'completed' ? 'success' :
                      payout.status === 'pending' ? 'warning' : 'error'
                    }
                  />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderMarketingMaterials = () => (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Marketing Materials
        </Typography>
        <Grid container spacing={2}>
          {affiliate?.marketingMaterials.map((material, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2">
                    {material.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {material.type}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Button
                      startIcon={<DownloadIcon />}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Overview Section */}
      {renderOverviewCards()}

      {/* Performance Chart */}
      {renderPerformanceChart()}

      {/* Tabs */}
      <Box sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Links" icon={<CampaignIcon />} iconPosition="start" />
          <Tab label="Payouts" icon={<MoneyIcon />} iconPosition="start" />
          <Tab label="Marketing" icon={<StatsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {activeTab === 0 && renderAffiliateLinks()}
        {activeTab === 1 && renderPayouts()}
        {activeTab === 2 && renderMarketingMaterials()}
      </Box>

      {/* Generate Link Dialog */}
      <Dialog open={showLinkDialog} onClose={() => setShowLinkDialog(false)}>
        <DialogTitle>Generate Affiliate Link</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Campaign Name (Optional)"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLinkDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateLink} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Request Payout Dialog */}
      <Dialog open={showPayoutDialog} onClose={() => setShowPayoutDialog(false)}>
        <DialogTitle>Request Payout</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Amount"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
            InputProps={{
              startAdornment: '$',
              inputProps: { min: 100, max: metrics?.totalCommissionEarned }
            }}
            sx={{ mt: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Minimum payout amount: $100
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRequestPayout}
            variant="contained"
            disabled={!payoutAmount || payoutAmount < 100 || payoutAmount > metrics?.totalCommissionEarned}
          >
            Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AffiliateDashboard;
