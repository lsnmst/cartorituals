import * as React from 'react';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Close from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
 
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function About() {
  const [open, setOpen] = React.useState(true);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>About</Button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        disableEnforceFocus
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <IconButton onClick={handleClose} className="closebutton">
              <Close />
            </IconButton>
            <Typography id="modal-modal-title-title" variant="h6" component="h2">
              RITUALS IN THE CARTOGRAPHIC PRACTICE<br /><br /><Divider light /><br />The visual archive
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Cartography is mainly a social process. No amount of high-resolution mapping can match the credibility and legitimacy of community-led /commons-oriented social mapping.
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              Assuming many ways of knowing and multiple systems of knowledge, cartographic making is a ritual that starts with a collective, political encounter.
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              The visual archive hosts social technology practices and participatory cartography from the Global South as an endogenous product of the multiple relationship between body-territory-language. It brings together traditions, organisational arrangements, local knowledge, the natural potential of the region, and its historical, economic, social and cultural reality.
            </Typography>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              -
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
              The archive was launched to gather resources from the workshop 'Rituals in the Cartographic Practice' organised in March 2023 at the Design Academy of Eindhoven.<br />The archive is dedicated to the territories belonging to Original Peoples who re-exist epistemic racism. 
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            </Typography>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
