import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ColorType, theme } from '../styles/colors';
import { colors, getRgba } from '../styles';

type ButtonProps = {
  children: React.ReactNode;
  theme?: ColorType;
  active?: boolean;
  disabled?: boolean;
  onClick?: (e?: React.KeyboardEvent<HTMLButtonElement>) => void;
  bgHighlight?: boolean;
};

const Button: React.FC<ButtonProps> = (props) => {
  const { children, theme = 'theme', onClick = () => {}, active = false, disabled = false, bgHighlight = false } = props;
  return (
    <StyledButton theme={theme} onClick={onClick} $active={active} $bgHighlight={bgHighlight} $disabled={disabled}>
      {children}
    </StyledButton>
  );
};

export default Button;

type StyledButtonProps = {
  children: React.ReactNode;
  theme: ColorType;
  $active: boolean;
  $bgHighlight: boolean;
  $disabled: boolean;
  onClick: (e?: React.KeyboardEvent<HTMLButtonElement>) => void;
};

const StyledButton = styled.button<StyledButtonProps>`
  height: 38px;
  padding: 8px 16px;
  border-radius: 8px;
  outline: none;
  border: 1px solid ${getRgba(colors.border)};
  background: ${(props) => getBackground(props)};
  color: #eee;
  cursor: ${(props) => (props.$disabled ? 'default' : 'pointer')};
  transition: 200ms;
  &:hover {
    background: ${(props) => getHoverBackground(props)};
  }
`;

const getBackground = ({ $disabled, theme, $bgHighlight, $active }: StyledButtonProps) => {
  if ($disabled) {
    return getRgba(colors.unactive);
  }
  if ($bgHighlight) {
    return getRgba(theme);
  }
  return $active ? getRgba(theme) : 'slategray';
};

const getHoverBackground = ({ $disabled, theme, $bgHighlight, $active }: StyledButtonProps) => {
  if ($disabled) {
    return getRgba(colors.unactive);
  }
  if ($bgHighlight) {
    return getRgba(theme);
  }
  return $active ? 'slategray' : getRgba(theme);
};
