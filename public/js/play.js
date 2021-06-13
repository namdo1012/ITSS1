const handleSaveScore = () => {
  const score = document.getElementById("score").innerHTML;
  const savedName = document.getElementById("saved-name").value;
  axios.post("/save-game", { score, savedName });
  window.location.href = "/";
};

const handleShowModal = () => {
  const score = document.getElementById("score").innerHTML;
  document.getElementById("score1").value = score;
};
