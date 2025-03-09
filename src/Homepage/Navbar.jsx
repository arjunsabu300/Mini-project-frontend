import React from "react";
import { HeaderContainer, Logo, Nav, NavLink,Loginnav } from './StyledHeader';
import { Link } from "react-router-dom";
function Navbar() {
    return (
      <HeaderContainer>
        <Logo>Stock System</Logo>
        <Nav>
          <NavLink href="#home">Home</NavLink>
          <NavLink href="#about">About</NavLink>
          <Loginnav as={Link} to="/login">Login</Loginnav>
        </Nav>
      </HeaderContainer>
    );
  }
  
  export default Navbar;