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

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    
    return target.split(search).join(replacement);
};

function arrayInit(size, content)
{
    var arr = [];

    for (let i = 0; i < size; i++)
    {
        arr.push(content);
    }

    return arr;
}

Array.prototype.pushIfNotExists = function(elem) {
  let ret = false;

  if (this.indexOf(elem) === -1) {
    ret = true;
    this.push(elem);
  }

  return ret;
}