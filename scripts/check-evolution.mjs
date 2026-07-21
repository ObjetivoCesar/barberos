import axios from 'axios';

async function check() {
  try {
    const res = await axios.get("http://129.153.116.213:8080/instance/connectionState/barberos-saas", {
      headers: { apikey: "42a447c1-3d74-4b52-9571-042c174f7621" }
    });
    console.log("STATE:", res.data);
  } catch (error) {
    console.error("ERROR:", error.response ? error.response.data : error.message);
  }
}
check();
