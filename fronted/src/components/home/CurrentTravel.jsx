import React, { useState, useEffect } from "react";
import styled from "styled-components";
import colors from "../../assets/Colors.jsx";
import logo from "../../assets/Logo.png";
import profilePhoto from "../../assets/ProfilePhoto.png";
import { useNavigate } from "react-router-dom";

const PageContainer = styled.div`
  padding: 20px 40px;
  background-color: #f0f4f7;
  min-height: 100vh;
  flex-grow: 1;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-top: 20px;
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

const Greeting = styled.h2`
  color: ${colors.text};
  font-weight: 600;
  margin: 0;
`;

const ProfileImage = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${colors.details};
`;

const TripCard = styled.div`
  background-color: ${colors.white};
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
`;

const TripInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TripRoute = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 10px;
`;

const TripDetail = styled.p`
  margin: 5px 0;
  color: ${colors.text};
  font-size: 0.95rem;
`;

const NoTripMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.text};
  font-size: 1.1rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: ${colors.text};
  font-size: 1.1rem;
`;

const CurrentTrips = () => {
  const navigate = useNavigate();
  const [upcomingTrip, setUpcomingTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Función para convertir hora en formato "HH:MM AM/PM" a minutos del día para comparación
  const timeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const timeRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)/i;
    const match = timeString.match(timeRegex);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === "PM" && hours !== 12) {
      hours += 12;
    } else if (period === "AM" && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchUpcomingTrip = async () => {
      try {
        setIsLoading(true);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser?._id) {
          setUpcomingTrip(null);
          setIsLoading(false);
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
          
          // Filtrar solo reservas aceptadas que tengan detalles del viaje
          const acceptedReservations = reservations.filter(
            (reservation) => 
              reservation.status === "Aceptada" && 
              reservation.tripDetails
          );

          if (acceptedReservations.length === 0) {
            setUpcomingTrip(null);
            setIsLoading(false);
            return;
          }

          // Ordenar por hora de salida (más próximo primero)
          acceptedReservations.sort((a, b) => {
            const timeA = timeToMinutes(a.tripDetails.horaSalida);
            const timeB = timeToMinutes(b.tripDetails.horaSalida);
            return timeA - timeB;
          });

          // Tomar el viaje más próximo
          setUpcomingTrip(acceptedReservations[0]);
        } else {
          console.error("Error fetching reservations:", res.status);
          setUpcomingTrip(null);
        }
      } catch (error) {
        console.error("Error fetching upcoming trip:", error);
        setUpcomingTrip(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingTrip();
  }, []);

  return (
    <PageContainer>
      <HeaderContainer>
        <LeftSection>
          <Logo src={logo} onClick={() => navigate("/home")} />
          <Greeting>Viajes en curso</Greeting>
        </LeftSection>
        <ProfileImage src={profilePhoto} alt="Perfil" />
      </HeaderContainer>

      {isLoading ? (
        <LoadingMessage>Cargando viaje...</LoadingMessage>
      ) : upcomingTrip ? (
        <TripCard>
          <TripInfo>
            <TripRoute>
              <strong>{upcomingTrip.tripDetails.desde}</strong> → {upcomingTrip.tripDetails.para}
            </TripRoute>
            <TripDetail>
              <strong>Hora de salida:</strong> {upcomingTrip.tripDetails.horaSalida}
            </TripDetail>
            <TripDetail>
              <strong>Conductor:</strong> {upcomingTrip.driverName}
            </TripDetail>
            <TripDetail>
              <strong>Sector:</strong> {upcomingTrip.tripDetails.sector}
            </TripDetail>
            <TripDetail>
              <strong>Valor:</strong> ${typeof upcomingTrip.tripDetails.valor === 'number' 
                ? upcomingTrip.tripDetails.valor.toLocaleString() 
                : upcomingTrip.tripDetails.valor || "0"}
            </TripDetail>
            {upcomingTrip.pickupAddress && (
              <TripDetail>
                <strong>Dirección de recogida:</strong> {upcomingTrip.pickupAddress}
              </TripDetail>
            )}
            <TripDetail>
              <strong>Estado:</strong> <span style={{ color: "#2ecc71", fontWeight: "600" }}>{upcomingTrip.status}</span>
            </TripDetail>
          </TripInfo>
        </TripCard>
      ) : (
        <NoTripMessage>
          <p>🛣️ No tienes viajes reservados próximos.</p>
          <p style={{ marginTop: "10px", fontSize: "0.9rem", color: "#666" }}>
            Reserva un viaje para verlo aquí.
          </p>
        </NoTripMessage>
      )}
    </PageContainer>
  );
};

export default CurrentTrips;
