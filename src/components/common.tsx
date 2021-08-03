import styled from "styled-components";

export const Page = styled.div`
//   min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const TextButton = styled.button`
  border: none;
  background-color: inherit;
  font-size: 22px;
  font-weight: 500;
  cursor: pointer;
  display: inline-block;
  color: ${(props) => props.color || "black"};
`;
