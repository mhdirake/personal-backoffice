import { Typography, Box } from "@mui/material";

export default function Home() {
  return (
    <Box sx={{ p: 4, textAlign: "center", mt: 10 }}>
      <Typography variant="h1">DevSignal</Typography>
      <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
        Signal Over Noise
      </Typography>
    </Box>
  );
}
