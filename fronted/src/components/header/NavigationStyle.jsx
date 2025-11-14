//src/components/header/NavigationStyle.jsx
//Estilos para el navbar

import styled from 'styled-components';
import colors from '../../assets/Colors';

export const NavContainer = styled.nav`
    position: fixed;        
    top: 0;                 
    left: 0;              
    width: 100%;           
    z-index: 1000;         
    background-color: ${colors.white};  
    display: flex;          
    justify-content: space-between; 
    align-items: center;    
    padding: 0 40px;       
    height: 80px;           
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); 
`;

export const Logo = styled.img`
    height: 40px;          
    cursor: pointer;        
`;


export const CentralMenu = styled.div`
    display: flex;        
    align-items: center;    
    gap: 20px;          

    @media (max-width: 768px) {
        display: none;     
    }
`;

export const MenuItem = styled.div`
    display: flex;       
    flex-direction: column; 
    align-items: center;  
    justify-content: center; 
    cursor: pointer;      
    padding: 8px 15px;   
    border-radius: 20px;   
    transition: background-color 0.3s, color 0.3s;  
    user-select: none;     

    background-color: ${({ active }) => (active ? colors.background : 'transparent')};
    color: ${({ active }) => (active ? colors.detail : colors.text)};

    &:hover {
        background-color: ${colors.lightGray};
    }
`;

export const MenuIcon = styled.span`
    font-size: 24px;      
    color: ${({ active }) => (active ? colors.primary : colors.detail)};
    margin-bottom: 4px;   
`;

export const MenuText = styled.span`
    font-size: 14px;      
    font-weight: 500;      
`;

export const RightIcons = styled.div`
    display: flex;        
    align-items: center;   
    gap: 15px;             
`;

export const RoleIcon = styled.div`
    cursor: pointer;      
    font-size: 26px;     
    
    color: ${({ active, isDriver }) => 
        active 
            ? (isDriver ? colors.primary : colors.detail)  
            : colors.details};                           

    transition: color 0.3s; 
    
    &:hover {
        opacity: 0.8;       
    }
`;

export const ProfileIcon = styled.div`
    cursor: pointer;      
    font-size: 26px;       
    color: ${colors.details}; 
`;