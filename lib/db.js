const sqlite = require("sqlite3").verbose()
let { promisify } = require("util")
let Memory = new sqlite.Database(":memory:")
let Db = new sqlite.Database("./lib/Sample.db")
const { log } = console
// exports our database for usage
let fileDb = Db //Db(err=>err?err:console.log('file database successfully connected'))
/// findOne item from
fileDb.run(
	"CREATE TABLE IF NOT EXISTS  users (names TEXT NOT NULL)",
	[],
	(err) => (err ? log(err.message) : log("table created successfully"))
)
function FindOne(name, table, filter) {
	let sql = `SELECT*from ${table} WHERE ${filter}=?`
	fileDb.all(sql, [name], (err, row) => {
		if (err) {
			return err.message
		}

		return row
	})
}
// function to insert one item into table
function InsertOne(name, table) {
	let sql = `INSERT INTO ${table} VALUES(?)`
	fileDb.run(sql, [name], (err, done) => {
		if (err) {
			return false
		}

		return true
	})
}
// function to remove item fro table
function Remove(name, table, filter) {
	let sql = `DELETE FROM ${table} WHERE ${filter} =?`
	fileDb.run(sql, [name], (err) => {
		if (err) {
			return false
		}

		return true
	})
}
//

function ShowAll(table) {
	fileDb.all(`SELECT* FROM ${table}`, [], (err, rows) => {
		if (err) {
			return err
		}

		return rows
	})
}
module.exports = { fileDb, FindOne, InsertOne, Remove, ShowAll, Memory }
