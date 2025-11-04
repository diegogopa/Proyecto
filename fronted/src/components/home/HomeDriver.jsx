// HomeDriver.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import colors from '../../assets/Colors.jsx';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/Logo.png';
import profilePhoto from '../../assets/ProfilePhoto.png';
import iconHome from "../../assets/Home.png";
import iconReservedTravel from "../../assets/ReservedTravel.png";
import iconCurrentTravel from "../../assets/CurrentTravel.png";
import CreateTrip from '../trips/CreateTrip.jsx';

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

function HomeDriver() {
  const [userName, setUserName] = useState("Conductor");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [showModal, setShowModal] = useState(false);
  const [departureTime, setDepartureTime] = useState('');
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [price, setPrice] = useState('');
  const [trips, setTrips] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.nombre) {
      setUserName(`${storedUser.nombre} ${storedUser.apellido || ""}`);
    }
  }, []);

  useEffect(() => {
    const fetchUserTrips = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?._id) return;
      
      try {
        // Obtener los viajes del backend para asegurar que están actualizados
        const res = await fetch(`https://proyecto5-vs2l.onrender.com/api/trips/${storedUser._id}`);
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
          // Actualizar localStorage con los viajes del backend
          storedUser.trips = data.trips || [];
          localStorage.setItem("user", JSON.stringify(storedUser));
        } else {
          // Si falla, usar los del localStorage como fallback
          if (storedUser?.trips) setTrips(storedUser.trips);
        }
      } catch (error) {
        console.error("Error fetching user trips:", error);
        // Fallback a localStorage
        if (storedUser?.trips) setTrips(storedUser.trips);
      }
    };
    
    if (activeTab === "reserved" || activeTab === "current") {
      fetchUserTrips();
    }
  }, [activeTab]);

  // Próximo viaje
  const getNextTrip = () => {
    if (!trips.length) return null;
    const now = new Date();
    const upcomingTrips = trips
      .map(t => {
        const [hours, minutes] = t.departureTime.split(":").map(Number);
        const tripDate = new Date();
        tripDate.setHours(hours, minutes, 0, 0);
        return { ...t, tripDate };
      })
      .filter(t => t.tripDate >= now);
    if (!upcomingTrips.length) return null;
    upcomingTrips.sort((a, b) => a.tripDate - b.tripDate);
    return upcomingTrips[0];
  };

  // Eliminar viaje
  const handleDeleteTrip = (index) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.trips) return;

    const updatedTrips = [...storedUser.trips];
    updatedTrips.splice(index, 1);
    storedUser.trips = updatedTrips;

    localStorage.setItem("user", JSON.stringify(storedUser));
    setTrips(updatedTrips);
  };

  const handleSubmit = async (tripData) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?._id) {
      alert("Usuario no encontrado 😢");
      return;
    }

    const finalTripData = {
      ...tripData,
      userId: storedUser._id,
    };

    try {
      const res = await fetch("https://proyecto5-vs2l.onrender.com/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalTripData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "No se pudo crear el tramo 😢");

      // Actualizar el usuario local con el nuevo trip
      const updatedUser = { ...storedUser };
      // El backend devuelve el trip creado directamente (sin el objeto trips)
      const tripData = {
        _id: data._id,
        departureTime: data.departureTime,
        fromLocation: data.fromLocation,
        toLocation: data.toLocation,
        price: data.price,
        sector: data.sector,
        cupos: data.cupos,
        createdAt: data.createdAt
      };
      updatedUser.trips = [...(storedUser.trips || []), tripData];
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setTrips(updatedUser.trips);

      alert("Tramo creado correctamente 🚗");

      setShowModal(false);
      
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
          {activeTab === "home" && (
            <GreetingContainer>
              <GreetingLeft>¡Hola {userName || "Conductor"}! 🚗</GreetingLeft>
              <CreateButton onClick={() => setShowModal(true)}>+ Crear tramo</CreateButton>
            </GreetingContainer>
          )}

          {activeTab === "reserved" && (
            <>
              <h3 style={{ textAlign: "center", color: colors.text, marginBottom: "20px" }}>
                📋 Tus viajes creados
              </h3>

              {trips.length === 0 ? (
                <p style={{ textAlign: "center", color: colors.text }}>Aún no has creado viajes 😢</p>
              ) : (
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
                      onClick={() => handleDeleteTrip(index)} 
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

          {activeTab === "current" && (() => {
            const nextTrip = getNextTrip();
            return (
              <>
                <h3 style={{ textAlign: "center", color: colors.text, marginBottom: "20px" }}>
                  🛣️ Tu viaje más próximo
                </h3>

                {!nextTrip ? (
                  <p style={{ textAlign: "center", color: colors.text }}>No hay viajes próximos 😢</p>
                ) : (
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

      <ModalOverlay open={showModal}>
        <ModalContent>
          <CreateTrip
          onTripSubmit={handleSubmit} // Le pasamos la función que llama a la API
          onClose={() => setShowModal(false)} // Le pasamos la función para cerrar
        />
        </ModalContent>
      </ModalOverlay>
    </>
  );
}

export default HomeDriver;
