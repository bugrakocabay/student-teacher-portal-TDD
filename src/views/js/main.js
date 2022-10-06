async function loadIntoTable(url) {
	const tableBody = document.getElementById("myTable");
	const response = await fetch(url);
	const { content } = await response.json();

	const options = {
		day: "2-digit",
		year: "numeric",
		month: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
	};

	for (let i = 0; i < content.length; i++) {
		let dateToFormat = new Date(content[i].date);
		let status;
		let actions;
		let info = `<a class="btn btn-outline-dark" href="/classes/${content[i].id}" role="button">Info</a>`;

		if (content[i].status === "pending") {
			status = `<span class="badge rounded-pill text-bg-success">Pending</span>`;
			actions = `<a class="btn btn-primary" href="/classes/${content[i].id}/join" role="button">Join</a> `;
		} else {
			status = `<span class="badge rounded-pill text-bg-danger">Finished</span>`;
			actions = `<button type="button" class="btn btn-outline-danger">Closed</button>`;
		}

		let row = `<tr>
		<td>${content[i].id}</td>
		<td>${content[i].class_name}</td>
		<td>${dateToFormat.toLocaleString("tr-TR", options)}</td>
		<td>${status}</td>
		<td>${content[i].teacher}</td>
		<td>${info} ${actions}</td>
		</tr>`;

		tableBody.innerHTML += row;
	}
}

loadIntoTable("http://localhost:3000/api/v1/classes");

const myModal = document.getElementById("myModal");
const myInput = document.getElementById("myInput");

myModal.addEventListener("shown.bs.modal", () => {
	myInput.focus();
});
