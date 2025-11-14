//src/components/home/HomeDriver.jsx
//Componente principal de la vista Home para usuarios Conductores
//Incluye: creación de viajes, gestión de solicitudes pendientes, viajes creados y viaje actual

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';
import profilePhoto from '../../assets/ProfilePhoto.png';
import iconHome from "../../assets/Home.png";
import iconReservedTravel from "../../assets/ReservedTravel.png";
import iconCurrentTravel from "../../assets/CurrentTravel.png";
import CreateTrip from '../trips/CreateTrip.jsx'; //Componente para crear un nuevo viaje

// --- Estilos ---
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

const GreetingContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${colors.white};
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
`;

const CreateButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.white};
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;

  &:hover {
    background-color: ${colors.details};
    transform: scale(1.03);
  }
`;

const ModalOverlay = styled.div`
  display: ${({ open }) => (open ? 'flex' : 'none')};
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.4);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: ${colors.white};
  padding: 30px;
  border-radius: 12px;
  width: 990px; // Aumentar el ancho para que el mapa se vea mejor
  max-width: 95%;
  max-height: 95%;
  overflow-y: auto; //Permite hacer scroll
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: 500;
  color: ${colors.text};
`;

const Input = styled.input`
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
  &:focus {
    outline: none;
    border-color: ${colors.primary};
  }
`;

const SubmitButton = styled.button`
  background-color: ${colors.primary};
  color: ${colors.white};
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: ${colors.details};
  }
`;

//Componente principal HomeDriver para usuarios Conductores
function HomeDriver() {
  const [userName, setUserName] = useState("Conductor"); //Nombre del conductor
  const [menuOpen, setMenuOpen] = useState(false); //Estado del menú desplegable
  const [activeTab, setActiveTab] = useState("home"); //Pestaña activa (home, pending, reserved, current)
  const [showModal, setShowModal] = useState(false); //Estado del modal de crear viaje
  const [departureTime, setDepartureTime] = useState(''); //Hora de salida (no se usa directamente, viene del CreateTrip)
  const [fromLocation, setFromLocation] = useState(''); //Origen (no se usa directamente)
  const [toLocation, setToLocation] = useState(''); //Destino (no se usa directamente)
  const [price, setPrice] = useState(''); //Precio (no se usa directamente)
  const [trips, setTrips] = useState([]); //Lista de viajes creados por el conductor
  const [pendingRequests, setPendingRequests] = useState([]); //Solicitudes pendientes de aprobación
  const [isLoadingRequests, setIsLoadingRequests] = useState(false); //Estado de carga de solicitudes

  const navigate = useNavigate();

  //Obtiene el nombre del usuario del localStorage al montar el componente
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.nombre) {
      setUserName(`${storedUser.nombre} ${storedUser.apellido || ""}`);
    }
  }, []);

  //Obtiene los viajes creados por el conductor cuando está en las pestañas "reserved" o "current"
  useEffect(() => {
    const fetchUserTrips = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?._id) return;
      
      try {
        //Obtiene los viajes del backend para asegurar que están actualizados
        const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/trips/${storedUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
          //Actualiza localStorage con los viajes del backend
          storedUser.trips = data.trips || [];
          localStorage.setItem("user", JSON.stringify(storedUser));
        } else {
          //Si falla, usa los del localStorage como fallback
          if (storedUser?.trips) setTrips(storedUser.trips);
        }
      } catch (error) {
        console.error("Error fetching user trips:", error);
        //Fallback a localStorage
        if (storedUser?.trips) setTrips(storedUser.trips);
      }
    };
    
    //Solo obtiene los viajes cuando está en las pestañas relevantes
    if (activeTab === "reserved" || activeTab === "current") {
      fetchUserTrips();
    }
  }, [activeTab]);

  //Obtiene las solicitudes pendientes de aprobación cuando está en la pestaña "pending"
  useEffect(() => {
    const fetchPendingRequests = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?._id) {
        console.error("No se encontró el ID del usuario en localStorage");
        return;
      }
      
      try {
        setIsLoadingRequests(true);
        const url = `https://proyecto5-vs2l.onrender.com/api/drivers/${storedUser._id}/pending-requests`;
        
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          setPendingRequests(data.requests || []);
        } else {
          const errorData = await res.json().catch(() => ({ message: "Error desconocido" }));
          console.error("Error al obtener solicitudes:", res.status, errorData);
          setPendingRequests([]);
        }
      } catch (error) {
        console.error("Error fetching pending requests:", error);
        setPendingRequests([]);
      } finally {
        setIsLoadingRequests(false);
      }
    };
    
    //Solo obtiene las solicitudes cuando está en la pestaña "pending"
    if (activeTab === "pending") {
      fetchPendingRequests();
    }
  }, [activeTab]);

  //Obtiene el próximo viaje del conductor basado en la hora de salida
  const getNextTrip = () => {
    if (!trips.length) return null;
    const now = new Date();
    //Convierte cada viaje a un objeto con fecha/hora para comparar
    const upcomingTrips = trips
      .map(t => {
        const [hours, minutes] = t.departureTime.split(":").map(Number);
        const tripDate = new Date();
        tripDate.setHours(hours, minutes, 0, 0);
        return { ...t, tripDate };
      })
      .filter(t => t.tripDate >= now); //Filtra solo los que aún no han pasado
    if (!upcomingTrips.length) return null;
    //Ordena por fecha/hora (más próximo primero)
    upcomingTrips.sort((a, b) => a.tripDate - b.tripDate);
    return upcomingTrips[0]; //Retorna el más próximo
  };

  //Elimina un viaje creado por el conductor
  const handleDeleteTrip = async (tripId, index) => {
    //Pide confirmación antes de eliminar
    if (!window.confirm("¿Estás seguro de que quieres eliminar este viaje?")) {
      return;
    }

    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?._id) {
        alert("Usuario no encontrado 😢");
        return;
      }

      // Si no se proporciona tripId, intentar obtenerlo del índice o del array trips
      let tripToDelete = tripId;
      if (!tripToDelete) {
        // Intentar obtenerlo del array trips del estado
        if (trips && trips[index] && trips[index]._id) {
          tripToDelete = trips[index]._id;
        }
        // Si aún no se encuentra, intentar del localStorage
        else if (storedUser.trips && storedUser.trips[index] && storedUser.trips[index]._id) {
          tripToDelete = storedUser.trips[index]._id;
        }
      }

      if (!tripToDelete) {
        console.error("❌ No se pudo identificar el viaje a eliminar", { tripId, index, trips, storedTrips: storedUser.trips });
        alert("No se pudo identificar el viaje a eliminar");
        return;
      }

      console.log("🗑️ Intentando eliminar viaje:", tripToDelete, "Usuario:", storedUser._id);

      // Eliminar el trip del backend
      const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/trips/${tripToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: storedUser._id,
        }),
      });

      console.log("📡 Respuesta del servidor:", res.status, res.statusText);

      if (res.ok) {
        // Recargar los viajes desde el backend para asegurar que estén actualizados
        const refreshRes = await fetch(`https://proyecto5-vs2l.onrender.com/api/trips/${storedUser._id}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          const updatedTrips = refreshData.trips || [];
          setTrips(updatedTrips);

          // Actualizar localStorage
          storedUser.trips = updatedTrips;
          localStorage.setItem("user", JSON.stringify(storedUser));
        } else {
          // Si falla la recarga, actualizar localmente
          const updatedTrips = trips.filter((trip, i) => i !== index);
          setTrips(updatedTrips);
          storedUser.trips = updatedTrips;
          localStorage.setItem("user", JSON.stringify(storedUser));
        }

        alert("Viaje eliminado exitosamente ✅");
      } else {
        let errorMessage = "Error al eliminar el viaje. Por favor, intenta nuevamente.";
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
          console.error("❌ Error del servidor:", errorData);
        } catch (jsonError) {
          console.error("❌ Error parsing error response:", jsonError);
          console.error("❌ Status:", res.status, "StatusText:", res.statusText);
          if (res.status === 404) {
            errorMessage = "La ruta de eliminación no se encontró. Por favor, verifica que el servidor esté actualizado.";
          }
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Error al eliminar el viaje. Por favor, intenta nuevamente.");
    }
  };

  //Crea un nuevo viaje desde el componente CreateTrip
  const handleSubmit = async (tripData) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?._id) {
      alert("Usuario no encontrado 😢");
      return;
    }

    //Agrega el ID del usuario al objeto del viaje
    const finalTripData = {
      ...tripData,
      userId: storedUser._id,
    };

    try {
      //Envía la petición POST para crear el viaje
      const res = await fetch("https://proyecto5-vs2l.onrender.com/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalTripData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "No se pudo crear el tramo 😢");

      //Actualiza el usuario local con el nuevo viaje
      const updatedUser = { ...storedUser };
      //El backend devuelve el viaje creado directamente
      const newTripData = {
        _id: data._id,
        departureTime: data.departureTime,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        price: data.price,
        sector: data.sector,
        cupos: data.cupos,
        createdAt: data.createdAt
      };
      updatedUser.trips = [...(storedUser.trips || []), newTripData];
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setTrips(updatedUser.trips);

      alert("Tramo creado correctamente 🚗");

      setShowModal(false);
      
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  //Acepta o rechaza una solicitud de reserva
  const handleRequestAction = async (reservationId, action) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?._id) {
      alert("Usuario no encontrado 😢");
      return;
    }

    //Determina el estado según la acción (accept o reject)
    const status = action === "accept" ? "Aceptada" : "Rechazada";
    const confirmMessage = action === "accept" 
      ? "¿Estás seguro de que quieres aceptar esta solicitud?"
      : "¿Estás seguro de que quieres rechazar esta solicitud?";

    //Pide confirmación antes de proceder
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/reservations/${reservationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          driverId: storedUser._id,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "No se pudo procesar la solicitud 😢");

      alert(`Solicitud ${status.toLowerCase()} exitosamente ✅`);

      // Recargar las solicitudes pendientes
      const refreshRes = await fetch(`https://proyecto5-vs2l.onrender.com/api/drivers/${storedUser._id}/pending-requests`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        setPendingRequests(refreshData.requests || []);
      }
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  return (
    <>
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
            <SwitchButton onClick={() => navigate('/home')}>
              Cambiar a Pasajero
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
          <NavButton $active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>
            <img src={iconReservedTravel} alt="pending" style={{ width: "18px", height: "18px", marginRight: "8px" }} />
            Viajes pendientes
          </NavButton>
          <NavButton $active={activeTab === "reserved"} onClick={() => setActiveTab("reserved")}>
            <img src={iconReservedTravel} alt="reserved" style={{ width: "18px", height: "18px", marginRight: "8px" }} />
            Viajes creados
          </NavButton>
          <NavButton $active={activeTab === "current"} onClick={() => setActiveTab("current")}>
            <img src={iconCurrentTravel} alt="current" style={{ width: "18px", height: "18px", marginRight: "8px" }} />
            Viaje actual
          </NavButton>
        </NavMenu>

        <ContentWrapper>
          {/*Pestaña Home: Pantalla de bienvenida con botones de acción*/}
          {activeTab === "home" && (
            <GreetingContainer>
              <GreetingLeft>¡Hola {userName || "Conductor"}! 🚗</GreetingLeft>
              <div style={{ display: "flex", gap: "10px" }}>
                {/*Botón para abrir el modal de crear viaje*/}
                <CreateButton onClick={() => setShowModal(true)}>+ Crear tramo</CreateButton>
                {/*Botón para ir a la pestaña de solicitudes pendientes*/}
                <CreateButton onClick={() => setActiveTab("pending")} style={{ backgroundColor: colors.details }}>
                  📋 Ver viajes pendientes
                </CreateButton>
              </div>
            </GreetingContainer>
          )}

          {/*Pestaña Pending: Lista de solicitudes pendientes de aprobación*/}
          {activeTab === "pending" && (
            <>
              <h3 style={{ textAlign: "center", color: colors.text, marginBottom: "20px" }}>
                📋 Solicitudes de viajes pendientes
              </h3>

              {isLoadingRequests ? (
                <p style={{ textAlign: "center", color: colors.text }}>Cargando solicitudes...</p>
              ) : pendingRequests.length === 0 ? (
                <p style={{ textAlign: "center", color: colors.text }}>No hay solicitudes pendientes 😊</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  {/*Mapea cada solicitud pendiente y muestra una tarjeta con opciones de aceptar/rechazar*/}
                  {pendingRequests.map((request) => (
                    <div
                      key={request._id}
                      style={{
                        background: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div style={{ marginBottom: "15px" }}>
                        <h4 style={{ color: colors.text, marginBottom: "10px" }}>
                          Pasajero: {request.passengerName || "Sin nombre"}
                        </h4>
                        <p style={{ margin: "5px 0", color: colors.text }}>
                          <strong>Email:</strong> {request.passengerEmail || "No especificado"}
                        </p>
                        {request.tripDetails ? (
                          <>
                            <p style={{ margin: "5px 0", color: colors.text }}>
                              <strong>Viaje:</strong> {request.tripDetails.desde} → {request.tripDetails.para}
                            </p>
                            <p style={{ margin: "5px 0", color: colors.text }}>
                              <strong>Sector:</strong> {request.tripDetails.sector}
                            </p>
                            <p style={{ margin: "5px 0", color: colors.text }}>
                              <strong>Hora de salida:</strong> {request.tripDetails.horaSalida}
                            </p>
                            <p style={{ margin: "5px 0", color: colors.text }}>
                              <strong>Valor:</strong> ${typeof request.tripDetails.valor === 'number' 
                                ? request.tripDetails.valor.toLocaleString() 
                                : request.tripDetails.valor || "0"}
                            </p>
                            <p style={{ margin: "5px 0", color: colors.text }}>
                              <strong>Dirección de recogida:</strong> {request.pickupAddress || "No especificada"}
                            </p>
                            {request.numberOfSeats > 1 && (
                              <p style={{ margin: "5px 0", color: colors.text }}>
                                <strong>Cupos solicitados:</strong> {request.numberOfSeats}
                              </p>
                            )}
                          </>
                        ) : (
                          <p style={{ margin: "5px 0", color: colors.details }}>
                            <em>Detalles del viaje no disponibles</em>
                          </p>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => handleRequestAction(request._id, "reject")}
                          style={{
                            backgroundColor: "#e74c3c",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "background-color 0.3s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c0392b"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#e74c3c"}
                        >
                          Rechazar
                        </button>
                        <button
                          onClick={() => handleRequestAction(request._id, "accept")}
                          style={{
                            backgroundColor: "#2ecc71",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "10px 20px",
                            cursor: "pointer",
                            fontWeight: "600",
                            transition: "background-color 0.3s",
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#27ae60"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#2ecc71"}
                        >
                          Aceptar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/*Pestaña Reserved: Lista de viajes creados por el conductor*/}
          {activeTab === "reserved" && (
            <>
              <h3 style={{ textAlign: "center", color: colors.text, marginBottom: "20px" }}>
                📋 Tus viajes creados
              </h3>

              {trips.length === 0 ? (
                <p style={{ textAlign: "center", color: colors.text }}>Aún no has creado viajes 😢</p>
              ) : (
                /*Mapea cada viaje creado y muestra una tarjeta con opción de eliminar*/
                trips.map((trip, index) => (
                  <div key={index} style={{ 
                    background: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}>
                    <div>
                      <p><strong>Sector:</strong> {trip.sector}</p>
                      <p><strong>Desde:</strong> {trip.fromLocation}</p>
                      <p><strong>Hasta:</strong> {trip.toLocation}</p>
                      <p><strong>Hora:</strong> {trip.departureTime}</p>
                      <p><strong>Precio:</strong> ${trip.price}</p>
                      <p><strong>Cupos:</strong> {trip.cupos}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteTrip(trip._id, index)} 
                      style={{
                        backgroundColor: "#0B3D91", // azul oscuro
                        color: colors.white,
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "background-color 0.3s"
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = "#133BA0"}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0B3D91"}
                    >
                      Borrar
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {/*Pestaña Current: Muestra el viaje más próximo del conductor*/}
          {activeTab === "current" && (() => {
            const nextTrip = getNextTrip(); //Obtiene el viaje más próximo
            return (
              <>
                <h3 style={{ textAlign: "center", color: colors.text, marginBottom: "20px" }}>
                  🛣️ Tu viaje más próximo
                </h3>

                {!nextTrip ? (
                  <p style={{ textAlign: "center", color: colors.text }}>No hay viajes próximos 😢</p>
                ) : (
                  /*Muestra los detalles del viaje más próximo*/
                  <div style={{
                    background: "white",
                    padding: "15px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                  }}>
                    <p><strong>Sector:</strong> {nextTrip.sector}</p>
                    <p><strong>Desde:</strong> {nextTrip.fromLocation}</p>
                    <p><strong>Hasta:</strong> {nextTrip.toLocation}</p>
                    <p><strong>Hora:</strong> {nextTrip.departureTime}</p>
                    <p><strong>Precio:</strong> ${nextTrip.price}</p>
                    <p><strong>Cupos:</strong> {nextTrip.cupos}</p>
                  </div>
                )}
              </>
            );
          })()}
        </ContentWrapper>
      </HomeContainer>

      {/*Modal para crear un nuevo viaje*/}
      <ModalOverlay open={showModal}>
        <ModalContent>
          <CreateTrip
          onTripSubmit={handleSubmit} //Función que se ejecuta al crear el viaje
          onClose={() => setShowModal(false)} //Función para cerrar el modal
        />
        </ModalContent>
      </ModalOverlay>
    </>
  );
}

export default HomeDriver;
