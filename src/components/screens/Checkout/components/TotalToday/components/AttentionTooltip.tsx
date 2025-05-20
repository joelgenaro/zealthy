import ClickAwayListener from '@mui/material/ClickAwayListener';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useState } from 'react';

interface AttentionTooltip {
  title: string;
}

const AttentionTooltip = ({ title }: AttentionTooltip) => {
  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(o => !o);
  };

  return (
    <ClickAwayListener onClickAway={handleTooltipClose}>
      <Tooltip
        PopperProps={{
          disablePortal: true,
        }}
        onClose={handleTooltipClose}
        open={open}
        disableFocusListener
        disableHoverListener
        disableTouchListener
        title={<Typography>{title}</Typography>}
        arrow
        placement="top-start"
      >
        <IconButton onClick={handleTooltipOpen}>
          <ErrorOutlineIcon />
        </IconButton>
      </Tooltip>
    </ClickAwayListener>
  );
};

export default AttentionTooltip;
