import styled from "styled-components";
import Logo from "../../../../assets/Logo";
import { Title } from "../../../atoms/Title";

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    font-size: 3rem;
    color: red;
    font-weight: 500;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
`;
const Header = () => {
  return (
    <HeaderContainer>
      <LogoWrapper>
        <Logo />
        <Title font_size="2rem">
          e<span>T</span>icket
        </Title>
      </LogoWrapper>
    </HeaderContainer>
  );
};

export default Header;
