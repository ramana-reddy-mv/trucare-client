import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Alert, AppBar, Avatar, Badge, Box, CircularProgress, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import { useAuth } from '../auth/AuthContext'
import { notificationsApi, getErrorMessage } from '../api/client'

const drawerWidth = 252
const links = [
  { label: 'Overview', path: '/', icon: <DashboardRoundedIcon /> },
  { label: 'Claims', path: '/claims', icon: <DescriptionOutlinedIcon /> },
  { label: 'Members', path: '/members', icon: <GroupsOutlinedIcon /> },
  { label: 'Observability', path: '/observability', icon: <InsightsOutlinedIcon /> },
]

export default function AppLayout() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [notificationError, setNotificationError] = useState('')
  const [notificationLoading, setNotificationLoading] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const page = links.find((link) => link.path === location.pathname)?.label || 'TruCare'

  useEffect(() => {
    if (!notificationAnchor || !session?.username) return
    let active = true
    notificationsApi.unreadInApp(session.username).then(({ data }) => { if (active) setNotifications(data.content || []) }).catch((error) => { if (active) setNotificationError(getErrorMessage(error)) }).finally(() => { if (active) setNotificationLoading(false) })
    return () => { active = false }
  }, [notificationAnchor, session?.username])

  async function markNotificationRead(id) {
    try { await notificationsApi.markRead(id); setNotifications((current) => current.filter((item) => item.id !== id)) }
    catch (error) { setNotificationError(getErrorMessage(error)) }
  }

  function openNotifications(event) {
    setNotificationLoading(true)
    setNotificationError('')
    setNotificationAnchor(event.currentTarget)
  }

  const content = <Box sx={{ px: 2, py: 2.5, display: 'flex', height: '100%', flexDirection: 'column' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.3, px: 1.2, pb: 3 }}><Box className="brand-mark">+</Box><Box><Typography fontWeight={800} fontSize={19} lineHeight={1.1}>trucare</Typography><Typography variant="caption" color="text.secondary">CLAIMS OPERATIONS</Typography></Box></Box>
    <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, mb: .7, letterSpacing: '.12em' }}>WORKSPACE</Typography>
    <List disablePadding>{links.map((link) => <ListItemButton key={link.path} component={NavLink} to={link.path} end={link.path === '/'} onClick={() => setOpen(false)} className="nav-link"><ListItemIcon>{link.icon}</ListItemIcon><ListItemText primary={link.label} /></ListItemButton>)}</List>
    <Box sx={{ mt: 'auto', p: 1.6, bgcolor: '#f0f7f6', borderRadius: 3 }}><Typography variant="caption" color="primary.main" fontWeight={700}>SECURE WORKSPACE</Typography><Typography variant="body2" sx={{ mt: .5 }} color="text.secondary">Member and claim information is protected by your account permissions.</Typography></Box>
  </Box>

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    {mobile ? <Drawer open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { width: drawerWidth } }}>{content}</Drawer> : <Drawer variant="permanent" PaperProps={{ sx: { width: drawerWidth, boxSizing: 'border-box', borderRight: '1px solid #e5ebed' } }}>{content}</Drawer>}
    <Box sx={{ ml: { md: `${drawerWidth}px` } }}>
      <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: '1px solid #e6ecee', bgcolor: 'rgba(255,255,255,.93)', backdropFilter: 'blur(12px)' }}>
        <Toolbar sx={{ minHeight: '70px !important', px: { xs: 2, md: 4 } }}>
          {mobile && <IconButton onClick={() => setOpen(true)} sx={{ mr: 1 }} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>}
          <Typography variant="body2" color="text.secondary">Workspace <Box component="span" sx={{ mx: .8, color: '#b5c0c4' }}>/</Box><Box component="span" color="text.primary" fontWeight={650}>{page}</Box></Typography>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton aria-label="Notifications" onClick={openNotifications} sx={{ mr: 1 }}><Badge badgeContent={notifications.length} color="error"><NotificationsNoneRoundedIcon /></Badge></IconButton>
          <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)} slotProps={{ paper: { sx: { width: 360, maxWidth: 'calc(100vw - 24px)' } } }}><Box sx={{ px: 2, py: 1.5 }}><Typography fontWeight={700}>Notifications</Typography><Typography variant="caption" color="text.secondary">Unread messages for your account</Typography></Box><Divider />{notificationLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={22} /></Box> : notificationError ? <Alert severity="info" sx={{ m: 1.5 }}>{notificationError}</Alert> : notifications.length ? notifications.map((item) => <MenuItem key={item.id} onClick={() => markNotificationRead(item.id)} sx={{ display: 'block', whiteSpace: 'normal', py: 1.3 }}><Typography variant="body2" fontWeight={700}>{item.subject || item.eventType || 'Notification'}</Typography><Typography variant="caption" color="text.secondary">{item.message || 'Select to mark as read.'}</Typography></MenuItem>) : <Typography variant="body2" color="text.secondary" sx={{ p: 2.5 }}>No unread notifications.</Typography>}</Menu>
          <Divider orientation="vertical" flexItem sx={{ my: 1.8, mr: 1.5 }} />
          <IconButton onClick={(event) => setMenu(event.currentTarget)} sx={{ borderRadius: 2, gap: 1 }}><Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: 14 }}>{session?.username?.slice(0, 1).toUpperCase()}</Avatar><Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}><Typography variant="body2" fontWeight={700}>{session?.username}</Typography><Typography variant="caption" color="text.secondary">{session?.roles?.join(', ')}</Typography></Box><ExpandMoreRoundedIcon fontSize="small" /></IconButton>
          <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}><MenuItem onClick={() => { setMenu(null); logout(); navigate('/login') }}>Sign out</MenuItem></Menu>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ px: { xs: 2, sm: 3, lg: 4 }, py: { xs: 3, md: 4 }, maxWidth: 1480, mx: 'auto' }}><Outlet /></Box>
    </Box>
  </Box>
}
