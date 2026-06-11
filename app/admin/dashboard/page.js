'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Telegram,
  AutoStoriesOutlined,
  LinkedIn,
  MonetizationOnOutlined,
  ArrowDownwardOutlined,
  ArrowUpwardOutlined,
} from '@mui/icons-material';
import {
  Chart,
  LineController, LineElement, PointElement,
  BarController, BarElement,
  LinearScale, CategoryScale,
  Tooltip, Filler,
} from 'chart.js';
import api from '@/utils/api';

Chart.register(LineController, LineElement, PointElement, BarController, BarElement, LinearScale, CategoryScale, Tooltip, Filler);

const GRID_COLOR = 'rgba(255,255,255,0.05)';
const TICK_COLOR = 'rgba(255,255,255,0.25)';

function formatTokens(n) {
  const num = Number(n) || 0;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function shortDate(iso) {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function PeriodRow({ label, value }) {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      py={0.75}
      sx={{ borderBottom: '1px solid rgba(255,255,255,0.04)', '&:last-child': { borderBottom: 'none' } }}
    >
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.06em' }}
      >
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1, letterSpacing: '-0.01em' }}>
        {value ?? '—'}
      </Typography>
    </Box>
  );
}

function ActivityCard({ icon: Icon, iconColor, title, data }) {
  return (
    <Paper sx={cardSx}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconBox color={iconColor}><Icon sx={{ fontSize: 18, color: iconColor }} /></IconBox>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
      </Box>
      <PeriodRow label="24 HOURS" value={data?.['1d']} />
      <PeriodRow label="7 DAYS"   value={data?.['7d']} />
      <PeriodRow label="30 DAYS"  value={data?.['30d']} />
    </Paper>
  );
}

function TokenCard({ icon: Icon, iconColor, label, value, sub }) {
  return (
    <Paper sx={cardSx}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <IconBox color={iconColor}><Icon sx={{ fontSize: 18, color: iconColor }} /></IconBox>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.06em' }}>
          {label}
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.75, display: 'block' }}>
          {sub}
        </Typography>
      )}
    </Paper>
  );
}

function LineChartCard({ title, labels, values, color, formatY }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !values?.length) return;
    chartRef.current?.destroy();

    const ctx = canvasRef.current.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 160);
    gradient.addColorStop(0, `${color}40`);
    gradient.addColorStop(1, `${color}00`);

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: values,
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 1.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          callbacks: { label: (ctx) => formatY ? formatY(ctx.parsed.y) : ctx.parsed.y },
          backgroundColor: 'rgba(20,22,30,0.95)',
          titleColor: 'rgba(255,255,255,0.5)',
          bodyColor: '#fff',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
        }},
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
          },
          y: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 }, callback: formatY },
            beginAtZero: true,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, values, color, formatY]);

  return (
    <Paper sx={{ ...cardSx, p: 2.5 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', mb: 2, display: 'block' }}>
        {title}
      </Typography>
      <Box sx={{ height: 160, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </Box>
    </Paper>
  );
}

function BarChartCard({ title, labels, values, color }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !values?.length) return;
    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: `${color}55`,
          borderColor: color,
          borderWidth: 1,
          borderRadius: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: {
          backgroundColor: 'rgba(20,22,30,0.95)',
          titleColor: 'rgba(255,255,255,0.5)',
          bodyColor: '#fff',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 10,
        }},
        scales: {
          x: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
          },
          y: {
            grid: { color: GRID_COLOR },
            ticks: { color: TICK_COLOR, font: { size: 10 }, stepSize: 1 },
            beginAtZero: true,
          },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, values, color]);

  return (
    <Paper sx={{ ...cardSx, p: 2.5 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', mb: 2, display: 'block' }}>
        {title}
      </Typography>
      <Box sx={{ height: 160, position: 'relative' }}>
        <canvas ref={canvasRef} />
      </Box>
    </Paper>
  );
}

function SectionLabel({ children, mt }) {
  return (
    <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em', mb: 1.5, mt: mt ?? 0, display: 'block' }}>
      {children}
    </Typography>
  );
}

function IconBox({ color, children }) {
  return (
    <Box sx={{ width: 36, height: 36, borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${color}22` }}>
      {children}
    </Box>
  );
}

const cardSx = {
  p: 2.5,
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  height: '100%',
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={12}>
        <CircularProgress size={32} thickness={2} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  const allTime = stats?.tokens?.allTime ?? {};
  const last30dTotals = stats?.tokens?.last30dTotals ?? {};
  const dailyCost = stats?.tokens?.dailyCost ?? [];
  const dailyTelegram = stats?.tokens?.dailyTelegram ?? [];

  const costLabels = dailyCost.map(r => shortDate(r.date));
  const costValues = dailyCost.map(r => parseFloat(r.costUsd) || 0);
  const telegramLabels = dailyTelegram.map(r => shortDate(r.date));
  const telegramValues = dailyTelegram.map(r => r.count);

  return (
    <Box>
      <Box mb={3.5}>
        <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 0.5, fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.1em' }}>
          ANALYTICS
        </Typography>
        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
          Dashboard
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

      <SectionLabel>PUBLISHED CONTENT</SectionLabel>
      <Grid container spacing={2} mb={0.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ActivityCard icon={Telegram}            iconColor="#26A5E4" title="Telegram Posts" data={stats?.telegram} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ActivityCard icon={AutoStoriesOutlined} iconColor="#FF9800" title="Blog Posts"     data={stats?.blog} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ActivityCard icon={LinkedIn}            iconColor="#0A66C2" title="LinkedIn Drafts" data={stats?.linkedin} />
        </Grid>
      </Grid>

      <SectionLabel mt={3.5}>AI TOKEN USAGE — ALL TIME</SectionLabel>
      <Grid container spacing={2} mb={0.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TokenCard
            icon={MonetizationOnOutlined} iconColor="#4CAF50"
            label="TOTAL COST (USD)"
            value={`$${(allTime.costUsd ?? 0).toFixed(4)}`}
            sub={last30dTotals.costUsd ? `$${last30dTotals.costUsd.toFixed(4)} last 30 days · all providers` : 'No charges yet'}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TokenCard
            icon={ArrowDownwardOutlined} iconColor="#0DC8FF"
            label="INPUT TOKENS"
            value={formatTokens(allTime.inputTokens)}
            sub={last30dTotals.inputTokens ? `${formatTokens(last30dTotals.inputTokens)} last 30 days` : undefined}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TokenCard
            icon={ArrowUpwardOutlined} iconColor="#9060FF"
            label="OUTPUT TOKENS"
            value={formatTokens(allTime.outputTokens)}
            sub={last30dTotals.outputTokens ? `${formatTokens(last30dTotals.outputTokens)} last 30 days` : undefined}
          />
        </Grid>
      </Grid>

      <SectionLabel mt={3.5}>LAST 30 DAYS</SectionLabel>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <LineChartCard
            title="AI COST PER DAY (USD)"
            labels={costLabels}
            values={costValues}
            color="#4CAF50"
            formatY={(v) => `$${Number(v).toFixed(4)}`}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BarChartCard
            title="TELEGRAM PUBLISHES PER DAY"
            labels={telegramLabels}
            values={telegramValues}
            color="#26A5E4"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
