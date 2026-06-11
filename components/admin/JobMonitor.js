'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography, IconButton, Chip, Tooltip } from '@mui/material';
import { CloseOutlined, ExpandLessOutlined, LayersOutlined } from '@mui/icons-material';
import api from '@/utils/api';

const QUEUE_COLORS = { fetch: '#0DC8FF', ai: '#9060FF', publish: '#26A5E4' };
const STATUS_COLORS = { success: '#4CAF50', failed: '#FF5252', skipped: 'rgba(255,255,255,0.25)' };
const POLL_OPEN = 3000;
const POLL_CLOSED = 12000;

function relativeTime(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

export default function JobMonitor() {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const lastIdRef = useRef(null);
  const timerRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const { data } = await api.get('/api/admin/jobs');
      const fresh = data.jobs || [];
      setJobs(fresh);

      if (fresh.length && lastIdRef.current === null) {
        lastIdRef.current = fresh[0]?.id ?? null;
        return;
      }
      if (fresh.length && fresh[0]?.id !== lastIdRef.current) {
        const added = fresh.filter(j => j.id > (lastIdRef.current ?? 0)).length;
        if (!open) setNewCount(c => c + added);
        lastIdRef.current = fresh[0].id;
      }
    } catch { /* silent */ }
  }, [open]);

  useEffect(() => {
    poll();
    timerRef.current = setInterval(poll, open ? POLL_OPEN : POLL_CLOSED);
    return () => clearInterval(timerRef.current);
  }, [open, poll]);

  const handleOpen = () => {
    setOpen(true);
    setNewCount(0);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 20, left: 244, zIndex: 1300 }}>
      {open ? (
        <Box
          sx={{
            width: 420,
            maxHeight: 420,
            background: 'rgba(14,16,24,0.96)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '14px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            px={2}
            py={1.25}
            sx={{ borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <LayersOutlined sx={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }} />
              <Typography
                variant="caption"
                sx={{ fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.5)' }}
              >
                BACKGROUND JOBS
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setOpen(false)} sx={{ p: 0.25 }}>
              <CloseOutlined sx={{ fontSize: 14, color: 'rgba(255,255,255,0.35)' }} />
            </IconButton>
          </Box>

          {/* Job list */}
          <Box sx={{ overflowY: 'auto', flex: 1 }}>
            {jobs.length === 0 ? (
              <Box py={4} textAlign="center">
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-jetbrains)', letterSpacing: '0.06em' }}>
                  NO JOBS YET
                </Typography>
              </Box>
            ) : (
              jobs.map((job, i) => (
                <Box
                  key={job.uuid}
                  display="flex"
                  alignItems="flex-start"
                  gap={1.5}
                  px={2}
                  py={1}
                  sx={{
                    borderBottom: i < jobs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    '&:hover': { background: 'rgba(255,255,255,0.02)' },
                  }}
                >
                  {/* Status dot */}
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: STATUS_COLORS[job.status],
                      flexShrink: 0,
                      mt: '5px',
                    }}
                  />

                  {/* Content */}
                  <Box flex={1} minWidth={0}>
                    <Box display="flex" alignItems="center" gap={0.75} mb={0.25}>
                      <Chip
                        label={job.queue}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '9px',
                          fontFamily: 'var(--font-jetbrains)',
                          letterSpacing: '0.04em',
                          backgroundColor: `${QUEUE_COLORS[job.queue] || '#888'}18`,
                          color: QUEUE_COLORS[job.queue] || '#888',
                          border: `1px solid ${QUEUE_COLORS[job.queue] || '#888'}33`,
                          '& .MuiChip-label': { px: 0.75 },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-jetbrains)', fontSize: '10px' }}
                      >
                        {relativeTime(job.createdAt)} ago
                      </Typography>
                    </Box>
                    <Tooltip title={job.summary} placement="top-start" disableHoverListener={job.summary.length < 60}>
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ color: job.status === 'failed' ? '#FF7A8A' : 'rgba(255,255,255,0.7)', display: 'block', fontSize: '11px' }}
                      >
                        {job.summary}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        </Box>
      ) : (
        /* Collapsed pill */
        <Box
          onClick={handleOpen}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.75,
            background: 'rgba(14,16,24,0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              border: '1px solid rgba(255,255,255,0.18)',
              background: 'rgba(20,22,32,0.96)',
            },
          }}
        >
          <LayersOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />
          <Typography
            variant="caption"
            sx={{ fontFamily: 'var(--font-jetbrains)', fontSize: '10px', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.45)' }}
          >
            JOBS
          </Typography>
          {newCount > 0 && (
            <Box
              sx={{
                minWidth: 16,
                height: 16,
                borderRadius: '8px',
                background: '#0DC8FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 0.5,
              }}
            >
              <Typography sx={{ fontSize: '9px', fontWeight: 700, color: '#000', fontFamily: 'var(--font-jetbrains)' }}>
                {newCount > 99 ? '99+' : newCount}
              </Typography>
            </Box>
          )}
          <ExpandLessOutlined sx={{ fontSize: 13, color: 'rgba(255,255,255,0.25)' }} />
        </Box>
      )}
    </Box>
  );
}
