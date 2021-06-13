const handleSaveScore = () => {
	const score = document.getElementById("score").innerHTML;
  axios.post("/save-game", { score });
  window.location.href = "/";
};
