// src/components/dashboard/AdminDashboard.jsx - VERSIÓN MEJORADA
import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  Badge,
  Divider,
  AvatarGroup,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  CircularProgress,
  Select,
  MenuItem as SelectMenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Description as DescriptionIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  BarChart as BarChartIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  WorkspacePremium as PremiumIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Shield as ShieldIcon,
  VerifiedUser as VerifiedUserIcon,
  Block as BlockIcon,
  LockOpen as LockOpenIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
  CloudUpload as CloudUploadIcon,
  GetApp as GetAppIcon,
  FileCopy as FileCopyIcon,
  Category as CategoryIcon,
  AccountTree as AccountTreeIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from '../../firebase/config';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';
import * as XLSX from 'xlsx';

const AdminDashboard = () => {
  const [registros, setRegistros] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistro, setSelectedRegistro] = useState(null);
  const [viewMotivo, setViewMotivo] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [editMode, setEditMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  
  // NUEVO: Estado para información del administrador actual
  const [adminInfo, setAdminInfo] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    rol: 'admin'
  });
  
  // NUEVO: Estado para diálogo de configuración
  const [openConfigDialog, setOpenConfigDialog] = useState(false);
  const [configData, setConfigData] = useState({
    siteName: 'ClassAdmin',
    emailNotifications: true,
    autoBackup: false,
    maintenanceMode: false,
    registrationOpen: true,
    maxRegistrosPerDay: 100,
    sessionTimeout: 30
  });
  
  // Estados para gestión de usuarios
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEditMode, setUserEditMode] = useState(false);
  const [userFormData, setUserFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    rol: 'socio',
    estado: 'activo',
    permisos: []
  });
  
  // Estados para feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estado para diálogo de confirmación de eliminación
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  
  // Estados para nuevo/editar registro
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    edad: '',
    estatusLaboral: 'Empleado',
    motivo: ''
  });

  // NUEVO: Estados para el calendario
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const navigate = useNavigate();
  const currentUser = auth.currentUser;

  // Opciones de permisos disponibles
  const permisosDisponibles = [
    { id: 'ver_registros', label: 'Ver registros' },
    { id: 'crear_registros', label: 'Crear registros' },
    { id: 'editar_registros', label: 'Editar registros' },
    { id: 'eliminar_registros', label: 'Eliminar registros' },
    { id: 'ver_usuarios', label: 'Ver usuarios' },
    { id: 'gestionar_usuarios', label: 'Gestionar usuarios' },
    { id: 'ver_analytics', label: 'Ver analytics' },
    { id: 'exportar_datos', label: 'Exportar datos' },
    { id: 'gestionar_config', label: 'Gestionar configuración' }
  ];

  // Roles disponibles
  const rolesDisponibles = [
    { value: 'admin', label: 'Administrador', icon: <AdminIcon fontSize="small" /> },
    { value: 'socio', label: 'Socio', icon: <VerifiedUserIcon fontSize="small" /> },
    { value: 'editor', label: 'Editor', icon: <EditIcon fontSize="small" /> },
    { value: 'visor', label: 'Visor', icon: <VisibilityIcon fontSize="small" /> }
  ];

  // NUEVO: Cargar información del administrador actual
  useEffect(() => {
    const loadAdminInfo = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("Datos del usuario cargados:", userData); // Debug
            setAdminInfo({
              nombres: userData.nombres || '',
              apellidos: userData.apellidos || '',
              email: userData.email || currentUser.email || '',
              rol: userData.rol || 'admin'
            });
          } else {
            // Si no existe el documento, usar email del currentUser
            console.log("No existe documento de usuario, usando email"); // Debug
            setAdminInfo({
              nombres: currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || '',
              apellidos: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
              email: currentUser.email || '',
              rol: 'admin'
            });
          }
        } catch (error) {
          console.error("Error cargando info del admin:", error);
          // Fallback en caso de error
          setAdminInfo({
            nombres: currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || '',
            apellidos: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
            email: currentUser.email || '',
            rol: 'admin'
          });
        }
      }
    };
    loadAdminInfo();
  }, [currentUser]);

  // NUEVO: Cargar configuración desde Firebase
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const configDoc = await getDoc(doc(db, 'configuracion', 'general'));
        if (configDoc.exists()) {
          setConfigData({ ...configData, ...configDoc.data() });
        }
      } catch (error) {
        console.error("Error cargando configuración:", error);
      }
    };
    loadConfig();
  }, []);

  // NUEVO: Generar eventos de calendario desde registros
  useEffect(() => {
    const events = registros.map(reg => ({
      id: reg.id,
      title: `${reg.nombres} ${reg.apellidos}`,
      date: new Date(reg.fechaRegistro),
      type: 'registro',
      status: reg.estatusLaboral
    }));
    setCalendarEvents(events);
  }, [registros]);

  // Cargar notificaciones reales
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "notificaciones"), snap => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNotifications(notifs);
    });

    return () => unsub();
  }, []);

  // Datos dinámicos para gráficos
  const generarChartData = () => {
    const conteoPorMes = {};

    registros.forEach(r => {
      if (r.fechaRegistro) {
        const fecha = new Date(r.fechaRegistro);
        if (!isNaN(fecha.getTime())) {
          const mes = fecha.toLocaleString("es", { month: "short" });
          conteoPorMes[mes] = (conteoPorMes[mes] || 0) + 1;
        }
      }
    });

    return Object.keys(conteoPorMes).map(mes => ({
      name: mes,
      registros: conteoPorMes[mes]
    }));
  };

  const chartData = generarChartData();

  // Datos para gráfico de pastel dinámico
  const generarPieData = () => {
    const conteoEstatus = {};
    
    registros.forEach(r => {
      const estatus = r.estatusLaboral || 'No especificado';
      conteoEstatus[estatus] = (conteoEstatus[estatus] || 0) + 1;
    });

    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    let index = 0;
    
    return Object.keys(conteoEstatus).map(estatus => ({
      name: estatus,
      value: conteoEstatus[estatus],
      color: colors[index++ % colors.length]
    }));
  };

  const pieData = generarPieData();

  // Función para contar nuevos registros hoy
  const contarNuevosHoy = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    return registros.filter(r => {
      if (!r.fechaRegistro) return false;
      const fechaReg = new Date(r.fechaRegistro);
      return fechaReg >= hoy;
    }).length;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const registrosSnap = await getDocs(collection(db, "registros"));
        const registrosData = registrosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRegistros(registrosData);

        const usuariosSnap = await getDocs(collection(db, "usuarios"));
        const usuariosData = usuariosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsuarios(usuariosData);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos:", error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // NUEVO: Guardar configuración
  const handleSaveConfig = async () => {
    try {
      await updateDoc(doc(db, 'configuracion', 'general'), configData);
      setSnackbar({
        open: true,
        message: 'Configuración guardada exitosamente',
        severity: 'success'
      });
      setOpenConfigDialog(false);
    } catch (error) {
      console.error("Error guardando configuración:", error);
      setSnackbar({
        open: true,
        message: 'Error al guardar la configuración',
        severity: 'error'
      });
    }
  };

  // NUEVO: Exportar todo (registros + usuarios)
  const handleExportAll = () => {
    const wb = XLSX.utils.book_new();
    
    // Hoja de Registros
    const registrosWS = XLSX.utils.json_to_sheet(
      registros.map(r => ({
        ID: r.id,
        Nombres: r.nombres,
        Apellidos: r.apellidos,
        Email: r.email,
        Teléfono: r.telefono || 'N/A',
        Edad: r.edad,
        'Estado Laboral': r.estatusLaboral,
        'Fecha Registro': new Date(r.fechaRegistro).toLocaleString(),
        Motivo: r.motivo
      }))
    );
    XLSX.utils.book_append_sheet(wb, registrosWS, 'Registros');
    
    // Hoja de Usuarios
    const usuariosWS = XLSX.utils.json_to_sheet(
      usuarios.map(u => ({
        ID: u.id,
        Nombres: u.nombres,
        Apellidos: u.apellidos || 'N/A',
        Email: u.email,
        Rol: u.rol,
        Estado: u.estado || (u.activo ? 'activo' : 'inactivo'),
        'Fecha Registro': u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleString() : 'N/A'
      }))
    );
    XLSX.utils.book_append_sheet(wb, usuariosWS, 'Usuarios');
    
    XLSX.writeFile(wb, `export_completo_${new Date().getTime()}.xlsx`);
    
    setSnackbar({
      open: true,
      message: 'Exportación completa realizada exitosamente',
      severity: 'success'
    });
  };

  // NUEVO: Función para crear backup
  const handleCreateBackup = async () => {
    try {
      const backupData = {
        fecha: new Date().toISOString(),
        registros: registros.length,
        usuarios: usuarios.length,
        notificaciones: notifications.length
      };
      
      await addDoc(collection(db, 'backups'), backupData);
      
      setSnackbar({
        open: true,
        message: 'Backup creado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error creando backup:", error);
      setSnackbar({
        open: true,
        message: 'Error al crear backup',
        severity: 'error'
      });
    }
  };

  const handleDeleteRegistro = async (id) => {
    try {
      await deleteDoc(doc(db, "registros", id));
      setRegistros(registros.filter(r => r.id !== id));
      await addDoc(collection(db, "notificaciones"), {
        tipo: "eliminacion",
        mensaje: `Registro eliminado`,
        fecha: new Date().toISOString(),
        leida: false
      });
      setSnackbar({
        open: true,
        message: 'Registro eliminado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error eliminando registro:", error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el registro',
        severity: 'error'
      });
    }
  };

  const handleEditRegistro = async (id, data) => {
    try {
      await updateDoc(doc(db, "registros", id), data);
      setRegistros(registros.map(r => r.id === id ? {...r, ...data} : r));
      await addDoc(collection(db, "notificaciones"), {
        tipo: "actualizacion",
        mensaje: `Registro de ${data.nombres} actualizado`,
        fecha: new Date().toISOString(),
        leida: false
      });
      setOpenForm(false);
      resetForm();
      setSnackbar({
        open: true,
        message: 'Registro actualizado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error actualizando registro:", error);
      setSnackbar({
        open: true,
        message: 'Error al actualizar el registro',
        severity: 'error'
      });
    }
  };

  const handleCreateRegistro = async () => {
    try {
      const nuevoRegistro = {
        ...formData,
        fechaRegistro: new Date().toISOString(),
        procesado: false,
        userId: currentUser?.uid || null
      };
      
      const docRef = await addDoc(collection(db, "registros"), nuevoRegistro);
      setRegistros([...registros, { id: docRef.id, ...nuevoRegistro }]);
      
      await addDoc(collection(db, "notificaciones"), {
        tipo: "nuevo",
        mensaje: `Nuevo registro: ${formData.nombres} ${formData.apellidos}`,
        fecha: new Date().toISOString(),
        leida: false
      });
      
      setOpenForm(false);
      resetForm();
      setSnackbar({
        open: true,
        message: 'Registro creado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error creando registro:", error);
      setSnackbar({
        open: true,
        message: 'Error al crear el registro',
        severity: 'error'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nombres: '',
      apellidos: '',
      email: '',
      telefono: '',
      edad: '',
      estatusLaboral: 'Empleado',
      motivo: ''
    });
    setEditMode(false);
    setSelectedRegistro(null);
  };

  const handleExportar = () => {
    const datosExportar = registros.map(r => ({
      ID: r.id,
      Nombres: r.nombres,
      Apellidos: r.apellidos,
      Email: r.email,
      Teléfono: r.telefono || 'N/A',
      Edad: r.edad,
      'Estado Laboral': r.estatusLaboral,
      'Fecha Registro': new Date(r.fechaRegistro).toLocaleString(),
      Motivo: r.motivo
    }));

    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Registros");
    XLSX.writeFile(wb, `registros_${new Date().getTime()}.xlsx`);
    
    setSnackbar({
      open: true,
      message: 'Registros exportados exitosamente',
      severity: 'success'
    });
  };

  // Gestión de Usuarios
  const handleOpenUserDialog = (user = null) => {
    if (user) {
      setUserEditMode(true);
      setSelectedUser(user);
      setUserFormData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        email: user.email || '',
        rol: user.rol || 'socio',
        estado: user.estado || (user.activo ? 'activo' : 'inactivo'),
        permisos: user.permisos || []
      });
    } else {
      setUserEditMode(false);
      setSelectedUser(null);
      setUserFormData({
        nombres: '',
        apellidos: '',
        email: '',
        rol: 'socio',
        estado: 'activo',
        permisos: []
      });
    }
    setOpenUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      // PROTECCIÓN: Verificar que solo el super admin puede modificar roles de admin
      if (userEditMode && selectedUser) {
        // Si se está intentando cambiar el rol de un admin y el usuario actual no es el super admin
        if (selectedUser.rol === 'admin' && 
            userFormData.rol !== 'admin' && 
            currentUser?.email !== 'saultorr19@gmail.com') {
          setSnackbar({
            open: true,
            message: 'Solo el administrador principal puede modificar roles de otros administradores',
            severity: 'error'
          });
          return;
        }

        // Si se está intentando asignar rol admin y el usuario actual no es el super admin
        if (userFormData.rol === 'admin' && 
            currentUser?.email !== 'saultorr19@gmail.com') {
          setSnackbar({
            open: true,
            message: 'Solo el administrador principal puede asignar el rol de administrador',
            severity: 'error'
          });
          return;
        }

        await updateDoc(doc(db, 'usuarios', selectedUser.id), {
          ...userFormData,
          activo: userFormData.estado === 'activo'
        });
        setUsuarios(usuarios.map(u => 
          u.id === selectedUser.id ? { ...u, ...userFormData } : u
        ));
        setSnackbar({
          open: true,
          message: 'Usuario actualizado exitosamente',
          severity: 'success'
        });
      } else {
        // PROTECCIÓN: Solo el super admin puede crear nuevos admins
        if (userFormData.rol === 'admin' && currentUser?.email !== 'saultorr19@gmail.com') {
          setSnackbar({
            open: true,
            message: 'Solo el administrador principal puede crear nuevos administradores',
            severity: 'error'
          });
          return;
        }

        const nuevoUsuario = {
          ...userFormData,
          fechaRegistro: new Date().toISOString(),
          activo: userFormData.estado === 'activo'
        };
        const docRef = await addDoc(collection(db, 'usuarios'), nuevoUsuario);
        setUsuarios([...usuarios, { id: docRef.id, ...nuevoUsuario }]);
        setSnackbar({
          open: true,
          message: 'Usuario creado exitosamente',
          severity: 'success'
        });
      }
      setOpenUserDialog(false);
    } catch (error) {
      console.error("Error guardando usuario:", error);
      setSnackbar({
        open: true,
        message: 'Error al guardar el usuario',
        severity: 'error'
      });
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo';
      await updateDoc(doc(db, 'usuarios', userId), {
        estado: newStatus,
        activo: newStatus === 'activo'
      });
      setUsuarios(usuarios.map(u => 
        u.id === userId ? { ...u, estado: newStatus, activo: newStatus === 'activo' } : u
      ));
      setSnackbar({
        open: true,
        message: `Usuario ${newStatus === 'activo' ? 'activado' : 'desactivado'} exitosamente`,
        severity: 'success'
      });
    } catch (error) {
      console.error("Error cambiando estado del usuario:", error);
      setSnackbar({
        open: true,
        message: 'Error al cambiar el estado del usuario',
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'usuarios', userToDelete.id));
      setUsuarios(usuarios.filter(u => u.id !== userToDelete.id));
      setOpenDeleteDialog(false);
      setUserToDelete(null);
      setSnackbar({
        open: true,
        message: 'Usuario eliminado exitosamente',
        severity: 'success'
      });
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      setSnackbar({
        open: true,
        message: 'Error al eliminar el usuario',
        severity: 'error'
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const filtrarRegistros = () => {
    let filtrados = registros;

    if (searchTerm) {
      filtrados = filtrados.filter(r =>
        r.nombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.apellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filtroEstado !== "todos") {
      filtrados = filtrados.filter(r => r.estatusLaboral?.toLowerCase() === filtroEstado);
    }

    return filtrados;
  };

  const registrosFiltrados = filtrarRegistros();

  const contarUsuariosActivos = () => {
    return usuarios.filter(u => u.estado === 'activo' || u.activo === true).length;
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress size={60} />
        <Typography>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <Box className={`executive-dashboard ${darkMode ? 'dark-mode' : ''}`}>
      {/* AppBar */}
      <AppBar position="fixed" className="executive-appbar" elevation={0}>
        <Toolbar className="executive-toolbar">
          <IconButton 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            edge="start"
          >
            {sidebarOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          <Box display="flex" alignItems="center" gap={1.5}>
            <Box className="brand-logo">
              <PersonIcon />
            </Box>
            <Typography variant="h6" className="brand-name">
              CLASS<span className="brand-accent">ADMIN</span>
            </Typography>
            <Chip label="PRO" size="small" className="pro-badge" />
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <TextField
            placeholder="Buscar registros..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-field-minimal"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <Tooltip title="Modo Oscuro">
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="theme-switch"
            />
          </Tooltip>

          <Tooltip title="Notificaciones">
            <IconButton 
              className="header-icon-btn"
              onClick={(e) => setNotificationsAnchor(e.currentTarget)}
            >
              <Badge badgeContent={notifications.filter(n => !n.leida).length} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={notificationsAnchor}
            open={Boolean(notificationsAnchor)}
            onClose={() => setNotificationsAnchor(null)}
            PaperProps={{
              sx: { width: 320, maxHeight: 400 }
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Notificaciones</Typography>
            </Box>
            {notifications.length === 0 ? (
              <MenuItem>
                <Typography variant="body2" color="textSecondary">
                  No hay notificaciones
                </Typography>
              </MenuItem>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <MenuItem key={notif.id}>
                  <Box>
                    <Typography variant="body2">{notif.mensaje}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(notif.fecha).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </Menu>

          {/* NUEVO: Mostrar nombre completo del administrador */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              ml: 2,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Box sx={{ 
              textAlign: 'right', 
              minWidth: 'fit-content',
              whiteSpace: 'nowrap'
            }}>
              <Typography 
                variant="body2" 
                fontWeight={600}
                className="user-name-header"
                sx={{ 
                  whiteSpace: 'nowrap',
                  overflow: 'visible',
                  display: 'block'
                }}
              >
                {adminInfo.nombres && adminInfo.apellidos 
                  ? `${adminInfo.nombres} ${adminInfo.apellidos}`
                  : adminInfo.email || 'Usuario'}
              </Typography>
              <Typography 
                variant="caption" 
                className="user-role-header"
                sx={{ display: 'block' }}
              >
                Super Admin
              </Typography>
            </Box>
            <Avatar className="user-avatar-minimal">
              {adminInfo.nombres && adminInfo.apellidos
                ? `${adminInfo.nombres.charAt(0)}${adminInfo.apellidos.charAt(0)}`
                : adminInfo.email ? adminInfo.email.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { setAnchorEl(null); setOpenConfigDialog(true); }}>
              <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Configuración</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Cerrar Sesión</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        className={`executive-sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        sx={{
          width: sidebarOpen ? 240 : 72,
          '& .MuiDrawer-paper': {
            width: sidebarOpen ? 240 : 72,
            marginTop: '64px',
            borderRight: 'none'
          }
        }}
      >
        <Box className="sidebar-content">
          <List className="sidebar-list">
            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              <ListItemIcon className="sidebar-icon">
                <DashboardIcon />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText 
                  primary="Resumen" 
                  className="sidebar-text"
                />
              )}
            </ListItem>

            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              <ListItemIcon className="sidebar-icon">
                <DescriptionIcon />
              </ListItemIcon>
              {sidebarOpen && (
                <>
                  <ListItemText 
                    primary="Registros" 
                    className="sidebar-text"
                  />
                  <Chip 
                    label={registros.length} 
                    size="small" 
                    className="sidebar-badge"
                  />
                </>
              )}
            </ListItem>

            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              <ListItemIcon className="sidebar-icon">
                <PeopleIcon />
              </ListItemIcon>
              {sidebarOpen && (
                <>
                  <ListItemText 
                    primary="Usuarios" 
                    className="sidebar-text"
                  />
                  <Chip 
                    label={usuarios.length} 
                    size="small" 
                    className="sidebar-badge"
                  />
                </>
              )}
            </ListItem>

            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 3 ? 'active' : ''}`}
              onClick={() => setActiveTab(3)}
            >
              <ListItemIcon className="sidebar-icon">
                <AnalyticsIcon />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText 
                  primary="Analytics" 
                  className="sidebar-text"
                />
              )}
            </ListItem>

            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 4 ? 'active' : ''}`}
              onClick={() => setActiveTab(4)}
            >
              <ListItemIcon className="sidebar-icon">
                <AssessmentIcon />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText 
                  primary="Reportes" 
                  className="sidebar-text"
                />
              )}
            </ListItem>

            {/* NUEVO: Opción de Calendario */}
            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 5 ? 'active' : ''}`}
              onClick={() => setActiveTab(5)}
            >
              <ListItemIcon className="sidebar-icon">
                <CalendarIcon />
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText 
                  primary="Calendario" 
                  className="sidebar-text"
                />
              )}
            </ListItem>

            {/* NUEVO: Opción de Notificaciones */}
            <ListItem 
              button 
              className={`sidebar-item ${activeTab === 6 ? 'active' : ''}`}
              onClick={() => setActiveTab(6)}
            >
              <ListItemIcon className="sidebar-icon">
                <Badge badgeContent={notifications.filter(n => !n.leida).length} color="error">
                  <NotificationsIcon />
                </Badge>
              </ListItemIcon>
              {sidebarOpen && (
                <>
                  <ListItemText 
                    primary="Notificaciones" 
                    className="sidebar-text"
                  />
                  {notifications.filter(n => !n.leida).length > 0 && (
                    <Chip 
                      label={notifications.filter(n => !n.leida).length} 
                      size="small" 
                      className="sidebar-badge"
                      color="error"
                    />
                  )}
                </>
              )}
            </ListItem>
          </List>

          {/* Footer del Sidebar con info del admin */}
          <Box className="sidebar-footer">
            <Divider sx={{ mb: 2 }} />
            {sidebarOpen && (
              <Box className="admin-info">
                <Avatar className="admin-avatar">
                  {adminInfo.nombres && adminInfo.apellidos
                    ? adminInfo.nombres.charAt(0)
                    : adminInfo.email ? adminInfo.email.charAt(0).toUpperCase() : 'U'}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight={600}
                    sx={{ 
                      whiteSpace: 'normal',
                      wordWrap: 'break-word',
                      lineHeight: 1.3
                    }}
                  >
                    {adminInfo.nombres && adminInfo.apellidos 
                      ? `${adminInfo.nombres} ${adminInfo.apellidos}`
                      : adminInfo.email || 'Usuario'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" noWrap>
                    {adminInfo.email}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box className={`executive-main ${sidebarOpen ? '' : 'sidebar-closed'}`} sx={{ marginTop: '64px' }}>
        <Container maxWidth={false} className="executive-container">
          {/* Tab 0: Resumen */}
          {activeTab === 0 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  Panel de Administración
                </Typography>
                <Typography className="dashboard-subtitle">
                  Gestión completa del sistema - Última actualización: Hoy
                </Typography>
                <Box className="header-actions">
                  <Button 
                    variant="outlined" 
                    startIcon={<DownloadIcon />}
                    onClick={handleExportar}
                    className="export-btn"
                  >
                    Exportar
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<FilterIcon />}
                    className="filter-btn"
                  >
                    Filtrar Empleados
                  </Button>
                  <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={() => {
                      resetForm();
                      setOpenForm(true);
                    }}
                    className="add-btn"
                  >
                    Nuevo Registro
                  </Button>
                </Box>
              </Box>

              {/* Stats Cards */}
              <Grid container spacing={3} className="stats-grid">
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                          <DescriptionIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {registros.length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            TOTAL REGISTROS
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={12} 
                        sx={{ mt: 2, height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        +12% vs mes anterior
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                          <PeopleIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {contarUsuariosActivos()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            USUARIOS ACTIVOS
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28 } }}>
                          {usuarios.slice(0, 3).map((u, i) => (
                            <Avatar key={i} className="stat-avatar">
                              {u.nombres?.charAt(0)}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="textSecondary">
                          1 administradores
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                          <TrendingUpIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {contarNuevosHoy()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            NUEVOS HOY
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <TrendingUpIcon fontSize="small" sx={{ color: '#10b981' }} />
                        <Typography variant="caption" sx={{ color: '#10b981' }}>
                          +8 registros esta semana
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
                          <BarChartIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {Math.round((contarNuevosHoy() / (registros.length || 1)) * 100)}%
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            RENDIMIENTO
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.round((contarNuevosHoy() / (registros.length || 1)) * 100)}
                        sx={{ mt: 2, height: 6, borderRadius: 3, bgcolor: 'rgba(139, 92, 246, 0.1)', '& .MuiLinearProgress-bar': { bgcolor: '#8b5cf6' } }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Charts */}
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                  <Card className="chart-card">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6" fontWeight={600}>
                          Tendencia de Registros
                        </Typography>
                        <Chip label="Mensual" size="small" />
                      </Box>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorRegistros" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip />
                          <Area type="monotone" dataKey="registros" stroke="#6366f1" fillOpacity={1} fill="url(#colorRegistros)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card className="chart-card">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={3}>
                        Por Estado Laboral
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* Tab 1: Registros */}
          {activeTab === 1 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  Gestión de Registros
                </Typography>
                <Typography className="dashboard-subtitle">
                  Total de {registros.length} registros en el sistema
                </Typography>
              </Box>

              <Card className="table-card-executive">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} className="table-header-executive">
                    <Typography variant="h6" fontWeight={600}>
                      Lista de Registros
                    </Typography>
                    <Box display="flex" gap={2} className="table-actions">
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Filtrar por estado</InputLabel>
                        <Select
                          value={filtroEstado}
                          label="Filtrar por estado"
                          onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                          <MenuItem value="todos">Todos</MenuItem>
                          <MenuItem value="empleado">Empleado</MenuItem>
                          <MenuItem value="estudiante">Estudiante</MenuItem>
                          <MenuItem value="desempleado">Desempleado</MenuItem>
                          <MenuItem value="independiente">Independiente</MenuItem>
                        </Select>
                      </FormControl>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => {
                          resetForm();
                          setOpenForm(true);
                        }}
                        className="add-btn"
                      >
                        Nuevo
                      </Button>
                    </Box>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Avatar</strong></TableCell>
                          <TableCell><strong>Nombre</strong></TableCell>
                          <TableCell><strong>Email</strong></TableCell>
                          <TableCell><strong>Teléfono</strong></TableCell>
                          <TableCell><strong>Edad</strong></TableCell>
                          <TableCell><strong>Estado</strong></TableCell>
                          <TableCell align="center"><strong>Acciones</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {registrosFiltrados.map((registro) => (
                          <TableRow key={registro.id} hover>
                            <TableCell>
                              <Avatar sx={{ bgcolor: '#6366f1' }}>
                                {registro.nombres?.charAt(0)}
                              </Avatar>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {registro.nombres} {registro.apellidos}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <EmailIcon fontSize="small" color="action" />
                                <Typography variant="body2">{registro.email}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PhoneIcon fontSize="small" color="action" />
                                <Typography variant="body2">{registro.telefono || 'N/A'}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{registro.edad}</TableCell>
                            <TableCell>
                              <Chip 
                                label={registro.estatusLaboral}
                                size="small"
                                className={`status-chip-executive ${registro.estatusLaboral?.toLowerCase()}`}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="Ver detalles">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setSelectedRegistro(registro);
                                    setViewMotivo(true);
                                  }}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setSelectedRegistro(registro);
                                    setFormData({
                                      nombres: registro.nombres || '',
                                      apellidos: registro.apellidos || '',
                                      email: registro.email || '',
                                      telefono: registro.telefono || '',
                                      edad: registro.edad || '',
                                      estatusLaboral: registro.estatusLaboral || 'Empleado',
                                      motivo: registro.motivo || ''
                                    });
                                    setEditMode(true);
                                    setOpenForm(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleDeleteRegistro(registro.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tab 2: Usuarios */}
          {activeTab === 2 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  Gestión de Usuarios
                </Typography>
                <Typography className="dashboard-subtitle">
                  {usuarios.length} usuarios totales - {contarUsuariosActivos()} activos
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenUserDialog()}
                  className="add-btn"
                >
                  Nuevo Usuario
                </Button>
              </Box>

              <Card className="table-card-executive">
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Usuario</strong></TableCell>
                          <TableCell><strong>Email</strong></TableCell>
                          <TableCell><strong>Rol</strong></TableCell>
                          <TableCell><strong>Estado</strong></TableCell>
                          <TableCell><strong>Permisos</strong></TableCell>
                          <TableCell align="center"><strong>Acciones</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {usuarios.map((usuario) => (
                          <TableRow key={usuario.id} hover>
                            <TableCell>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#6366f1' }}>
                                  {usuario.nombres?.charAt(0)}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight={500}>
                                    {usuario.nombres} {usuario.apellidos}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    ID: {usuario.id.substring(0, 8)}
                                  </Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>{usuario.email}</TableCell>
                            <TableCell>
                              <Chip 
                                icon={rolesDisponibles.find(r => r.value === usuario.rol)?.icon}
                                label={rolesDisponibles.find(r => r.value === usuario.rol)?.label || usuario.rol}
                                size="small"
                                sx={{ 
                                  bgcolor: usuario.rol === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                  color: usuario.rol === 'admin' ? '#6366f1' : '#8b5cf6'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={(usuario.estado || (usuario.activo ? 'activo' : 'inactivo')).toUpperCase()}
                                size="small"
                                sx={{
                                  bgcolor: (usuario.estado === 'activo' || usuario.activo) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                  color: (usuario.estado === 'activo' || usuario.activo) ? '#10b981' : '#ef4444'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              {usuario.permisos && usuario.permisos.length > 0 ? (
                                <Tooltip title={usuario.permisos.join(', ')}>
                                  <Chip 
                                    label={`${usuario.permisos.length} permisos`}
                                    size="small"
                                    variant="outlined"
                                  />
                                </Tooltip>
                              ) : (
                                <Typography variant="caption" color="textSecondary">
                                  Sin permisos
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title={(usuario.estado === 'activo' || usuario.activo) ? 'Desactivar' : 'Activar'}>
                                <IconButton 
                                  size="small"
                                  onClick={() => handleToggleUserStatus(usuario.id, usuario.estado || (usuario.activo ? 'activo' : 'inactivo'))}
                                >
                                  {(usuario.estado === 'activo' || usuario.activo) ? <LockOpenIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Editar">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleOpenUserDialog(usuario)}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar">
                                <IconButton 
                                  size="small"
                                  onClick={() => {
                                    setUserToDelete(usuario);
                                    setOpenDeleteDialog(true);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </>
          )}

          {/* Tab 3: Analytics */}
          {activeTab === 3 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  Analytics Avanzados
                </Typography>
                <Typography className="dashboard-subtitle">
                  Métricas y estadísticas del sistema
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card className="chart-card">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={3}>
                        Registros por Mes
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip />
                          <Bar dataKey="registros" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card className="chart-card">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={3}>
                        Tendencia de Crecimiento
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip />
                          <Line type="monotone" dataKey="registros" stroke="#10b981" strokeWidth={3} dot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card className="chart-card">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={3}>
                        Distribución por Estado Laboral
                      </Typography>
                      <Grid container spacing={2}>
                        {pieData.map((item, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card variant="outlined" sx={{ p: 2, borderColor: item.color }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Box 
                                  sx={{ 
                                    width: 48, 
                                    height: 48, 
                                    borderRadius: 2, 
                                    bgcolor: `${item.color}20`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <CategoryIcon sx={{ color: item.color }} />
                                </Box>
                                <Box>
                                  <Typography variant="h5" fontWeight={700}>
                                    {item.value}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    {item.name}
                                  </Typography>
                                </Box>
                              </Box>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* Tab 4: Reportes */}
          {activeTab === 4 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  Reportes y Exportación
                </Typography>
                <Typography className="dashboard-subtitle">
                  Genera y descarga reportes del sistema
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card className="chart-card">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <GetAppIcon fontSize="large" color="primary" />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            Exportar Registros
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Descarga todos los registros en formato Excel
                          </Typography>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth
                        startIcon={<DownloadIcon />}
                        onClick={handleExportar}
                      >
                        Descargar Registros
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card className="chart-card">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <FileCopyIcon fontSize="large" color="success" />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            Exportación Completa
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Descarga registros y usuarios en un solo archivo
                          </Typography>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth
                        color="success"
                        startIcon={<CloudUploadIcon />}
                        onClick={handleExportAll}
                      >
                        Exportar Todo
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card className="chart-card">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <SaveIcon fontSize="large" sx={{ color: '#8b5cf6' }} />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            Crear Backup
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Genera una copia de seguridad de los datos
                          </Typography>
                        </Box>
                      </Box>
                      <Button 
                        variant="contained" 
                        fullWidth
                        sx={{ bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
                        startIcon={<SaveIcon />}
                        onClick={handleCreateBackup}
                      >
                        Crear Backup
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card className="chart-card">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2} mb={3}>
                        <TimelineIcon fontSize="large" sx={{ color: '#f59e0b' }} />
                        <Box>
                          <Typography variant="h6" fontWeight={600}>
                            Reporte de Actividad
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Resumen de actividad del sistema
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          • Total de registros: {registros.length}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          • Usuarios activos: {contarUsuariosActivos()}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          • Registros hoy: {contarNuevosHoy()}
                        </Typography>
                        <Typography variant="body2">
                          • Notificaciones: {notifications.length}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* NUEVO: Tab 5: Calendario */}
          {activeTab === 5 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  Calendario de Eventos
                </Typography>
                <Typography className="dashboard-subtitle">
                  Visualiza los registros y eventos del sistema
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card className="chart-card">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={3}>
                        Vista de Calendario - {selectedDate.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                      </Typography>
                      
                      {/* Controles del calendario */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <IconButton 
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() - 1);
                            setSelectedDate(newDate);
                          }}
                        >
                          <ChevronLeftIcon />
                        </IconButton>
                        
                        <Typography variant="h6">
                          {selectedDate.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                        </Typography>
                        
                        <IconButton 
                          onClick={() => {
                            const newDate = new Date(selectedDate);
                            newDate.setMonth(newDate.getMonth() + 1);
                            setSelectedDate(newDate);
                          }}
                        >
                          <ChevronRightIcon />
                        </IconButton>
                      </Box>

                      {/* Calendario */}
                      <Box sx={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
                        {/* Encabezado de días */}
                        <Grid container spacing={1} sx={{ mb: 1 }}>
                          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                            <Grid item xs key={day}>
                              <Box sx={{ 
                                textAlign: 'center', 
                                fontWeight: 600,
                                color: 'var(--gold-primary)',
                                py: 1
                              }}>
                                {day}
                              </Box>
                            </Grid>
                          ))}
                        </Grid>

                        {/* Días del mes */}
                        <Grid container spacing={1}>
                          {(() => {
                            const year = selectedDate.getFullYear();
                            const month = selectedDate.getMonth();
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const days = [];

                            // Días vacíos al inicio
                            for (let i = 0; i < firstDay; i++) {
                              days.push(
                                <Grid item xs key={`empty-${i}`}>
                                  <Box sx={{ height: 80, border: '1px solid var(--neutral-200)', borderRadius: 1 }} />
                                </Grid>
                              );
                            }

                            // Días del mes
                            for (let day = 1; day <= daysInMonth; day++) {
                              const currentDate = new Date(year, month, day);
                              const eventsForDay = calendarEvents.filter(event => {
                                const eventDate = new Date(event.date);
                                return eventDate.getDate() === day && 
                                       eventDate.getMonth() === month && 
                                       eventDate.getFullYear() === year;
                              });

                              const isToday = new Date().toDateString() === currentDate.toDateString();

                              days.push(
                                <Grid item xs key={day}>
                                  <Box sx={{ 
                                    height: 80, 
                                    border: isToday ? '2px solid var(--gold-primary)' : '1px solid var(--neutral-200)',
                                    borderRadius: 1,
                                    p: 1,
                                    bgcolor: isToday ? 'rgba(212, 175, 55, 0.05)' : 'white',
                                    cursor: eventsForDay.length > 0 ? 'pointer' : 'default',
                                    transition: 'all 0.2s',
                                    '&:hover': eventsForDay.length > 0 ? {
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      transform: 'translateY(-2px)'
                                    } : {}
                                  }}>
                                    <Typography variant="body2" fontWeight={isToday ? 700 : 500}>
                                      {day}
                                    </Typography>
                                    <Box sx={{ mt: 0.5 }}>
                                      {eventsForDay.slice(0, 2).map((event, idx) => (
                                        <Chip
                                          key={idx}
                                          label={event.title}
                                          size="small"
                                          sx={{ 
                                            fontSize: '0.65rem',
                                            height: 16,
                                            mb: 0.5,
                                            maxWidth: '100%',
                                            '& .MuiChip-label': {
                                              px: 0.5,
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              whiteSpace: 'nowrap'
                                            }
                                          }}
                                        />
                                      ))}
                                      {eventsForDay.length > 2 && (
                                        <Typography variant="caption" color="primary" sx={{ fontSize: '0.65rem' }}>
                                          +{eventsForDay.length - 2} más
                                        </Typography>
                                      )}
                                    </Box>
                                  </Box>
                                </Grid>
                              );
                            }

                            return days;
                          })()}
                        </Grid>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card className="chart-card">
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={3}>
                        Eventos del Mes
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {calendarEvents
                          .filter(event => {
                            const eventDate = new Date(event.date);
                            return eventDate.getMonth() === selectedDate.getMonth() && 
                                   eventDate.getFullYear() === selectedDate.getFullYear();
                          })
                          .sort((a, b) => new Date(a.date) - new Date(b.date))
                          .map((event) => (
                          <Card key={event.id} variant="outlined" sx={{ 
                            transition: 'all 0.2s',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              borderColor: 'var(--gold-primary)'
                            }
                          }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                              <Box display="flex" alignItems="center" gap={2}>
                                <Avatar sx={{ bgcolor: '#6366f1', width: 48, height: 48 }}>
                                  {event.title.charAt(0)}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1" fontWeight={600}>
                                    {event.title}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {new Date(event.date).toLocaleDateString('es', { 
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </Typography>
                                </Box>
                                <Chip 
                                  label={event.status || 'Registro'} 
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                        {calendarEvents.filter(event => {
                          const eventDate = new Date(event.date);
                          return eventDate.getMonth() === selectedDate.getMonth() && 
                                 eventDate.getFullYear() === selectedDate.getFullYear();
                        }).length === 0 && (
                          <Box sx={{ 
                            textAlign: 'center', 
                            py: 4,
                            color: 'text.secondary'
                          }}>
                            <CalendarIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                            <Typography>No hay eventos para este mes</Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12}>
                  <Card className="chart-card" sx={{ mt: 3 }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight={600} mb={2}>
                        Resumen del Mes
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Total de eventos</Typography>
                          <Chip label={calendarEvents.length} size="small" color="primary" />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Este mes</Typography>
                          <Chip label={calendarEvents.filter(e => e.date.getMonth() === new Date().getMonth()).length} size="small" />
                        </Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2">Esta semana</Typography>
                          <Chip label={calendarEvents.filter(e => {
                            const today = new Date();
                            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                            return e.date >= weekAgo && e.date <= today;
                          }).length} size="small" />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}

          {/* NUEVO: Tab 6: Notificaciones */}
          {activeTab === 6 && (
            <>
              <Box className="dashboard-header">
                <Typography variant="h4" className="dashboard-title-executive">
                  🔔 Notificaciones del Sistema
                </Typography>
                <Typography className="dashboard-subtitle">
                  Historial de cambios en roles, permisos y actividades del sistema
                </Typography>
                <Box className="header-actions">
                  <Button 
                    variant="outlined" 
                    startIcon={<CheckCircleIcon />}
                    onClick={async () => {
                      // Marcar todas como leídas
                      try {
                        const notificacionesRef = collection(db, 'notificaciones');
                        const snapshot = await getDocs(notificacionesRef);
                        const updatePromises = snapshot.docs.map(doc => 
                          updateDoc(doc.ref, { leida: true })
                        );
                        await Promise.all(updatePromises);
                        setSnackbar({
                          open: true,
                          message: 'Todas las notificaciones marcadas como leídas',
                          severity: 'success'
                        });
                      } catch (error) {
                        console.error('Error marcando notificaciones:', error);
                      }
                    }}
                    className="filter-btn"
                  >
                    Marcar todas como leídas
                  </Button>
                </Box>
              </Box>

              {/* Stats Cards de Notificaciones */}
              <Grid container spacing={3} className="stats-grid" sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}>
                          <NotificationsIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {notifications.filter(n => !n.leida).length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            No Leídas
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                          <EmailIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {notifications.length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                          <AdminIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {notifications.filter(n => n.tipo === 'cambio_rol' || n.tipo === 'permisos_agregados' || n.tipo === 'permisos_removidos').length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Cambios de Usuario
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card className="stat-card-executive">
                    <CardContent>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box className="stat-icon" sx={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                          <DescriptionIcon />
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700}>
                            {notifications.filter(n => n.tipo === 'nuevo' || n.tipo === 'actualizacion' || n.tipo === 'eliminacion').length}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Cambios de Registros
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Sección Principal de Notificaciones */}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Card className="chart-card">
                    <CardContent>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {notifications.length === 0 ? (
                          <Box sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            color: 'text.secondary'
                          }}>
                            <NotificationsIcon sx={{ fontSize: 80, mb: 3, opacity: 0.2 }} />
                            <Typography variant="h5" gutterBottom fontWeight={600}>
                              No hay notificaciones
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                              Las notificaciones de cambios aparecerán aquí
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                              Los cambios en roles, permisos y registros se mostrarán automáticamente
                            </Typography>
                          </Box>
                        ) : (
                          notifications
                            .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                            .map((notif) => {
                              // Determinar el icono y color según el tipo de notificación
                              let icon = <NotificationsIcon />;
                              let chipColor = 'default';
                              let chipLabel = 'General';
                              
                              if (notif.tipo === 'cambio_rol') {
                                icon = <AdminIcon />;
                                chipColor = 'primary';
                                chipLabel = 'Cambio de Rol';
                              } else if (notif.tipo === 'permisos_agregados') {
                                icon = <LockOpenIcon />;
                                chipColor = 'success';
                                chipLabel = 'Permisos Agregados';
                              } else if (notif.tipo === 'permisos_removidos') {
                                icon = <BlockIcon />;
                                chipColor = 'warning';
                                chipLabel = 'Permisos Removidos';
                              } else if (notif.tipo === 'cambio_estado') {
                                icon = <VerifiedUserIcon />;
                                chipColor = 'info';
                                chipLabel = 'Cambio de Estado';
                              } else if (notif.tipo === 'nuevo') {
                                icon = <AddIcon />;
                                chipColor = 'success';
                                chipLabel = 'Nuevo Registro';
                              } else if (notif.tipo === 'actualizacion') {
                                icon = <EditIcon />;
                                chipColor = 'info';
                                chipLabel = 'Actualización';
                              } else if (notif.tipo === 'eliminacion') {
                                icon = <DeleteIcon />;
                                chipColor = 'error';
                                chipLabel = 'Eliminación';
                              }

                              return (
                                <Card 
                                  key={notif.id} 
                                  variant="outlined" 
                                  sx={{ 
                                    transition: 'all 0.2s',
                                    bgcolor: notif.leida ? 'white' : 'rgba(212, 175, 55, 0.05)',
                                    borderLeft: !notif.leida ? '4px solid var(--gold-primary)' : '4px solid transparent',
                                    '&:hover': {
                                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                      borderColor: 'var(--gold-primary)',
                                      transform: 'translateY(-2px)'
                                    }
                                  }}
                                >
                                  <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                                    <Box display="flex" alignItems="flex-start" gap={2}>
                                      <Avatar sx={{ 
                                        bgcolor: notif.leida ? 'grey.300' : 'var(--gold-primary)', 
                                        width: 48, 
                                        height: 48 
                                      }}>
                                        {icon}
                                      </Avatar>
                                      <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                          <Chip 
                                            label={chipLabel} 
                                            size="small"
                                            color={chipColor}
                                            variant="outlined"
                                          />
                                          {!notif.leida && (
                                            <Chip 
                                              label="Nueva" 
                                              size="small"
                                              color="error"
                                              sx={{ height: 22 }}
                                            />
                                          )}
                                        </Box>
                                        <Typography variant="body1" fontWeight={notif.leida ? 500 : 700} sx={{ mb: 1, fontSize: '1.05rem' }}>
                                          {notif.mensaje}
                                        </Typography>
                                        
                                        {/* Mostrar detalles adicionales si existen */}
                                        {notif.detalle && (
                                          <Box sx={{ 
                                            mt: 1.5, 
                                            p: 1.5, 
                                            bgcolor: 'rgba(0,0,0,0.03)', 
                                            borderRadius: 1,
                                            fontSize: '0.9rem'
                                          }}>
                                            {notif.detalle.usuario && (
                                              <Typography variant="caption" display="block" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                                                <strong>👤 Usuario:</strong> {notif.detalle.usuario}
                                              </Typography>
                                            )}
                                            {notif.detalle.email && (
                                              <Typography variant="caption" display="block" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                                                <strong>📧 Email:</strong> {notif.detalle.email}
                                              </Typography>
                                            )}
                                            {notif.detalle.rolAnterior && notif.detalle.rolNuevo && (
                                              <Typography variant="caption" display="block" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                                                <strong>🔄 Cambio:</strong> {notif.detalle.rolAnterior} → {notif.detalle.rolNuevo}
                                              </Typography>
                                            )}
                                            {notif.detalle.permisosAgregados && notif.detalle.permisosAgregados.length > 0 && (
                                              <Typography variant="caption" display="block" sx={{ mb: 0.5, fontSize: '0.85rem' }}>
                                                <strong>✅ Permisos agregados:</strong> {notif.detalle.permisosAgregados.join(', ')}
                                              </Typography>
                                            )}
                                            {notif.detalle.permisosRemovidos && notif.detalle.permisosRemovidos.length > 0 && (
                                              <Typography variant="caption" display="block" sx={{ fontSize: '0.85rem' }}>
                                                <strong>❌ Permisos removidos:</strong> {notif.detalle.permisosRemovidos.join(', ')}
                                              </Typography>
                                            )}
                                          </Box>
                                        )}
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5 }}>
                                          <Typography variant="caption" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <CalendarIcon sx={{ fontSize: 16 }} />
                                            {new Date(notif.fecha).toLocaleDateString('es', { 
                                              weekday: 'short',
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </Typography>
                                        </Box>
                                      </Box>
                                      <Box>
                                        <Tooltip title={notif.leida ? "Marcar como no leída" : "Marcar como leída"}>
                                          <IconButton
                                            size="medium"
                                            onClick={async () => {
                                              try {
                                                await updateDoc(doc(db, 'notificaciones', notif.id), {
                                                  leida: !notif.leida
                                                });
                                              } catch (error) {
                                                console.error('Error actualizando notificación:', error);
                                              }
                                            }}
                                            sx={{
                                              '&:hover': {
                                                bgcolor: 'rgba(0,0,0,0.05)'
                                              }
                                            }}
                                          >
                                            {notif.leida ? <EmailIcon /> : <CheckCircleIcon color="primary" />}
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </Box>
                                  </CardContent>
                                </Card>
                              );
                            })
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </Container>
      </Box>

      {/* NUEVO: Dialog de Configuración */}
      <Dialog 
        open={openConfigDialog} 
        onClose={() => setOpenConfigDialog(false)}
        maxWidth="md"
        fullWidth
        className="executive-dialog"
      >
        <DialogTitle className="executive-dialog-title">
          <Box display="flex" alignItems="center" gap={2} justifyContent="center">
            <SettingsIcon sx={{ fontSize: 32, color: '#6366f1' }} />
            <Typography variant="h6">Configuración del Sistema</Typography>
          </Box>
          <IconButton
            onClick={() => setOpenConfigDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  General
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombre del Sitio"
                  value={configData.siteName}
                  onChange={(e) => setConfigData({...configData, siteName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tiempo de sesión (minutos)"
                  type="number"
                  value={configData.sessionTimeout}
                  onChange={(e) => setConfigData({...configData, sessionTimeout: parseInt(e.target.value)})}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Opciones del Sistema
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configData.emailNotifications}
                      onChange={(e) => setConfigData({...configData, emailNotifications: e.target.checked})}
                    />
                  }
                  label="Notificaciones por Email"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configData.autoBackup}
                      onChange={(e) => setConfigData({...configData, autoBackup: e.target.checked})}
                    />
                  }
                  label="Backup Automático"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configData.registrationOpen}
                      onChange={(e) => setConfigData({...configData, registrationOpen: e.target.checked})}
                    />
                  }
                  label="Registro Público Activo"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configData.maintenanceMode}
                      onChange={(e) => setConfigData({...configData, maintenanceMode: e.target.checked})}
                    />
                  }
                  label="Modo Mantenimiento"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Límites
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Máximo de registros por día"
                  type="number"
                  value={configData.maxRegistrosPerDay}
                  onChange={(e) => setConfigData({...configData, maxRegistrosPerDay: parseInt(e.target.value)})}
                  helperText="Límite de registros públicos que se pueden crear por día"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center', p: 3 }}>
          <Button 
            onClick={() => setOpenConfigDialog(false)}
            className="dialog-close-btn"
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />}
            onClick={handleSaveConfig}
            className="dialog-action-btn"
          >
            Guardar Configuración
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Nuevo/Editar Registro */}
      <Dialog 
        open={openForm} 
        onClose={() => {
          setOpenForm(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
        className="executive-dialog"
      >
        <DialogTitle className="executive-dialog-title" sx={{ textAlign: 'center' }}>
          <Typography variant="h6">
            {editMode ? 'Editar Registro' : 'Nuevo Registro'}
          </Typography>
          <IconButton
            onClick={() => {
              setOpenForm(false);
              resetForm();
            }}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={formData.nombres}
                  onChange={(e) => setFormData({...formData, nombres: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({...formData, apellidos: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Edad"
                  type="number"
                  value={formData.edad}
                  onChange={(e) => setFormData({...formData, edad: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={10}>
                <FormControl fullWidth>
                  <InputLabel>Estado Laboral</InputLabel>
                  <Select
                    value={formData.estatusLaboral}
                    label="Estado Laboral"
                    onChange={(e) => setFormData({...formData, estatusLaboral: e.target.value})}
                  >
                    <MenuItem value="Empleado">Empleado</MenuItem>
                    <MenuItem value="Estudiante">Estudiante</MenuItem>
                    <MenuItem value="Desempleado">Desempleado</MenuItem>
                    <MenuItem value="Independiente">Independiente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={10}>
                <TextField
                  fullWidth
                  label="Motivo del Registro"
                  multiline
                  rows={4}
                  value={formData.motivo}
                  onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            onClick={() => {
              setOpenForm(false);
              resetForm();
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            startIcon={editMode ? <SaveIcon /> : <AddIcon />}
            onClick={() => {
              if (editMode && selectedRegistro) {
                handleEditRegistro(selectedRegistro.id, formData);
              } else {
                handleCreateRegistro();
              }
            }}
          >
            {editMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Detalles */}
      <Dialog 
        open={viewMotivo} 
        onClose={() => setViewMotivo(false)} 
        maxWidth="lg"
        fullWidth
        className="executive-dialog"
        PaperProps={{
          sx: {
            minHeight: '75vh'
          }
        }}
      >
        <DialogTitle className="executive-dialog-title">
          <Box display="flex" alignItems="center" gap={2} justifyContent="center">
            <Avatar className="dialog-main-avatar">
              {selectedRegistro?.nombres?.charAt(0)}
            </Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6">
                {selectedRegistro?.nombres} {selectedRegistro?.apellidos}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ID: {selectedRegistro?.id?.substring(0, 8).toUpperCase()}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ py: 4 }}>
          {selectedRegistro && (
            <Box>
              {/* Header con tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      pb: 1, 
                      borderBottom: 2, 
                      borderColor: '#d4af37',
                      fontWeight: 600,
                      color: '#1e40af'
                    }}
                  >
                    Información Personal
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      pb: 1, 
                      fontWeight: 600,
                      color: '#1e40af'
                    }}
                  >
                    Registro
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      pb: 1, 
                      fontWeight: 600,
                      color: '#1e40af'
                    }}
                  >
                    Motivo del Registro
                  </Typography>
                </Box>
              </Box>

              {/* Grid 3x2 para información */}
              <Grid container spacing={2} sx={{ mb: 3, maxWidth: 900, mx: 'auto' }}>
                {/* Fila 1 */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                      Email:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRegistro.email}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                      Fecha:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {new Date(selectedRegistro.fechaRegistro).toLocaleDateString('es', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                      ID Usuario:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRegistro.userId || 'N/A'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Fila 2 */}
                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                      Teléfono:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRegistro.telefono || 'No especificado'}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                      Edad:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedRegistro.edad} años
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper 
                    variant="outlined" 
                    sx={{ 
                      p: 2, 
                      textAlign: 'center',
                      bgcolor: '#f5f5f5',
                      minHeight: 80,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" sx={{ mb: 0.5 }}>
                      Estado:
                    </Typography>
                    <Chip 
                      label={selectedRegistro.estatusLaboral}
                      size="small"
                      className={`status-chip-executive ${selectedRegistro.estatusLaboral?.toLowerCase()}`}
                      sx={{ mt: 0.5 }}
                    />
                  </Paper>
                </Grid>
              </Grid>

              {/* Cuadro grande para Motivo del Registro */}
              <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 3, 
                    bgcolor: '#f5f5f5',
                    minHeight: 300,
                    border: '2px solid #e0e0e0'
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {selectedRegistro.motivo}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions className="executive-dialog-actions" sx={{ justifyContent: 'center' }}>
          <Button onClick={() => setViewMotivo(false)} className="dialog-close-btn">
            Cerrar
          </Button>
          <Button 
            variant="contained" 
            className="dialog-action-btn"
            onClick={() => {
              setViewMotivo(false);
              setSelectedRegistro(selectedRegistro);
              setFormData({
                nombres: selectedRegistro.nombres || '',
                apellidos: selectedRegistro.apellidos || '',
                email: selectedRegistro.email || '',
                telefono: selectedRegistro.telefono || '',
                edad: selectedRegistro.edad || '',
                estatusLaboral: selectedRegistro.estatusLaboral || 'Empleado',
                motivo: selectedRegistro.motivo || ''
              });
              setEditMode(true);
              setOpenForm(true);
            }}
          >
            Editar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Gestión de Usuarios */}
      <Dialog 
        open={openUserDialog} 
        onClose={() => setOpenUserDialog(false)}
        maxWidth="md"
        fullWidth
        className="executive-dialog"
      >
        <DialogTitle className="executive-dialog-title" sx={{ textAlign: 'center' }}>
          <Typography variant="h6">
            {userEditMode ? 'Editar Usuario' : 'Nuevo Usuario'}
          </Typography>
          <IconButton
            onClick={() => setOpenUserDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nombres"
                  value={userFormData.nombres}
                  onChange={(e) => setUserFormData({...userFormData, nombres: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Apellidos"
                  value={userFormData.apellidos}
                  onChange={(e) => setUserFormData({...userFormData, apellidos: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={userFormData.rol}
                    label="Rol"
                    onChange={(e) => setUserFormData({...userFormData, rol: e.target.value})}
                  >
                    {rolesDisponibles.map((rol) => {
                      // PROTECCIÓN: Solo el admin original (saultorr19@gmail.com) puede cambiar roles de admin
                      // Esto previene que otros admins se remuevan entre sí o escalen privilegios
                      const isProtectedRole = rol.value === 'admin' && 
                                             selectedUser?.rol === 'admin' && 
                                             currentUser?.email !== 'saultorr19@gmail.com';
                      
                      return (
                        <MenuItem 
                          key={rol.value} 
                          value={rol.value}
                          disabled={isProtectedRole}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            {rol.icon}
                            {rol.label}
                            {isProtectedRole && (
                              <Chip 
                                label="Protegido" 
                                size="small" 
                                color="warning" 
                                icon={<ShieldIcon />}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={userFormData.estado}
                    label="Estado"
                    onChange={(e) => setUserFormData({...userFormData, estado: e.target.value})}
                  >
                    <MenuItem value="activo">Activo</MenuItem>
                    <MenuItem value="inactivo">Inactivo</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Permisos
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {permisosDisponibles.map((permiso) => (
                    <Chip
                      key={permiso.id}
                      label={permiso.label}
                      onClick={() => {
                        const permisos = userFormData.permisos || [];
                        if (permisos.includes(permiso.id)) {
                          setUserFormData({
                            ...userFormData,
                            permisos: permisos.filter(p => p !== permiso.id)
                          });
                        } else {
                          setUserFormData({
                            ...userFormData,
                            permisos: [...permisos, permiso.id]
                          });
                        }
                      }}
                      color={(userFormData.permisos || []).includes(permiso.id) ? "primary" : "default"}
                      variant={(userFormData.permisos || []).includes(permiso.id) ? "filled" : "outlined"}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenUserDialog(false)}
            className="dialog-close-btn"
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            startIcon={userEditMode ? <SaveIcon /> : <AddIcon />}
            onClick={handleSaveUser}
            className="dialog-action-btn"
          >
            {userEditMode ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmación de Eliminación */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        className="executive-dialog"
      >
        <DialogTitle className="executive-dialog-title">
          <Box display="flex" alignItems="center" gap={2} justifyContent="center">
            <WarningIcon sx={{ color: '#ef4444', fontSize: 32 }} />
            <Typography variant="h6">Confirmar Eliminación</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" textAlign="center">
            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.nombres} {userToDelete?.apellidos}</strong>?
          </Typography>
          <Typography variant="body2" color="textSecondary" textAlign="center" sx={{ mt: 2 }}>
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center' }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            className="dialog-close-btn"
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteUser}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({...snackbar, open: false})} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminDashboard;