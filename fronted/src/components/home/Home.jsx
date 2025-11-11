import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import TripCard from "../trips/TripCard.jsx";
import { useDriver } from "../../contexts/DriverContext.jsx";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faCar } from "@fortawesome/free-solid-svg-icons";
import logo from '../../assets/Logo.png';
import profilePhoto from '../../assets/ProfilePhoto.png';
import { useNavigate } from 'react-router-dom';
import iconHome from "../../assets/Home.png";
import iconReservedTravel from "../../assets/ReservedTravel.png";
import iconCurrentTravel from "../../assets/CurrentTravel.png";
import ReservedTravel from '../trips/ApiReserveTravel.jsx';

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


function Home() {
    const { isDriver } = useDriver();
    const [userName, setUserName] = useState("Susana");
    const [menuOpen, setMenuOpen] = useState(false);
    const [sector, setSector] = useState("");
    const [puestos, setPuestos] = useState("");
    const [allTrips, setAllTrips] = useState([]);
    const [filteredTrips, setFilteredTrips] = useState([]);
    const [activeTab, setActiveTab] = useState("home");
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [isReserving, setIsReserving] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [isLoadingReservations, setIsLoadingReservations] = useState(false);

    const handleReserveStart = (trip) => {
        // Convertir cupos a número si es necesario
        const cuposNum = typeof trip.cupos === 'string' ? parseInt(trip.cupos) : trip.cupos;
        
        // Verificar si hay cupos disponibles
        if (cuposNum === 0) {
            alert("⚠️ Este tramo está lleno. No hay cupos disponibles.");
            return;
        }

        setSelectedTrip(trip);
        setIsReserving(true);
    };

    const handleReservationFinish = () => {
        setIsReserving(false);
        setSelectedTrip(null);
        setActiveTab("home");
        // Refrescar los trips para mostrar los cupos actualizados
        // Esto se hace automáticamente cuando activeTab cambia a "home" en el useEffect
        // También refrescar las reservas si el usuario vuelve a la pestaña de reservas
        const refreshReservations = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user"));
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
                console.error("Error refreshing reservations:", error);
            }
        };
        refreshReservations();
    };

    // Obtener todos los viajes del backend
    useEffect(() => {
        const fetchTrips = async () => {
            try {
                setIsLoading(true);
                const url = "https://proyecto5-vs2l.onrender.com/api/trips";
                console.log("Fetching trips from:", url);
                
                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });
                
                console.log("Response status:", res.status);
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error("Error response:", errorText);
                    throw new Error(`Error al obtener viajes: ${res.status} ${errorText}`);
                }
                
                const data = await res.json();
                console.log("Trips data received:", data);
                setAllTrips(data.trips || []);
                setFilteredTrips(data.trips || []);
            } catch (error) {
                console.error("Error fetching trips:", error);
                setAllTrips([]);
                setFilteredTrips([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (activeTab === "home") {
            fetchTrips();
        }
    }, [activeTab]);

    // Obtener reservas del usuario
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                setIsLoadingReservations(true);
                const storedUser = JSON.parse(localStorage.getItem("user"));
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
                    console.error("Error fetching reservations:", res.status);
                    setReservations([]);
                }
            } catch (error) {
                console.error("Error fetching reservations:", error);
                setReservations([]);
            } finally {
                setIsLoadingReservations(false);
            }
        };

        if (activeTab === "reserved") {
            fetchReservations();
        }
    }, [activeTab]);

    // Función para cancelar una reserva
    const handleCancelReservation = async (reservationId) => {
        if (!window.confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
            return;
        }

        try {
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (!storedUser?._id) {
                alert("No se encontró la sesión del usuario. Inicia sesión nuevamente.");
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
                alert("Reserva cancelada exitosamente");
            } else {
                const errorData = await res.json();
                alert(errorData.message || "Error al cancelar la reserva. Por favor, intenta nuevamente.");
            }
        } catch (error) {
            console.error("Error canceling reservation:", error);
            alert("Error al cancelar la reserva. Por favor, intenta nuevamente.");
        }
    };

    const handleSearch = () => {
        const filtered = allTrips.filter(
        (trip) =>
            (sector === "" || trip.sector === sector) &&
            (puestos === "" || trip.cupos >= parseInt(puestos))
        );
        setFilteredTrips(filtered);
    };

    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.nombre) {
          setUserName(`${storedUser.nombre} ${storedUser.apellido || ""}`);
      }
    }, []);

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
            {activeTab === "home" && (
                <>
                <SearchBarContainer>
                    <GreetingLeft>¡Buen viaje {userName || "Pasajero"}!</GreetingLeft>

                    <Selector value={sector} onChange={(e) => setSector(e.target.value)}>
                        <option value="">Sectores</option>
                        {Array.from(new Set(allTrips.map(trip => trip.sector))).map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </Selector>

                    <SearchInput
                        type="number"
                        placeholder="Cantidad de puestos disponibles"
                        min="1"
                        value={puestos}
                        onChange={(e) => setPuestos(e.target.value)}
                    />

                    <ActionButton onClick={handleSearch}>
                        <FontAwesomeIcon icon={faCar} /> Buscar
                    </ActionButton>
                </SearchBarContainer>

                {isLoading ? (
                    <p style={{ textAlign: "center", color: colors.text }}>Cargando viajes...</p>
                ) : filteredTrips.length === 0 ? (
                    <p style={{ textAlign: "center", color: colors.text }}>No hay viajes disponibles 😢</p>
                ) : (
                    <TripCardGrid>
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
                            onReserve={() => handleReserveStart(trip)}
                        />
                        ))}
                    </TripCardGrid>
                )}
                </>
            )}

            {activeTab === "reserved" && (
                <>
                    {isLoadingReservations ? (
                        <p style={{ textAlign: "center", color: colors.text }}>Cargando reservas...</p>
                    ) : reservations.length === 0 ? (
                        <p style={{ textAlign: "center", color: colors.text }}>Aún no has reservado ningún viaje 😢</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
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
                                            <p style={{ margin: "8px 0", color: colors.text, fontSize: "0.9rem" }}>
                                                Estado: {reservation.status}
                                            </p>
                                        </div>
                                        <button
                                            style={{
                                                background: colors.primary,
                                                color: "white",
                                                border: "none",
                                                borderRadius: "6px",
                                                padding: "8px 16px",
                                                cursor: "pointer",
                                                fontWeight: "600",
                                            }}
                                            onClick={() => handleCancelReservation(reservation._id)}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    )}
                </>
            )}

            {activeTab === "current" && (
                <h3 style={{ textAlign: "center", color: colors.text }}>
                    🛣️ Aquí verás tus viajes en curso.
                </h3>
            )}
        </ContentWrapper>
    </HomeContainer>
);
}

export default Home;
