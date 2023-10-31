function deleteByName(arr, name) {
	/// find the element in arr
	let index = arr.indexOf(name)
	if (index > -1) {
		arr.splice(index, 1)
	}
}
module.exports = deleteByName
