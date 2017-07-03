function compareStrings(a, b) {
  // Assuming you want case-insensitive comparison
  a = a.toLowerCase();
  b = b.toLowerCase();

  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function alphabeticalOrder(data) {
	data.sort((a, b) => {
		return compareStrings(a.gname, b.gname);
	});

	return data;
}