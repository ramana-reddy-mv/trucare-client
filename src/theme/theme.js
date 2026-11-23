import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light', primary: { main: '#146b67', dark: '#0e514e', light: '#e5f3f1' },
    secondary: { main: '#c28a42' }, background: { default: '#f4f7f8', paper: '#fff' },
    text: { primary: '#1b2c34', secondary: '#657780' }, success: { main: '#2e8064' }, warning: { main: '#b8771f' }, error: { main: '#b54747' },
  },
  typography: { fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', h4: { fontWeight: 700, letterSpacing: '-.04em' }, h5: { fontWeight: 700, letterSpacing: '-.025em' }, h6: { fontWeight: 700 }, button: { textTransform: 'none', fontWeight: 650 } },
  shape: { borderRadius: 12 },
  components: { MuiCard: { styleOverrides: { root: { border: '1px solid #e6ecee', boxShadow: '0 2px 10px rgba(24,56,66,.035)' } } }, MuiButton: { defaultProps: { disableElevation: true } } },
})
