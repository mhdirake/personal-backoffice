'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Box, TextField, Button, CircularProgress, Alert, Typography, InputAdornment, IconButton,
} from '@mui/material';
import { LockOutlined, VisibilityOutlined, VisibilityOffOutlined } from '@mui/icons-material';
import { setToken } from '@/store/slices/authSlice';
import api from '@/utils/api';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [secret, setSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { secret });
      localStorage.setItem('admin_token', data.token);
      document.cookie = `admin_token=${data.token};path=/;max-age=${7 * 24 * 3600};samesite=lax`;
      dispatch(setToken(data.token));
      router.push('/admin/posts');
    } catch {
      setError('Invalid secret. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020617',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient orbs */}
      <Box
        sx={{
          position: 'fixed', top: '-180px', left: '-180px',
          width: '600px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(13,200,255,0.14) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'fixed', bottom: '-180px', right: '-150px',
          width: '600px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(112,64,255,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }}
      />

      {/* Grid overlay */}
      <Box
        sx={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Card */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 420,
          mx: 2,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '20px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
          p: 4.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ textAlign: 'center' }}>
          {/* Logo mark */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0DC8FF 0%, #7040FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
              boxShadow: '0 8px 32px rgba(13,200,255,0.35)',
            }}
          >
            <LockOutlined sx={{ color: '#fff', fontSize: 22 }} />
          </Box>

          <Typography
            sx={{
              fontSize: '22px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #0DC8FF 0%, #9060FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              mb: 0.5,
            }}
          >
            MEHDI RASHID
          </Typography>
          <Typography sx={{ fontSize: '13px', color: 'text.secondary', letterSpacing: '0.06em' }}>
            ADMIN CONSOLE
          </Typography>
        </Box>

        {/* Error */}
        {error && (
          <Alert severity="error" sx={{ py: 0.75 }}>
            {error}
          </Alert>
        )}

        {/* Input */}
        <TextField
          label="Access Secret"
          type={showSecret ? 'text' : 'password'}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          autoFocus
          fullWidth
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowSecret((s) => !s)}
                  edge="end"
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  {showSecret ? <VisibilityOffOutlined fontSize="small" /> : <VisibilityOutlined fontSize="small" />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || !secret}
          size="large"
          sx={{
            py: 1.4,
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            borderRadius: '10px',
          }}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : 'ENTER CONSOLE'}
        </Button>

        {/* Footer label */}
        <Typography
          sx={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.2)',
            textAlign: 'center',
            letterSpacing: '0.06em',
          }}
        >
          RESTRICTED ACCESS · AUTHORIZED PERSONNEL ONLY
        </Typography>
      </Box>
    </Box>
  );
}
