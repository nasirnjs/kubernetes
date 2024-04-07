import styled from "styled-components";

export const Title = styled.p<{
  font_size?: string;
  font_weight?: number;
  text_decoration?: string;
  color?: string;
}>`
  font-size: ${({ font_size }) => font_size};
  font-family: "ubuntu";
  font-weight: ${({ font_weight }) => font_weight};
  color:${({ color }) => color || "#4a4a4a"};
  margin: 0;
`;
