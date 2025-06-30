function generateUsername() {
  const name = document.getElementById("name").value;
  const theme = document.getElementById("theme").value;
  const randomNumber = Math.floor(Math.random() * 1000);

  let suffixes = {
    cool: ["_x", "_pro", "_theboss", "_99"],
    funny: ["Banana", "Mango", "Noodle", "Lolz"],
    gamer: ["Slayer", "Sniper", "NoScope", "Hunter"],
    professional: ["_dev", "_tech", "_design", "_code"]
  };
  

  const suffixList = suffixes[theme];
  const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];

  const username = `${name}${suffix}${randomNumber}`;
  document.getElementById("result").innerText = `Generated Username: ${username}`;
}
function copyUsername() {
  const usernameText = document.getElementById("result").innerText.replace("Generated Username: ", "");
  navigator.clipboard.writeText(usernameText)
    .then(() => alert("Username copied to clipboard!"))
    .catch(err => alert("Failed to copy"));
}
document.getElementById("usernameCard").innerHTML = `<h2>${username}</h2>`;
function generateMultipleUsernames() {
  const name = document.getElementById("name").value;
  const theme = document.getElementById("theme").value;
  const suffixes = {
    cool: ["_x", "_pro", "_theboss", "_99"],
    funny: ["Banana", "Mango", "Noodle", "Lolz"],
    gamer: ["Slayer", "Sniper", "NoScope", "Hunter"],
    professional: ["_dev", "_tech", "_design", "_code"]
  };

  const suffixList = suffixes[theme];
  let listHTML = "";

  for (let i = 0; i < 5; i++) {
    const suffix = suffixList[Math.floor(Math.random() * suffixList.length)];
    const rand = Math.floor(Math.random() * 1000);
    listHTML += `<li>${name}${suffix}${rand}</li>`;
  }

  document.getElementById("usernameList").innerHTML = listHTML;
}
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}



