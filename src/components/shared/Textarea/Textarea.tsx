import { styled } from '@mui/system';
import { TextareaAutosize } from '@mui/material';

const Textarea = styled(TextareaAutosize)`
  font-family: 'Inter', sans-serif;
  background: #ffffff;
  border: 1px solid #cccccc;
  border-radius: 12px;
  resize: none;
  padding: 20px 24px;
  width: 100%;
  font-size: 16px;
`;

export default Textarea;
