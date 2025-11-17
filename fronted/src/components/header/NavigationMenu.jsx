//src/components/header/NavigationMenu.jsx
//Menú de navegación principal de la aplicación.
//Se encarga de mostrar las opciones de navegación, el selector de rol (Pasajero/Conductor) y el icono de perfil.
//Redux es una biblioteca de JavaScript para el manejo de estados en la aplicación.

//Hooks
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setRole, selectUserRole, selectHasCar } from '../../features/users/UserSlice.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMapMarkerAlt, faRoad, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { AiOutlineCar, AiOutlineUser } from 'react-icons/ai'; 
import FeedbackModal from '../common/FeedbackModal.jsx'; 
import logo from '../../assets/Logo.png'; 

// Componentes estilizados importados desde NavigationStyle.jsx
import { 
    NavContainer,      // Contenedor principal del navbar
    Logo,              // Imagen del logo
    CentralMenu,       // Menú central con las opciones de navegación
    MenuItem,          // Cada item del menú (Inicio, Viajes, etc.)
    MenuIcon,          // Icono de cada item del menú
    MenuText,          // Texto de cada item del menú
    RightIcons,        // Contenedor de los iconos de la derecha (rol y perfil)
    RoleIcon,          // Icono del selector de rol (Pasajero/Conductor)
    ProfileIcon        // Icono del perfil de usuario
} from './NavigationStyle.jsx'; 

//Este componente inicial es NavigationMenu y renderiza la barra de navegación superior de la aplicación.
//Incluye: logo, menú de navegación, selector de rol y perfil.

function NavigationMenu() {
    const navigate = useNavigate(); //Permite navegar a otras pages
    const location = useLocation(); //Obtiene la page actual
    const path = location.pathname; //Obtiene el nombre de la page actual
    const dispatch = useDispatch(); //Permite enviar acciones a Redux y modificar el estado global
    const role = useSelector(selectUserRole); //Obtiene el rol actual del usuario desde Redux ('pasajero' o 'conductor')
    const hasCar = useSelector(selectHasCar);  //verifica si el usuario tiene un carro registrado (requisto para ser conductor)
    const isConductor = role === 'conductor'; //Manejo ddel menu según el rol
    const [isLogged, setIsLogged] = useState(false); //Manejo de la autenticación del usuario por token
    //Manejo de modales
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [pendingRole, setPendingRole] = useState(null); //Almacena temporalmente el rol al que el usuario quiere cambiar

    //Cambiar de modo (Pasajero/Conductor)
    const confirmToggleMode = (targetRole) => {
        setPendingRole(targetRole);
        
        if (targetRole === 'conductor') {
            // Verificar si tiene carro desde storage o Redux
            const userStr = sessionStorage.getItem('user');
            let userHasCar = hasCar;
            
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    const hasCarComplete = user.placa?.trim() &&
                                         user.marca?.trim() &&
                                         user.modelo?.trim() &&
                                         user.cupos > 0;
                    userHasCar = hasCarComplete;
                } catch (e) {
                    // Si hay error parseando, usar el valor de Redux
                }
            }
            
            if (!userHasCar) {
                // Si no tiene carro, navegar a car-question para registrarlo
                navigate('/car-question');
                return;
            }
        }
        
        setModalType('confirm');
        setShowModal(true);
    };

    //Confirmar cambio de rol
    const handleConfirmChange = () => {
        setShowModal(false);
        
        if (pendingRole) {
            dispatch(setRole(pendingRole));
            
            if (pendingRole === 'conductor') { 
                // Si cambió a conductor, va a la página de inicio del conductor
                navigate('/home-driver');
            } else {
                // Si cambió a pasajero, va a la página de inicio del pasajero
                navigate('/home');
            }
        }
    };

    //Modal cancelar
    const handleCancel = () => {
        setShowModal(false);
    };

    //Verificación de autenticación
    useEffect(() => {
        // Verificar token en sessionStorage (específico de esta pestaña)
        const token = sessionStorage.getItem('token');
        const user = sessionStorage.getItem('user');
        
        // Si no hay token O usuario, limpiar y redirigir
        if (!token || !user) {
            setIsLogged(false);
            // Solo redirigir si no estamos ya en una ruta pública
            const publicRoutes = ['/', '/login', '/register', '/add-photoProfile', '/car-question', '/verify-car', '/register-car', '/car-photo', '/soat-photo'];
            if (!publicRoutes.includes(path)) {
                navigate('/login');
            }
            return;
        }
        
        setIsLogged(true);
    }, [path, navigate]); 

    //Opciones de la barra de menú
    const menuOptions = [
        { path: '/home', icon: faHome, text: 'Inicio' }, //Inicio
        { 
            path: isConductor ? '/created-trips' : '/reserved-trips', 
            icon: faMapMarkerAlt, 
            text: isConductor ? 'Viajes Creados' : 'Viajes Reservados' 
        },
        { path: '/current-trips', icon: faRoad, text: 'Viajes en Curso' },
        ...(isConductor ? [{ path: '/create-trip', icon: AiOutlineCar, text: 'Crear Viaje' }] : [])
    ];
    
    if (!isLogged) return null; //Si no está logueado, no renderiza el navbar

    return (
        <>
            <NavContainer>
                <Logo 
                    src={logo} 
                    alt="Campus Go Logo" 
                    onClick={() => navigate('/home')} 
                />

                <CentralMenu>
                    {menuOptions.map(item => (
                        <MenuItem 
                            key={item.path}  // Key única para React (requerido en map)
                            active={path === item.path}  // Resalta la opción si está en esa ruta
                            onClick={() => navigate(item.path)}  // Navega a la ruta al hacer clickk
                        >
                            <MenuIcon active={path === item.path}>
                                <FontAwesomeIcon icon={item.icon} />
                            </MenuIcon>
                            <MenuText>{item.text}</MenuText>
                        </MenuItem>
                    ))}
                </CentralMenu>

                <RightIcons> 
                     {/* Selector de Rol Pasajero */}
                    <RoleIcon 
                        active={!isConductor} 
                        isDriver={false}
                        onClick={isConductor ? () => confirmToggleMode('pasajero') : null} 
                    >
                        <AiOutlineUser />
                    </RoleIcon>
                    
                    {/* Selector de Rol Conductor */}
                    <RoleIcon 
                        active={isConductor} 
                        isDriver={true}
                        onClick={!isConductor ? () => confirmToggleMode('conductor') : null} 
                    >
                        <AiOutlineCar />
                    </RoleIcon>

                    {/* Icono de Perfil */}
                    <ProfileIcon onClick={() => navigate('/pagina-principal')}>
                        <FontAwesomeIcon icon={faUserCircle} /> 
                    </ProfileIcon>
                </RightIcons>

            </NavContainer>

            {showModal && modalType === 'confirm' && (
                <FeedbackModal
                    type="question" 
                    message={`¿Estás seguro de cambiar a modo ${pendingRole === 'conductor' ? 'Conductor' : 'Pasajero'}?`}
                    details={`Esta acción afectará la forma en que usas la aplicación.`}
                    onClose={handleCancel}      // Cuando cancela (cierra modal)
                    onConfirm={handleConfirmChange}  // Cuando confirma (cambia rol y navega)
                />
            )}

        </>
    );
}

export default NavigationMenu;