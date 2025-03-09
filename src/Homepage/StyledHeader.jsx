
import styled from 'styled-components';
import { Link } from "react-router-dom";
import { Link2 } from 'lucide-react';
export const HeaderContainer = styled.header`
  background-color: #002366;
  color: white;
  padding: 20px;
  padding-left: 70%;
  text-align: center;
  padding-bottom: 10%;
`;

export const Loginnav= styled.button`
  border-radius: 20px;
  background-color: rgb(226, 223, 13); 
  border: none; 
  padding: 10px 20px; 
  font-size: 16px; 
  cursor: pointer; 
  text-decoration: none;  
  color: inherit;    
  &:hover {
    background-color: rgb(200, 197, 10);
  }
`;

export const Logo = styled.h1`
  font-size: 2.5em;
  font-weight: bold;
`;

export const Nav = styled.nav`
  margin-top: 10px;
`;
export const NavLink = styled.a`
  margin: 0 10px;
  color: white;
  text-decoration: none !important;
  font-size: 1.2em;
  color: inherit; 

  &:hover {
    text-decoration: underline;
  }
`;
