import app from "./app.js";
import { PORT } from "./config/config.js";

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
