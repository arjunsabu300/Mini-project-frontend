import * as React from 'react';
import PropTypes from 'prop-types';
import { Box, styled } from '@mui/system';
import { useTheme } from '@mui/material/styles';

function OTP({ separator, length, value, onChange }) {
  const inputRefs = React.useRef(new Array(length).fill(null));

  const focusInput = (targetIndex) => {
    const targetInput = inputRefs.current[targetIndex];
    targetInput?.focus();
  };

  const selectInput = (targetIndex) => {
    const targetInput = inputRefs.current[targetIndex];
    targetInput?.select();
  };

  const handleKeyDown = (event, currentIndex) => {
    switch (event.key) {
      case 'ArrowLeft':
        if (currentIndex > 0) {
          focusInput(currentIndex - 1);
          selectInput(currentIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (currentIndex < length - 1) {
          focusInput(currentIndex + 1);
          selectInput(currentIndex + 1);
        }
        break;
      case 'Backspace':
        onChange((prevOtp) => {
          const otp = prevOtp.slice(0, currentIndex) + prevOtp.slice(currentIndex + 1);
          return otp;
        });
        if (currentIndex > 0) {
          focusInput(currentIndex - 1);
          selectInput(currentIndex - 1);
        }
        break;
      default:
        break;
    }
  };

  const handleChange = (event, currentIndex) => {
    const currentValue = event.target.value;

    if (!/^\d*$/.test(currentValue)) return; // Allow only numbers

    const newOtp = value.split('');
    newOtp[currentIndex] = currentValue.slice(-1); // Take only the last character entered
    const updatedOtp = newOtp.join('');

    onChange(updatedOtp);

    if (currentValue !== '' && currentIndex < length - 1) {
      focusInput(currentIndex + 1);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {new Array(length).fill(null).map((_, index) => (
        <React.Fragment key={index}>
          <StyledInput
            ref={(ele) => (inputRefs.current[index] = ele)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] ?? ''}
            onKeyDown={(event) => handleKeyDown(event, index)}
            onChange={(event) => handleChange(event, index)}
          />
          {index === length - 1 ? null : separator}
        </React.Fragment>
      ))}
    </Box>
  );
}

OTP.propTypes = {
  length: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  separator: PropTypes.node,
  value: PropTypes.string.isRequired,
};

// Theme-based styling
const StyledInput = styled('input')(({ theme }) => ({
  width: '40px',
  padding: '8px',
  textAlign: 'center',
  fontSize: '1rem',
  borderRadius: '8px',
  border: `1px solid ${theme.palette.mode === 'dark' ? '#555' : '#ccc'}`,
  backgroundColor: theme.palette.mode === 'dark' ? '#222' : '#fff',
  color: theme.palette.mode === 'dark' ? '#fff' : '#000',
  '&:focus': {
    borderColor: '#007FFF',
    outline: 'none',
    boxShadow: '0 0 4px #007FFF',
  },
}));

export default OTP;