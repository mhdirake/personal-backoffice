'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import Image from 'next/image';
import { Box, Drawer, List, ListItem, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import {
  ArticleOutlined,
  RssFeedOutlined,
  LogoutOutlined,
  AutoStoriesOutlined,
} from '@mui/icons-material';
import { setToken, clearToken } from '@/store/slices/authSlice';

const SIDEBAR_WIDTH = 228;

const NAV_ITEMS = [
  { label: 'Posts', href: '/admin/posts', icon: ArticleOutlined, desc: 'Curated content' },
  { label: 'Sources', href: '/admin/sources', icon: RssFeedOutlined, desc: 'Feed sources' },
  { label: 'Blog', href: '/admin/blog', icon: AutoStoriesOutlined, desc: 'Personal blog' },
];

export default function AdminShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    const token = localStorage.getItem('admin_token');
    if (token) {
      dispatch(setToken(token));
    } else {
      router.push('/admin/login');
    }
  }, [dispatch, router, isLoginPage]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=;path=/;max-age=0';
    dispatch(clearToken());
    router.push('/admin/login');
  };

  if (isLoginPage) return <>{children}</>;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', position: 'relative', zIndex: 1 }}>
      <Drawer
        variant="permanent"
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box' },
        }}
      >
        {/* Logo area */}
        <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            {/* <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #0DC8FF 0%, #7040FF 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(13,200,255,0.3)',
                flexShrink: 0,
              }}
            >
              <Image
                src="/dev-signal-logo.png"
                alt="DevSignal"
                width={22}
                height={22}
                style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
              />
            </Box> */}
            <Box>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  background: 'linear-gradient(135deg, #0DC8FF 0%, #9060FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  lineHeight: 1.2,
                }}
              >
                MEHDI RASHID
              </Typography>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary', letterSpacing: '0.06em' }}>
                ADMIN CONSOLE
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Nav */}
        <List dense sx={{ mt: 1.5, px: 1.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {NAV_ITEMS.map(({ label, href, icon: Icon, desc }) => {
            const active = pathname.startsWith(href);
            return (
              <ListItem key={href} disablePadding>
                <Box
                  component={Link}
                  href={href}
                  sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: '9px',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    backgroundColor: active ? 'rgba(13,200,255,0.08)' : 'transparent',
                    border: active ? '1px solid rgba(13,200,255,0.15)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: active ? 'rgba(13,200,255,0.10)' : 'rgba(255,255,255,0.04)',
                      border: active ? '1px solid rgba(13,200,255,0.20)' : '1px solid rgba(255,255,255,0.07)',
                    },
                    // gradient left bar on active
                    '&::before': active ? {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      height: '60%',
                      width: '2.5px',
                      borderRadius: '0 2px 2px 0',
                      background: 'linear-gradient(180deg, #0DC8FF, #7040FF)',
                      boxShadow: '0 0 8px rgba(13,200,255,0.6)',
                    } : {},
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: '7px',
                      backgroundColor: active ? 'rgba(13,200,255,0.12)' : 'rgba(255,255,255,0.05)',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 16,
                        color: active ? '#0DC8FF' : 'rgba(255,255,255,0.45)',
                        transition: 'color 0.2s ease',
                        ...(active && { filter: 'drop-shadow(0 0 4px rgba(13,200,255,0.5))' }),
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: '13px',
                        fontWeight: active ? 600 : 500,
                        lineHeight: 1.2,
                        color: active ? '#F0F2FF' : 'rgba(255,255,255,0.6)',
                        transition: 'color 0.2s ease',
                        ...(active && {
                          background: 'linear-gradient(135deg, #0DC8FF, #9060FF)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }),
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '10.5px',
                        color: 'rgba(255,255,255,0.3)',
                        lineHeight: 1,
                        mt: 0.25,
                      }}
                    >
                      {desc}
                    </Typography>
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>

        {/* Footer */}
        <Box
          sx={{
            px: 1.5,
            pb: 2.5,
            pt: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            mx: 1.5,
          }}
        >
          <Tooltip title="Sign out" placement="right">
            <Box
              onClick={handleLogout}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: '9px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: 'rgba(255,255,255,0.4)',
                '&:hover': {
                  backgroundColor: 'rgba(255,77,106,0.08)',
                  color: '#FF7A8A',
                  border: '1px solid rgba(255,77,106,0.12)',
                },
                border: '1px solid transparent',
              }}
            >
              <LogoutOutlined sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>Sign out</Typography>
            </Box>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 3.5,
          overflow: 'auto',
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
