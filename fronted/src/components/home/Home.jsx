//src/components/home/Home.jsx
//Componente principal de la vista Home para usuarios Pasajeros
//Incluye: búsqueda de viajes, reservas, viajes en curso y gestión de reservas

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import TripCard from "../trips/TripCard.jsx"; //Componente de tarjeta de viaje
import { useDriver } from "../../contexts/DriverContext.jsx"; //Context para verificar si es conductor
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCar } from "@fortawesome/free-solid-svg-icons";
import logo from '../../assets/Logo.png';
import profilePhoto from '../../assets/ProfilePhoto.png';
import { useNavigate } from 'react-router-dom';
import iconHome from "../../assets/Home.png";
import iconReservedTravel from "../../assets/ReservedTravel.png";
import iconCurrentTravel from "../../assets/CurrentTravel.png";
import ReservedTravel from '../trips/ApiReserveTravel.jsx'; //Componente para reservar un viaje
import { useMessage } from '../../contexts/MessageContext';
import { getUser } from '../../utils/storage';

// --- Estilos de la Página ---
const HomeContainer = styled.div`
    background-color: ${colors.white};
    min-height: 100vh;
    display: flex;
    flex-direction: column;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 20px 40px 0;
  background-color: ${colors.white};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    padding: 20px;
  }
`;

const ContentWrapper = styled.div`
    flex-grow: 1;
    padding: 20px 40px;
    background-color: #f0f4f7;

    @media (max-width: 768px) {
        padding: 20px;
        padding-bottom: 80px;
    }
`;

const LeftSection = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Logo = styled.img`
    height: 45px;
    cursor: pointer;
`;

const ProfileContainer = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    gap: 15px;
`;

const ProfileImage = styled.img`
    width: 42px;
    height: 42px;
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid ${colors.details};
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.05);
    }
`;

const DropdownMenu = styled.div`
    position: absolute;
    top: 50px;
    right: 0;
    background: ${colors.white};
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
    width: 150px;
    display: ${({ open }) => (open ? "block" : "none")};
    z-index: 10;
`;

const DropdownItem = styled.div`
    padding: 10px;
    cursor: pointer;
    color: ${colors.text};
    font-size: 14px;
    border-bottom: 1px solid #eee;

    &:hover {
        background-color: ${colors.background};
    }

    &:last-child {
        border-bottom: none;
    }
`;

const SwitchButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.white};
  border: none;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${colors.details};
  }
`;

const NavMenu = styled.div`
  display: flex;
  justify-content: center;
  gap: 30px;
  margin-bottom: 25px;
  border-bottom: 2px solid ${colors.details};
  padding-bottom: 10px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? "700" : "500")};
  color: ${({ $active }) => ($active ? colors.primary : colors.text)};
  cursor: pointer;
  position: relative;
  transition: color 0.3s;

  &:hover {
    color: ${colors.primary};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ active }) => (active ? colors.primary : "transparent")};
    transition: background-color 0.3s;
  }
`;

const SearchBarContainer = styled.div`
    background-color: #d8e2ed;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
    display: flex;
    gap: 15px;
    align-items: center;

    @media (max-width: 768px) {
        flex-direction: column;
        align-items: stretch;
    }
`;

const Selector = styled.select`
    padding: 10px 15px;
    border: 1px solid ${colors.details};
    border-radius: 8px;
    background-color: ${colors.white};
    color: ${colors.text};
    flex-grow: 1;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid ${colors.details};
  border-radius: 8px;
  flex-grow: 2;
`;

const ActionButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.white};
  border: none;
  cursor: pointer;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s;

  &:hover {
    background-color: #4a5d72;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TripCardGrid = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: flex-start;

    & > div {
        flex-basis: calc(25% - 15px);
        min-width: 200px;
    }

    @media (max-width: 1200px) {
        & > div {
            flex-basis: calc(33.333% - 13.333px);
        }
    }

    @media (max-width: 768px) {
        & > div {
            flex-basis: calc(50% - 10px);
        }
    }

    @media (max-width: 500px) {
        & > div {
            flex-basis: 100%;
        }
    }
`;

const GreetingLeft = styled.h2`
  color: ${colors.text};
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  font-size: 1.3rem;

  @media (max-width: 768px) {
    text-align: center;
    margin-bottom: 10px;
  }
`;

//Convierte hora en formato "HH:MM AM/PM" 
const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = timeString.match(timeRegex);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    //Convierte a formato 24 horas
    if (period === "PM" && hours !== 12) {
        hours += 12;
    } else if (period === "AM" && hours === 12) {
        hours = 0;
    }
    
    //Retorna el total de minutos desde medianoche
    return hours * 60 + minutes;
};

//Componente principal Home para usuarios Pasajeros
function Home() {
    const { isDriver } = useDriver(); //Context para verificar si es conductor
    const { showError, showSuccess, showQuestion } = useMessage(); //Context para mostrar mensajes
    const [userName, setUserName] = useState(""); //Nombre del usuario
    const [menuOpen, setMenuOpen] = useState(false); //Estado del menú desplegable
    const [sector, setSector] = useState(""); //Sector seleccionado para filtrar
    const [puestos, setPuestos] = useState(""); //Cantidad de puestos para filtrar
    const [allTrips, setAllTrips] = useState([]); 
    const [filteredTrips, setFilteredTrips] = useState([]); //Viajes filtrados según búsqueda
    const [activeTab, setActiveTab] = useState("home"); //Pestaña activa (home, reserved, current)
    const [isLoading, setIsLoading] = useState(true); //Estado de carga de viajes
    const navigate = useNavigate();
    const [isReserving, setIsReserving] = useState(false); //Si está en proceso de reserva
    const [selectedTrip, setSelectedTrip] = useState(null); //Viaje seleccionado para reservar
    const [reservations, setReservations] = useState([]); //Lista de reservas del usuario
    const [isLoadingReservations, setIsLoadingReservations] = useState(false); //Estado de carga de reservas
    const [upcomingTrip, setUpcomingTrip] = useState(null); //Viaje más próximo
    const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false); //Estado de carga del viaje próximo

    //Inicia el proceso de reserva de un viaje
    const handleReserveStart = (trip) => {
        //Convierte cupos a número si es necesario
        const cuposNum = typeof trip.cupos === 'string' ? parseInt(trip.cupos) : trip.cupos;
        
        //Verifica si hay cupos disponibles antes de permitir la reserva
        if (cuposNum === 0) {
            showError("Tramo lleno", "Este tramo está lleno. No hay cupos disponibles.");
            return;
        }

        //Guarda el viaje seleccionado y activa el componente de reserva
        setSelectedTrip(trip);
        setIsReserving(true);
    };

    //Finaliza el proceso de reserva y refresca los datos
    const handleReservationFinish = () => {
        setIsReserving(false);
        setSelectedTrip(null);
        setActiveTab("home"); //Vuelve a la pestaña de inicio
        
        //Refresca las reservas para mostrar las actualizadas
        const refreshReservations = async () => {
            try {
                const storedUser = getUser();
                if (!storedUser?._id) return;

                const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/users/${storedUser._id}/reservations`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (res.ok) {
                    const data = await res.json();
                    setReservations(data.reservations || []);
                }
            } catch (error) {
                showError("Error al actualizar", "No se pudieron actualizar las reservas. Por favor, intenta nuevamente.");
            }
        };
        refreshReservations();
    };

    //Obtiene todos los viajes disponibles del backend cuando está en la pestaña "home"
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setIsLoading(true);
                const url = "https://proyecto5-vs2l.onrender.com/api/trips";
                
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Error al obtener viajes: ${res.status} ${errorText}`);
                }
                
                const data = await res.json();
                //Guarda todos los viajes y los viajes filtrados
                setAllTrips(data.trips || []);
                setFilteredTrips(data.trips || []);
            } catch (error) {
                showError("Error al cargar viajes", "No se pudieron cargar los viajes disponibles. Por favor, intenta nuevamente.");
                setAllTrips([]);
                setFilteredTrips([]);
            } finally {
                setIsLoading(false);
            }
        };

        //Solo obtiene los viajes cuando está en la pestaña "home"
        if (activeTab === "home") {
            fetchTrips();
        }
    }, [activeTab]);

    //Obtiene las reservas del usuario cuando está en la pestaña "reserved"
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setIsLoadingReservations(true);
                const storedUser = getUser();
                if (!storedUser?._id) {
                    setReservations([]);
                    return;
                }

                const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/users/${storedUser._id}/reservations`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setReservations(data.reservations || []);
                } else {
                    showError("Error al cargar reservas", "No se pudieron cargar tus reservas. Por favor, intenta nuevamente.");
                    setReservations([]);
                }
            } catch (error) {
                showError("Error al cargar reservas", "No se pudieron cargar tus reservas. Por favor, intenta nuevamente.");
                setReservations([]);
            } finally {
                setIsLoadingReservations(false);
            }
        };

        //Solo obtiene las reservas cuando está en la pestaña "reserved"
        if (activeTab === "reserved") {
            fetchReservations();
        }
    }, [activeTab]);

    //Obtiene el viaje más próximo (reservas aceptadas) cuando está en la pestaña "current"
    useEffect(() => {
        const fetchUpcomingTrip = async () => {
            try {
                setIsLoadingUpcoming(true);
                const storedUser = getUser();
                if (!storedUser?._id) {
                    setUpcomingTrip(null);
                    setIsLoadingUpcoming(false);
                    return;
                }

                const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/users/${storedUser._id}/reservations`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    const reservations = data.reservations || [];
                    
                    //Filtra solo reservas aceptadas que tengan detalles del viaje
                    const acceptedReservations = reservations.filter(
                        (reservation) => 
                            reservation.status === "Aceptada" && 
                            reservation.tripDetails
                    );

                    if (acceptedReservations.length === 0) {
                        setUpcomingTrip(null);
                        setIsLoadingUpcoming(false);
                        return;
                    }

                    //Ordena por hora de salida (más próximo primero) usando timeToMinutes
                    acceptedReservations.sort((a, b) => {
                        const timeA = timeToMinutes(a.tripDetails.horaSalida);
                        const timeB = timeToMinutes(b.tripDetails.horaSalida);
                        return timeA - timeB;
                    });

                    //Toma el viaje más próximo (el primero después de ordenar)
                    setUpcomingTrip(acceptedReservations[0]);
                } else {
                    showError("Error al cargar viaje", "No se pudo cargar el viaje próximo. Por favor, intenta nuevamente.");
                    setUpcomingTrip(null);
                }
            } catch (error) {
                showError("Error al cargar viaje", "No se pudo cargar el viaje próximo. Por favor, intenta nuevamente.");
                setUpcomingTrip(null);
            } finally {
                setIsLoadingUpcoming(false);
            }
        };

        //Solo obtiene el viaje próximo cuando está en la pestaña "current"
        if (activeTab === "current") {
            fetchUpcomingTrip();
        }
    }, [activeTab]);

    //Cancela o borra una reserva según su estado
    const handleCancelReservation = async (reservationId) => {
        //Busca la reserva para determinar el mensaje de confirmación
        const reservation = reservations.find(r => r._id === reservationId);
        const isRejected = reservation?.status === "Rechazada";
        const confirmMessage = isRejected 
            ? "¿Estás seguro de que quieres borrar esta reserva rechazada?"
            : "¿Estás seguro de que quieres cancelar esta reserva?";
        const confirmDetails = isRejected
            ? "Los cupos se devolverán al viaje."
            : "Esta acción cancelará tu reserva.";
        
        //Pide confirmación antes de proceder usando el modal
        showQuestion(confirmMessage, confirmDetails, async () => {
            await proceedWithCancel(reservationId, isRejected);
        });
    };

    const proceedWithCancel = async (reservationId, isRejected) => {

        try {
            const storedUser = getUser();
            if (!storedUser?._id) {
                showError("Sesión no encontrada", "No se encontró la sesión del usuario. Inicia sesión nuevamente.");
                return;
            }

            const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/reservations/${reservationId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: storedUser._id,
                }),
            });

            if (res.ok) {
                // Recargar las reservas
                const refreshRes = await fetch(`https://proyecto5-vs2l.onrender.com/api/users/${storedUser._id}/reservations`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (refreshRes.ok) {
                    const data = await refreshRes.json();
                    setReservations(data.reservations || []);
                }
                const successMessage = isRejected 
                    ? "Reserva borrada exitosamente"
                    : "Reserva cancelada exitosamente";
                const successDetails = isRejected
                    ? "Los cupos han sido devueltos al viaje."
                    : "Tu reserva ha sido cancelada correctamente.";
                showSuccess(successMessage, successDetails);
            } else {
                const errorData = await res.json();
                showError("Error al cancelar", errorData.message || "Error al cancelar la reserva. Por favor, intenta nuevamente.");
            }
        } catch (error) {
            showError("Error al cancelar", "Error al cancelar la reserva. Por favor, intenta nuevamente.");
        }
    };

    //Filtra los viajes según el sector y cantidad de puestos seleccionados
    const handleSearch = () => {
        const filtered = allTrips.filter(
        (trip) =>
            (sector === "" || trip.sector === sector) && //Filtra por sector si está seleccionado
            (puestos === "" || trip.cupos >= parseInt(puestos)) //Filtra por cupos disponibles
        );
        setFilteredTrips(filtered);
    };

    //Obtiene el nombre del usuario del sessionStorage al montar el componente
    useEffect(() => {
      const storedUser = getUser();
      if (storedUser && storedUser.nombre) {
          setUserName(`${storedUser.nombre} ${storedUser.apellido || ""}`);
      }
    }, []);

    //Si está en proceso de reserva, muestra el componente de reserva
    if (isReserving && selectedTrip) {
        return (
            <HomeContainer>
                <ReservedTravel
                    trip={selectedTrip} 
                    onFinishReservation={handleReservationFinish} 
                />
            </HomeContainer>
        );
    }

return (
        <HomeContainer>
            <HeaderContainer>
                <LeftSection>
                    <Logo src={logo} alt="Campus GO Logo" />
                </LeftSection>

                <ProfileContainer>
                    <ProfileImage 
                        src={profilePhoto} 
                        alt="Foto de perfil"
                        onClick={() => setMenuOpen(!menuOpen)}
                    />
                    {/* ✅ Aquí el cambio solicitado */}
                    <SwitchButton onClick={() => navigate('/car-question')}>
                        Cambiar a Conductor
                    </SwitchButton>
                    <DropdownMenu open={menuOpen}>
                        <DropdownItem onClick={() => navigate('/profile')}>Ver perfil</DropdownItem>
                        <DropdownItem onClick={() => navigate('/edit-profile')}>Editar datos</DropdownItem>
                    </DropdownMenu>
                </ProfileContainer>
            </HeaderContainer>

            <NavMenu>
                <NavButton $active={activeTab === "home"} onClick={() => setActiveTab("home")}>
                    <img src={iconHome} alt="home" style={{ width: "18px", height: "18px", marginRight: "8px" }} />
                    Inicio
                </NavButton>
                <NavButton $active={activeTab === "reserved"} onClick={() => setActiveTab("reserved")}>
                    <img src={iconReservedTravel} alt="reserved" style={{ width: "18px", height: "18px", marginRight: "8px" }} />
                    Viajes reservados
                </NavButton>
                <NavButton $active={activeTab === "current"} onClick={() => setActiveTab("current")}>
                    <img src={iconCurrentTravel} alt="current" style={{ width: "18px", height: "18px", marginRight: "8px" }} />
                    Viajes en curso
                </NavButton>
            </NavMenu>

        <ContentWrapper>
            {/*Pestaña Home: Búsqueda y listado de viajes disponibles*/}
            {activeTab === "home" && (
                <>
                <SearchBarContainer>
                    <GreetingLeft>¡Buen viaje {userName || "Pasajero"}!</GreetingLeft>

                    {/*Selector de sector - extrae sectores únicos de todos los viajes*/}
                    <Selector value={sector} onChange={(e) => setSector(e.target.value)}>
                        <option value="">Sectores</option>
                        {Array.from(new Set(allTrips.map(trip => trip.sector))).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Selector>

                    {/*Input para cantidad de puestos requeridos*/}
                    <SearchInput
                        type="number"
                        placeholder="Cantidad de puestos disponibles"
                        min="1"
                        value={puestos}
                        onChange={(e) => setPuestos(e.target.value)}
                    />

                    {/*Botón para ejecutar la búsqueda*/}
                    <ActionButton onClick={handleSearch}>
                        <FontAwesomeIcon icon={faCar} /> Buscar
                    </ActionButton>
                </SearchBarContainer>

                {/*Muestra estado de carga, mensaje vacío o grid de viajes según corresponda*/}
                {isLoading ? (
                    <p style={{ textAlign: "center", color: colors.text }}>Cargando viajes...</p>
                ) : filteredTrips.length === 0 ? (
                    <p style={{ textAlign: "center", color: colors.text }}>No hay viajes disponibles 😢</p>
                ) : (
                    <TripCardGrid>
                        {/*Mapea cada viaje filtrado y muestra una tarjeta*/}
                        {filteredTrips.map((trip) => (
                        <TripCard
                            key={trip.id || trip.tripId}
                            sector={trip.sector}
                            conductor={trip.conductor}
                            desde={trip.desde}
                            para={trip.para}
                            horaSalida={trip.horaSalida}
                            valor={trip.valor}
                            cupos={trip.cupos}
                            carPhoto={trip.carPhoto}
                            onReserve={() => handleReserveStart(trip)}
                        />
                        ))}
                    </TripCardGrid>
                )}
                </>
            )}

            {/*Pestaña Reserved: Lista de reservas del usuario*/}
            {activeTab === "reserved" && (
                <>
                    {isLoadingReservations ? (
                        <p style={{ textAlign: "center", color: colors.text }}>Cargando reservas...</p>
                    ) : reservations.length === 0 ? (
                        <p style={{ textAlign: "center", color: colors.text }}>Aún no has reservado ningún viaje 😢</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                            {/*Mapea cada reserva y muestra una tarjeta con sus detalles*/}
                            {reservations.map((reservation) => (
                                reservation.tripDetails ? (
                                    <div
                                        key={reservation._id}
                                        style={{
                                            background: "white",
                                            padding: "20px",
                                            borderRadius: "10px",
                                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <strong style={{ fontSize: "1.1rem", color: colors.text }}>
                                                {reservation.pickupAddress || reservation.tripDetails.desde} → {reservation.tripDetails.para}
                                            </strong>
                                            <p style={{ margin: "8px 0", color: colors.text }}>
                                                Hora: {reservation.tripDetails.horaSalida}
                                            </p>
                                            <p style={{ margin: "8px 0", color: colors.text }}>
                                                Conductor: {reservation.driverName}
                                            </p>
                                            <p style={{ margin: "8px 0", color: colors.text }}>
                                                Valor: ${typeof reservation.tripDetails.valor === 'number' 
                                                    ? reservation.tripDetails.valor.toLocaleString() 
                                                    : reservation.tripDetails.valor || "0"}
                                            </p>
                                            {/*Muestra el estado con color según su valor*/}
                                            <p style={{ 
                                                margin: "8px 0", 
                                                fontSize: "0.9rem",
                                                fontWeight: "600",
                                                color: reservation.status === "Aceptada" 
                                                    ? "#2ecc71" //Verde
                                                    : reservation.status === "Rechazada" 
                                                    ? "#e74c3c" //Rojo
                                                    : "#f39c12" //Amarillo para Pendiente
                                            }}>
                                                Estado: {reservation.status}
                                            </p>
                                        </div>
                                        {/*Botón diferente según el estado: Borrar para rechazadas, Cancelar para otras*/}
                                        {reservation.status === "Rechazada" ? (
                                            <button
                                                style={{
                                                    background: "#e74c3c",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "8px 16px",
                                                    cursor: "pointer",
                                                    fontWeight: "600",
                                                    transition: "background-color 0.3s",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c0392b"}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e74c3c"}
                                                onClick={() => handleCancelReservation(reservation._id)}
                                            >
                                                Borrar
                                            </button>
                                        ) : (
                                            <button
                                                style={{
                                                    background: colors.primary,
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    padding: "8px 16px",
                                                    cursor: "pointer",
                                                    fontWeight: "600",
                                                    transition: "background-color 0.3s",
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#4a5d72"}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary}
                                                onClick={() => handleCancelReservation(reservation._id)}
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                ) : null
                            ))}
                        </div>
                    )}
                </>
            )}

            {/*Pestaña Current: Muestra el viaje más próximo (reserva aceptada más cercana)*/}
            {activeTab === "current" && (
                <>
                    {isLoadingUpcoming ? (
                        <p style={{ textAlign: "center", color: colors.text }}>Cargando viaje...</p>
                    ) : upcomingTrip ? (
                        /*Muestra los detalles del viaje más próximo*/
                        <div
                            style={{
                                background: "white",
                                padding: "20px",
                                borderRadius: "10px",
                                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                maxWidth: "600px",
                                margin: "0 auto",
                            }}
                        >
                            <div style={{ marginBottom: "15px" }}>
                                <strong style={{ fontSize: "1.2rem", color: colors.text }}>
                                    {upcomingTrip.tripDetails.desde} → {upcomingTrip.tripDetails.para}
                                </strong>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <p style={{ margin: "5px 0", color: colors.text }}>
                                    <strong>Hora de salida:</strong> {upcomingTrip.tripDetails.horaSalida}
                                </p>
                                <p style={{ margin: "5px 0", color: colors.text }}>
                                    <strong>Conductor:</strong> {upcomingTrip.driverName}
                                </p>
                                <p style={{ margin: "5px 0", color: colors.text }}>
                                    <strong>Sector:</strong> {upcomingTrip.tripDetails.sector}
                                </p>
                                <p style={{ margin: "5px 0", color: colors.text }}>
                                    <strong>Valor:</strong> ${typeof upcomingTrip.tripDetails.valor === 'number' 
                                        ? upcomingTrip.tripDetails.valor.toLocaleString() 
                                        : upcomingTrip.tripDetails.valor || "0"}
                                </p>
                                {/*Muestra dirección de recogida si existe*/}
                                {upcomingTrip.pickupAddress && (
                                    <p style={{ margin: "5px 0", color: colors.text }}>
                                        <strong>Dirección de recogida:</strong> {upcomingTrip.pickupAddress}
                                    </p>
                                )}
                                <p style={{ margin: "5px 0", color: colors.text }}>
                                    <strong>Estado:</strong> <span style={{ color: "#2ecc71", fontWeight: "600" }}>{upcomingTrip.status}</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        /*Mensaje cuando no hay viajes próximos*/
                        <div style={{ textAlign: "center", padding: "40px", color: colors.text }}>
                            <p style={{ fontSize: "1.1rem" }}>🛣️ No tienes viajes reservados próximos.</p>
                            <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}>
                                Reserva un viaje para verlo aquí.
                            </p>
                        </div>
                    )}
                </>
            )}
        </ContentWrapper>
    </HomeContainer>
);
}

export default Home;
