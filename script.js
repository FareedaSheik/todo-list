function addItem() {
  const input = document.getElementById("itemInput");
  const text = input.value.trim();

  if (text === "") {
    alert("Please enter an item!");
    return;
  }

  const li = document.createElement("li");
  li.textContent = text;

  // Mark as done on click
  li.addEventListener("click", function () {
    li.classList.toggle("completed");
  });

  // Delete button
  const delBtn = document.createElement("button");
  delBtn.textContent = "X";
  delBtn.addEventListener("click", function (e) {
    e.stopPropagation(); // Prevent triggering 'completed'
    li.remove();
  });

  li.appendChild(delBtn);
  document.getElementById("itemList").appendChild(li);

  input.value = "";
}
